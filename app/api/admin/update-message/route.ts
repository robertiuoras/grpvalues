import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/firebaseAdmin";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Fetch the current update message from Firestore
    const updateMessageRef = db
      .collection("admin_settings")
      .doc("update_message");
    const doc = await updateMessageRef.get();

    if (!doc.exists) {
      // Return default message if none exists
      return NextResponse.json({
        message:
          "🎉 <strong>Public Access Added!</strong> GRP Database is now fully public - no access codes required!",
        isActive: true,
        lastUpdated: new Date().toISOString(),
      });
    }

    const data = doc.data();
    return NextResponse.json({
      message:
        data?.message ||
        "🎉 <strong>Public Access Added!</strong> GRP Database is now fully public - no access codes required!",
      isActive: data?.isActive !== false,
      lastUpdated: data?.lastUpdated || new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching update message:", error);
    return NextResponse.json(
      { error: "Failed to fetch update message" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get("isAuthenticated")?.value;
    const userRole = cookieStore.get("userRole")?.value;

    if (!isAuthenticated || userRole !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { message, isActive } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    // Update the update message in Firestore
    const updateMessageRef = db
      .collection("admin_settings")
      .doc("update_message");
    await updateMessageRef.set({
      message: message.trim(),
      isActive: isActive !== false,
      lastUpdated: new Date().toISOString(),
      updatedBy: "admin", // You could get this from the auth context
    });

    return NextResponse.json({
      success: true,
      message: "Update message updated successfully",
    });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get("isAuthenticated")?.value;
    const userRole = cookieStore.get("userRole")?.value;

    if (!isAuthenticated || userRole !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Deactivate the update message
    const updateMessageRef = db
      .collection("admin_settings")
      .doc("update_message");
    await updateMessageRef.set(
      {
        isActive: false,
        lastUpdated: new Date().toISOString(),
        updatedBy: "admin",
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: "Update message deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating message:", error);
    return NextResponse.json(
      { error: "Failed to deactivate message" },
      { status: 500 }
    );
  }
}
