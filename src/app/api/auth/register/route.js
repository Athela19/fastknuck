import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import {cookies} from "next/headers";
export async function POST(request) {
    const client = await pool.connect();
    try {
        const { name, email, password } = await request.json();
        const result = await client.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
            [name, email, password]
        );
        if(!email || !password || !name) {
            return Response.json({ message: "Registration failed" }, { status: 400 });
        }
        if (result.rows.length === 0) {
            return Response.json({ message: "Registration failed" }, { status: 400 });
        }
        const user = result.rows[0];
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        cookies().set("token", token, {
            httpOnly: true,
            maxAge: 60 * 60,
            path: "/",
        });
        return Response.json(
            {
                message: "Registration successful",
                token,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Registration error:", error); 
        return Response.json({ error: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}