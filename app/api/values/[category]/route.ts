import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function GET(
  request: Request,
  context: { params: Promise<{ category: string }> }
) {
  const { category } = await context.params;

  if (!category) {
    return NextResponse.json({ message: "Missing category" }, { status: 400 });
  }

  const snapshot = await db
    .collection("grpValues")
    .doc(category)
    .collection("items")
    .get();

  if (snapshot.empty) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const values = snapshot.docs.map((d) => d.data());
  return NextResponse.json(values, { status: 200 });
}
