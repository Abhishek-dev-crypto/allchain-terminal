import { NextResponse } from "next/server";
import { getEdgeOpportunities } from "@/lib/intelligence/edgeOpportunities";

export async function GET() {
  try {
    const result =
      await getEdgeOpportunities();

    return NextResponse.json(
      result,
      {
        headers: {
          "Cache-Control":
            "public, max-age=30, stale-while-revalidate=60",
          "CDN-Cache-Control":
            "public, max-age=30",
        },
      }
    );
  } catch (error) {
    console.error(
      "Edge Opportunities API Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Edge opportunities unavailable",
      },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  }
}