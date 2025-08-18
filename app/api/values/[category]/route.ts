// app/api/values/[category]/route.ts
"use server";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } } // Correct type here
) {
  const { category } = params;

  console.log(`[API Route DEBUG] Request received for category: ${category}`);

  if (!category) {
    console.error("[API Route ERROR] Category parameter is missing.");
    return NextResponse.json(
      { message: "Category parameter is missing" },
      { status: 400 }
    );
  }

  if (!db) {
    console.error("[API Route ERROR] Firestore `db` instance is undefined.");
    return NextResponse.json(
      { message: "Server configuration error: Database not initialized." },
      { status: 500 }
    );
  }

  try {
    const collectionRef = db
      .collection("grpValues")
      .doc(category)
      .collection("items");

    const snapshot = await collectionRef.get();

    const values: any[] = [];
    snapshot.forEach((doc) => values.push(doc.data()));

    if (values.length === 0) {
      return NextResponse.json(
        { message: `No values found for category: ${category}` },
        { status: 404 }
      );
    }

    return NextResponse.json(values, { status: 200 });
  } catch (error: any) {
    console.error(
      `[API Route ERROR] Failed to fetch values for category ${category}:`,
      error
    );
    return NextResponse.json(
      {
        message: `Unexpected server error fetching data for category ${category}.`,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
