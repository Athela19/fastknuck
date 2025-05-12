import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// GET: Ambil komentar
export async function GET(req, context) {
  try {
    const { params } = context;
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const postId = parseInt(params.postId);
    const { rows } = await pool.query(`
      SELECT comments.*, users.name 
      FROM comments 
      JOIN users ON comments.user_id = users.id 
      WHERE post_id = $1 
      ORDER BY created_at DESC
    `, [postId]);

    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST: Tambah komentar
export async function POST(req, context) {
  try {
    const { params } = context;
    const postId = parseInt(params.postId);
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { content } = await req.json();

    const result = await pool.query(`
      INSERT INTO comments (post_id, user_id, content) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `, [postId, userId, content]);

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
