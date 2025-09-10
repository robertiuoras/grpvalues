import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/firebaseAdmin";

export async function GET() {
  try {
    const doc = await db
      .collection("admin_settings")
      .doc("value_visibility")
      .get();

    if (doc.exists) {
      const data = doc.data();
      return NextResponse.json({
        hideValueField: data?.hideValueField || false,
        lastUpdated: data?.lastUpdated || null,
      });
    } else {
      // Default to showing values
      return NextResponse.json({
        hideValueField: false,
        lastUpdated: null,
      });
    }
  } catch (error) {
    console.error("Error fetching value visibility setting:", error);
    return NextResponse.json(
      { error: "Failed to fetch value visibility setting" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { hideValueField } = await request.json();

    if (typeof hideValueField !== "boolean") {
      return NextResponse.json(
        { error: "hideValueField must be a boolean" },
        { status: 400 }
      );
    }

    await db.collection("admin_settings").doc("value_visibility").set({
      hideValueField,
      lastUpdated: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      hideValueField,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating value visibility setting:", error);
    return NextResponse.json(
      { error: "Failed to update value visibility setting" },
      { status: 500 }
    );
  }
}
