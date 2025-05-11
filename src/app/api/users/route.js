// src/app/api/users/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  const client = await pool.connect();
  
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json({ message: 'Parameter ids diperlukan' }, { status: 400 });
    }

    const ids = idsParam.split(',').map(id => parseInt(id)).filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json({ message: 'Daftar ID tidak valid' }, { status: 400 });
    }

    const query = `SELECT id, name, profile_picture FROM users WHERE id = ANY($1::int[])`;
    const result = await client.query(query, [ids]);

    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
