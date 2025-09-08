import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const { suggestion, timestamp } = await request.json();

    if (!suggestion || typeof suggestion !== "string") {
      return NextResponse.json(
        { error: "Suggestion is required and must be a string" },
        { status: 400 }
      );
    }

    if (suggestion.trim().length < 10) {
      return NextResponse.json(
        { error: "Suggestion must be at least 10 characters long" },
        { status: 400 }
      );
    }

    if (suggestion.trim().length > 2000) {
      return NextResponse.json(
        { error: "Suggestion must be less than 2000 characters" },
        { status: 400 }
      );
    }

    // Get client IP for basic tracking
    const clientIP = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";

    // Store suggestion in Firestore
    const suggestionData = {
      suggestion: suggestion.trim(),
      timestamp: timestamp || new Date().toISOString(),
      clientIP,
      status: "pending",
      createdAt: new Date(),
    };

    const docRef = await db.collection("suggestions").add(suggestionData);

    console.log("Suggestion submitted:", {
      id: docRef.id,
      suggestion: suggestion.trim().substring(0, 100) + "...",
      clientIP,
    });

    return NextResponse.json({
      success: true,
      message: "Suggestion submitted successfully",
      id: docRef.id,
    });

  } catch (error) {
    console.error("Error submitting suggestion:", error);
    return NextResponse.json(
      { 
        error: "Failed to submit suggestion",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // This endpoint could be used by admins to fetch suggestions
    // For now, we'll just return a simple response
    return NextResponse.json({
      message: "Suggestions API endpoint is working",
      note: "Use POST to submit suggestions"
    });
  } catch (error) {
    console.error("Error in suggestions GET:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
