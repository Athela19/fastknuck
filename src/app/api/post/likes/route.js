import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT 
        posts.id AS post_id,
        COUNT(DISTINCT likes.user_id) AS like_count,
        COUNT(DISTINCT comments.id) AS comment_count
      FROM posts
      LEFT JOIN likes ON posts.id = likes.post_id
      LEFT JOIN comments ON posts.id = comments.post_id
      GROUP BY posts.id
      ORDER BY posts.id;
    `);

    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to fetch like and comment counts' },
      { status: 500 }
    );
  }
}
