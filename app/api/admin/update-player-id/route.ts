import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const { accessCodeId, newPlayerId } = await request.json();

    if (!accessCodeId || !newPlayerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Access code ID and new player ID are required",
        },
        { status: 400 }
      );
    }

    // Validate that the access code exists
    const accessCodeRef = db.collection("playerAccessCodes").doc(accessCodeId);
    const accessCodeDoc = await accessCodeRef.get();

    if (!accessCodeDoc.exists) {
      return NextResponse.json(
        { success: false, message: "Access code not found" },
        { status: 404 }
      );
    }

    // Update the player ID in Firebase
    await accessCodeRef.update({
      playerId: newPlayerId,
      lastUpdated: new Date(),
    });

    console.log(
      `✅ Player ID updated for access code ${accessCodeId}: ${newPlayerId}`
    );

    return NextResponse.json({
      success: true,
      message: `Player ID updated successfully to: ${newPlayerId}`,
    });
  } catch (error: any) {
    console.error("Error updating player ID:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to update player ID: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
