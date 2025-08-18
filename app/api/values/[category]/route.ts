// app/api/values/[category]/route.ts
"use server";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

interface Params {
  params: {
    category: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  const { category } = params;

  console.log(`[API Route DEBUG] Request received for category: ${category}`);

  if (!category) {
    console.error(
      "[API Route ERROR] Category parameter is missing in request."
    );
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
    console.log(
      `[API Route DEBUG] Querying Firestore path: grpValues/${category}/items`
    );

    const snapshot = await collectionRef.get();
    console.log(
      `[API Route DEBUG] Snapshot received. Empty: ${snapshot.empty}, Docs: ${snapshot.size}`
    );

    const values: any[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(
        `[API Route DEBUG] Doc ID=${doc.id}, Data=${JSON.stringify(data)}`
      );
      values.push(data);
    });

    if (values.length === 0) {
      console.log(
        `[API Route INFO] No items found for category: ${category}. Returning 404.`
      );
      return NextResponse.json(
        { message: `No values found for category: ${category}` },
        { status: 404 }
      );
    }

    console.log(
      `[API Route INFO] Successfully fetched ${values.length} items for category: ${category}`
    );
    return NextResponse.json(values, { status: 200 });
  } catch (error: any) {
    console.error(
      `[API Route CRITICAL ERROR] Failed to fetch values for category ${category}:`,
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
