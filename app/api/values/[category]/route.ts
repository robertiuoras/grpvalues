"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function GET(request: NextRequest) {
  try {
    // Extract category from the pathname
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/").filter(Boolean); // ['app', 'api', 'values', '[category]']
    const category = pathParts[pathParts.length - 1];

    console.log("[API DEBUG] Requested category:", category);

    if (!category) {
      console.error("[API ERROR] Missing category in URL");
      return NextResponse.json(
        { message: "Category parameter is required" },
        { status: 400 }
      );
    }

    if (!db) {
      console.error("[API ERROR] Firestore DB not initialized");
      return NextResponse.json(
        { message: "Server error: Firestore not initialized" },
        { status: 500 }
      );
    }

    const collectionRef = db
      .collection("grpValues")
      .doc(category)
      .collection("items");
    const snapshot = await collectionRef.get();

    console.log(`[API DEBUG] Firestore returned ${snapshot.size} documents`);

    if (snapshot.empty) {
      console.warn(`[API INFO] No values found for category: ${category}`);
      return NextResponse.json(
        { message: `No values found for category: ${category}` },
        { status: 404 }
      );
    }

    const values = snapshot.docs.map((doc) => doc.data());

    console.log(`[API DEBUG] Returning ${values.length} items`);
    return NextResponse.json(values, { status: 200 });
  } catch (err: any) {
    console.error("[API CRITICAL] Error fetching category:", err);
    return NextResponse.json(
      { message: "Unexpected server error", error: err.message },
      { status: 500 }
    );
  }
}
