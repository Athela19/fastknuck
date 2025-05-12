// app/api/post/user-likes/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET() {
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

    // Query untuk mendapatkan post yang sudah di-like oleh user
    const { rows } = await pool.query(
      `SELECT post_id FROM likes WHERE user_id = $1`,
      [userId]
    );

    // Format response: array of post_id numbers
    const likedPostIds = rows.map(row => row.post_id);
    
    return NextResponse.json(likedPostIds);
  } catch (err) {
    console.error('Error fetching user likes:', err);
    
    if (err instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch user likes' },
      { status: 500 }
    );
  }
}