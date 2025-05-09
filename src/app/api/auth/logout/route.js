import pool from "@/lib/db";
import { cookies } from "next/headers";

export async function POST() {
    try {
        cookies().delete("token");
        return Response.json({ message: "Logout successful" }, { status: 200 });
    } catch (error) {
        return Response.json({ message: "Logout failed" }, { status: 500 });
    }
}