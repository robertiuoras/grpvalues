// app/api/heartbeat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@lib/firebaseAdmin";
import { cookies } from "next/headers";

/**
 * Heartbeat endpoint to keep access codes active and prevent them from getting "stuck"
 * This is called every 2 minutes by the useAuth hook to maintain session freshness
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get("isAuthenticated")?.value;
    const userId = cookieStore.get("userId")?.value;

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { accessCodeId } = await request.json();

    if (!accessCodeId || accessCodeId !== userId) {
      return NextResponse.json(
        { success: false, message: "Invalid access code ID" },
        { status: 400 }
      );
    }

    // Update the lastUsed timestamp to keep the code active
    const codeRef = db.collection("playerAccessCodes").doc(accessCodeId);
    await codeRef.update({
      lastUsed: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Heartbeat received",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Heartbeat API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
