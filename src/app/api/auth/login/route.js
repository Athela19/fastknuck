import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";

export async function POST(request) {
  const client = await pool.connect();
  try {
    const { email, password } = await request.json();
    const result = await client.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // ✔️ Set cookie
    const response = NextResponse.json({
      message: "Login successful",
      token,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      maxAge: 60 * 60,
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
