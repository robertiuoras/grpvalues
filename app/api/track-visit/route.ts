import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const { ip, userAgent, timestamp, page } = await request.json();

    // Record this visit
    await db.collection("visitor_logs").add({
      ip,
      userAgent,
      timestamp,
      page,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking visit:", error);
    return NextResponse.json(
      { error: "Failed to track visit" },
      { status: 500 }
    );
  }
}
