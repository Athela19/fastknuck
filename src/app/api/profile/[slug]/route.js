import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET User by exact name or email (slug)
export async function GET(request, { params }) {
  const { slug } = params;
  const client = await pool.connect();

  try {
    const result = await client.query(
      'SELECT * FROM users WHERE name = $1 OR email = $1',
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
