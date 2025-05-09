import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

export async function GET() {
  const client = await pool.connect();
  try {
    // Ambil token dari cookies secara asinkron
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verifikasi token dan ambil user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Ambil data user berdasarkan ID
    const result = await client.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    // Kembalikan user yang relevan
    return Response.json(result.rows[0], { status: 200 });
  } catch (err) {
    console.error("GET /api/auth error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}
