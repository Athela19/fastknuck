import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUserId = decoded.id;

    const result = await pool.query(`
      WITH recent_conversations AS (
        SELECT 
          CASE 
            WHEN sender_id = $1 THEN receiver_id
            ELSE sender_id
          END AS other_user_id,
          MAX(created_at) AS last_message_time
        FROM messages
        WHERE sender_id = $1 OR receiver_id = $1
        GROUP BY other_user_id
        ORDER BY last_message_time DESC
        LIMIT 10
      )
      SELECT 
        rc.other_user_id,
        u.name AS other_user_name,
        u.profile_picture AS other_user_profile_picture,
        u.last_active_at > NOW() - INTERVAL '2 minutes' AS is_online,
        m.content AS last_message_content,
        m.sender_id AS last_message_sender,
        $1 AS current_user_id
      FROM recent_conversations rc
      JOIN users u ON rc.other_user_id = u.id
      JOIN messages m ON (
        (m.sender_id = $1 AND m.receiver_id = rc.other_user_id) OR
        (m.sender_id = rc.other_user_id AND m.receiver_id = $1)
      ) AND m.created_at = rc.last_message_time
    `, [currentUserId]);

    return NextResponse.json({ conversations: result.rows });
  } catch (error) {
    console.error('Error fetching recent conversations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}