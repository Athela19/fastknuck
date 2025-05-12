import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request, { params }) {
  try {
    // First await the params object
    const { postId } = await params;
    const parsedPostId = parseInt(postId, 10);

    if (isNaN(parsedPostId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // Then await cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const likeQuery = `
      SELECT EXISTS(
        SELECT 1 FROM likes 
        WHERE user_id = $1 AND post_id = $2
      ) as liked;
    `;
    const likeResult = await pool.query(likeQuery, [userId, parsedPostId]);

    const countQuery = `
      SELECT COUNT(*) as like_count 
      FROM likes 
      WHERE post_id = $1
    `;
    const countResult = await pool.query(countQuery, [parsedPostId]);

    return NextResponse.json({
      liked: likeResult.rows[0].liked,
      like_count: parseInt(countResult.rows[0].like_count) || 0
    });

  } catch (err) {
    console.error('Error checking like status:', err);

    if (err instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to check like status',
        details: err.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}