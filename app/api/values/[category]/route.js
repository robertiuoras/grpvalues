// app/api/values/[category]/route.js
// This is a dynamic API route for all categories (cars, boats, planes, helicopters).

"use server"; // Ensure this route runs on the server

import { db } from "@/lib/firebaseAdmin"; // Import the initialized 'db'
import { NextResponse } from "next/server";

// Define the handler for GET requests
// The 'params' object will contain the dynamic segment, e.g., { category: 'cars' }
export async function GET(request, { params }) {
  const { category } = await params; // Extract the category from the URL (e.g., 'cars', 'boats')

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
    console.error(
      "[API Route ERROR] Firestore 'db' instance is undefined. Firebase Admin SDK might not have initialized correctly in lib/firebaseAdmin.js."
    );
    return NextResponse.json(
      {
        message:
          "Server configuration error: Database not initialized. Please check server logs and Firebase Admin SDK setup.",
      },
      { status: 500 }
    );
  }

  try {
    const firestorePath = `grpValues/${category}/items`;
    console.log(
      `[API Route DEBUG] Attempting to query Firestore path: ${firestorePath}`
    );

    const collectionRef = db
      .collection("grpValues")
      .doc(category)
      .collection("items");
    console.log(
      `[API Route DEBUG] Constructed collection reference. Now performing .get()`
    );

    const snapshot = await collectionRef.get();

    console.log(
      `[API Route DEBUG] Firestore snapshot received. Snapshot empty: ${snapshot.empty}, Number of docs: ${snapshot.size}`
    );

    const values = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(
        `[API Route DEBUG] Found document: ID=${doc.id}, Data=${JSON.stringify(
          data
        )}`
      );
      values.push(data);
    });

    console.log(
      `[API Route DEBUG] Final 'values' array length before sending: ${values.length}`
    );

    if (values.length === 0) {
      console.log(
        `[API Route INFO] No items found for category: ${category}. Returning 404 Not Found.`
      );
      return NextResponse.json(
        { message: `No values found for category: ${category}` },
        { status: 404 }
      );
    }

    console.log(
      `[API Route INFO] Successfully fetched ${values.length} items for category: ${category}. Returning 200 OK.`
    );
    return NextResponse.json(values, { status: 200 });
  } catch (error) {
    console.error(
      `[API Route CRITICAL ERROR] Failed to fetch values for category ${category} from Firestore:`,
      error
    );
    return NextResponse.json(
      {
        message: `An unexpected server error occurred while fetching data for category ${category}. Please check the server console logs for details.`,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
