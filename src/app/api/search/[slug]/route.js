import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Search User by Name or Email
export async function GET(request, { params }) {
  const { slug } = params; // `slug` adalah parameter dinamis yang diterima di URL

  if (!slug) {
    return NextResponse.json(
      { message: 'Search query is required' },
      { status: 400 }
    );
  }

  const client = await pool.connect();

  try {
    console.log("Search query:", slug); // Log query untuk memastikan query diterima dengan benar

    const result = await client.query(
      'SELECT * FROM users WHERE name ILIKE $1 OR email ILIKE $1',
      [`%${slug}%`] // Mencari yang mengandung query (case-insensitive)
    );

    console.log("Search result:", result.rows); // Log hasil query untuk debugging

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'No users found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error during search:", error); // Log error
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
