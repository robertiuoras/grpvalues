// app/api/cleanup-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const { accessCodeId } = await request.json();

    if (!accessCodeId || typeof accessCodeId !== "string") {
      console.log("API: cleanup-session - Missing or invalid accessCodeId");
      return NextResponse.json(
        { success: false, message: "Missing accessCodeId" },
        { status: 400 }
      );
    }

    console.log(
      `API: cleanup-session - Cleaning up session for: ${accessCodeId}`
    );

    // Get the document to check if it needs cleanup
    const codeRef = db.collection("playerAccessCodes").doc(accessCodeId);
    const doc = await codeRef.get();

    if (!doc.exists) {
      console.log(`API: cleanup-session - Document ${accessCodeId} not found`);
      return NextResponse.json(
        { success: false, message: "Access code not found" },
        { status: 404 }
      );
    }

    const docData = doc.data();

    // Only clean up non-admin codes that are marked as in use
    if (docData?.is_in_use && docData?.role !== "admin") {
      await codeRef.update({
        is_in_use: false,
      });
      console.log(
        `API: cleanup-session - Successfully marked ${accessCodeId} as not in use`
      );

      return NextResponse.json({
        success: true,
        message: "Session cleaned up successfully",
      });
    } else if (docData?.role === "admin") {
      console.log(
        `API: cleanup-session - Skipping cleanup for admin code ${accessCodeId}`
      );
      return NextResponse.json({
        success: true,
        message: "Admin code - no cleanup needed",
      });
    } else {
      console.log(
        `API: cleanup-session - Code ${accessCodeId} was already not in use`
      );
      return NextResponse.json({
        success: true,
        message: "Code was already available",
      });
    }
  } catch (error) {
    console.error("API: cleanup-session - Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
