import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request) {
  const client = await pool.connect();
  try {
    const { email, password } = await request.json();
    const result = await client.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );
    if (result.rows.length === 0) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    cookies().set("token", token,{
        httpOnly: true,
        maxAge: 60 * 60,
        path:"/"
    });
    return Response.json(
      {
        message: "Login successful",
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error); // Biar muncul di terminal
  return Response.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
