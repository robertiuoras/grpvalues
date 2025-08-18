"use server";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

interface Params {
  category: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { category } = params;

  if (!category) {
    return NextResponse.json(
      { message: "Category parameter is required." },
      { status: 400 }
    );
  }

  if (!db) {
    return NextResponse.json(
      { message: "Server error: Firestore not initialized." },
      { status: 500 }
    );
  }

  try {
    const collectionRef = db
      .collection("grpValues")
      .doc(category)
      .collection("items");
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
      return NextResponse.json(
        { message: `No values found for category: ${category}` },
        { status: 404 }
      );
    }

    const values = snapshot.docs.map((doc) => doc.data());

    return NextResponse.json(values, { status: 200 });
  } catch (err: any) {
    console.error(`Error fetching category "${category}":`, err);
    return NextResponse.json(
      {
        message: `Failed to fetch data for category "${category}".`,
        error: err.message,
      },
      { status: 500 }
    );
  }
}
