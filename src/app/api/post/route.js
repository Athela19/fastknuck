import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import path from 'path';
import { promises as fs } from 'fs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request) {
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

    // Dapatkan data dari form
    const formData = await request.formData();
    const file = formData.get('media');
    const description = formData.get('description');

    // Validasi input
    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    // Jika ada file, lakukan validasi dan simpan file
    let mediaUrl = null;
    if (file) {
      // Validasi tipe file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/mkv', 'video/x-matroska'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Only JPEG, PNG, WEBP images MKV and MP4 videos are allowed' },
          { status: 400 }
        );
      }

      // Buat direktori upload jika belum ada
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      // Generate nama file unik
      const ext = path.extname(file.name);
      const filename = `${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, filename);
      mediaUrl = `/uploads/${filename}`;

      // Simpan file
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);
    }

    // Simpan ke database
    const result = await pool.query(
      'INSERT INTO posts (description, media_url, user_id) VALUES ($1, $2, $3) RETURNING *',
      [description, mediaUrl, userId]
    );

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Error creating post:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Invalid token - Please login again' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM posts ORDER BY id DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
