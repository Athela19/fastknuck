import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import pool from '@/lib/db';
import jwt from 'jsonwebtoken'

export async function POST(req, context) {
  try {
    // Verifikasi token dari cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verifikasi JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Extract postId from params
    const idpost = await context.params;
    const postId = parseInt(idpost.postId);
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid postId' }, { status: 400 });
    }

    // Insert like into the database
    await pool.query(
      'INSERT INTO likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [postId, userId]
    );
    
    return NextResponse.json({ message: 'Liked' });
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    return NextResponse.json({ error: 'Error liking post' }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verifikasi JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Extract postId from params
    const postId = parseInt(params.postId);
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid postId' }, { status: 400 });
    }

    // Delete like from the database
    await pool.query(
      'DELETE FROM likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );

    return NextResponse.json({ message: 'Unliked' });
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    return NextResponse.json({ error: 'Error unliking post' }, { status: 400 });
  }
}
