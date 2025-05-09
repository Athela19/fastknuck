// src/app/api/auth/[id]/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET User by ID
export async function GET(request, { params }) {
  const { id } = await params;
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// DELETE User by ID
export async function DELETE(request, { params }) {
  const { id } = await params;
  const client = await pool.connect();

  try {
    const result = await client.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'User deleted successfully', deletedUser: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// UPDATE User by ID
export async function PUT(request, { params }) {
    const { id } = await params;
    const client = await pool.connect();
  
    try {
      const { name, email, password } = await request.json();
  
      // Mendapatkan data pengguna saat ini untuk mengambil nilai 'name' jika tidak diubah
      const userResult = await client.query(
        'SELECT name FROM users WHERE id = $1',
        [id]
      );
  
      if (userResult.rows.length === 0) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }
  
      const currentName = userResult.rows[0].name;
  
      // Memperbarui query sesuai perubahan yang ada
      let query = "UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING *";
      let values = [name || currentName, email, password, id]; // Gunakan `name` yang ada jika tidak diubah
  
      // Jika hanya nama yang diubah, kita tidak perlu mengubah email dan password
      if (email && !password) {
        query = "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *";
        values = [name || currentName, email, id];
      } else if (!email && password) {
        query = "UPDATE users SET name = $1, password = $2 WHERE id = $3 RETURNING *";
        values = [name || currentName, password, id];
      }
  
      const result = await client.query(query, values);
  
      if (result.rows.length === 0) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { message: 'User updated successfully', updatedUser: result.rows[0] },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  }
  
  