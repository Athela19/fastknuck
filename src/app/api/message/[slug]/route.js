import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

// Helper function to check online status (last activity within 2 minutes)
const checkOnlineStatus = async (userId) => {
  const result = await pool.query(
    'SELECT last_active_at FROM users WHERE id = $1',
    [userId]
  );
  if (result.rows.length === 0) return false;
  
  const lastActive = result.rows[0].last_active_at;
  return new Date() - new Date(lastActive) < 120000; // 2 minutes
};

export async function GET(request, context) {
  try {
    const { slug: receiverName } =await context.params;
    const tokenStore = await cookies();
    const token = tokenStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Update user's last active time
    await pool.query(
      'UPDATE users SET last_active_at = NOW() WHERE id = $1',
      [userId]
    );

    // Get receiver info including online status
    const receiverResult = await pool.query(
      'SELECT id, name, profile_picture, last_active_at FROM users WHERE name = $1',
      [receiverName]
    );
    
    if (receiverResult.rows.length === 0) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
    }

    const receiver = receiverResult.rows[0];
    const isOnline = await checkOnlineStatus(receiver.id);

    // Get messages
    const messagesResult = await pool.query(
      `SELECT 
        m.*,
        u1.profile_picture as sender_profile_picture,
        u2.profile_picture as receiver_profile_picture
       FROM messages m
       JOIN users u1 ON m.sender_id = u1.id
       JOIN users u2 ON m.receiver_id = u2.id
       WHERE (m.sender_id = $1 AND m.receiver_id = $2)
          OR (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.created_at ASC`,
      [userId, receiver.id]
    );

    return NextResponse.json({ 
      messages: messagesResult.rows,
      recipient: {
        id: receiver.id,
        name: receiver.name,
        profile_picture: receiver.profile_picture,
        is_online: isOnline
      }
    });

  } catch (error) {
    console.error('GET /message/[slug] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { slug: receiverName } = context.params;
    const tokenStore = await cookies();
    const token = tokenStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const senderId = decoded.id;

    // Update user's last active time
    await pool.query(
      'UPDATE users SET last_active_at = NOW() WHERE id = $1',
      [senderId]
    );

    const { content } = await request.json();
    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 });
    }

    // Get receiver
    const receiverResult = await pool.query(
      'SELECT id FROM users WHERE name = $1',
      [receiverName]
    );
    
    if (receiverResult.rows.length === 0) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
    }

    const receiverId = receiverResult.rows[0].id;

    // Insert message and mark as unread
    const insertResult = await pool.query(
      `INSERT INTO messages (content, sender_id, receiver_id, is_read)
       VALUES ($1, $2, $3, false)
       RETURNING *`,
      [content, senderId, receiverId]
    );

    return NextResponse.json({ 
      success: true, 
      message: insertResult.rows[0] 
    });

  } catch (error) {
    console.error('POST /message/[slug] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}