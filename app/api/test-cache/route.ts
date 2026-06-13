import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();

export async function GET() {
  try {
    await redis.set("test", "hello");
    const value = await redis.get("test");

    return NextResponse.json({
      success: true,
      value,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: String(err),
    });
  }
}