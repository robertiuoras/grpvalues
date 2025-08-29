// app/api/values/[category]/route.ts
import { NextResponse } from "next/server";
import { db } from "@lib/firebaseAdmin.js"; // This import is critical for your Firestore instance

export async function GET(
  request: Request,
  context: { params: Promise<{ category: string }> }
) {
  const { category } = await context.params;
  const url = new URL(request.url);
  const gender = url.searchParams.get("gender"); // "men" or "women" for clothinglist
  const heading = url.searchParams.get("heading"); // e.g., "accessory", "top" for clothinglist
  const luminousType = url.searchParams.get("type"); // "shirts" or "pants" for luminousclothing

  console.log(
    `[API Request] Incoming: Category=${category}, Gender=${gender}, Heading=${heading}, LuminousType=${luminousType}`
  );

  if (!category) {
    console.error("[API Error] Missing category parameter.");
    return NextResponse.json({ message: "Missing category" }, { status: 400 });
  }

  // --- Critical Debugging Checks for 'db' instance ---
  if (!db) {
    console.error(
      "[API Error] Firestore 'db' instance is undefined or null upon entry. Check Firebase Admin SDK initialization in lib/firebaseAdmin.js."
    );
    return NextResponse.json(
      { message: "Server configuration error: Database not initialized." },
      { status: 500 }
    );
  }

  if (typeof db.collection !== "function") {
    console.error(
      "[API Error] 'db' object does not appear to be a valid Firestore instance. Missing 'collection' method."
    );
    return NextResponse.json(
      {
        message:
          "Server configuration error: Invalid database instance or incomplete initialization.",
      },
      { status: 500 }
    );
  }
  console.log(
    "[DB State Check] 'db' object appears valid (has .collection method)."
  );
  // --- End Debug Logging ---

  let collectionRef;

  try {
    // Explicitly disallow direct access to old luminous clothing pages
    if (category === "lumitshirt" || category === "lumipants") {
      console.log(
        `[API Info] Direct access to old category '${category}' is disallowed. Returning 404.`
      );
      return NextResponse.json(
        {
          message: `Category '${category}' not found. Please use '/values/luminousclothing'.`,
        },
        { status: 404 }
      );
    }

    if (category === "clothinglist") {
      if (!gender || !heading) {
        console.log(
          `[API Info] Clothinglist request missing gender or heading. Returning 400.`
        );
        return NextResponse.json(
          { message: "Missing gender or heading for clothinglist" },
          { status: 400 }
        );
      }
      // This path is for clothing items structured as: grpValues/clothinglist/{gender}/{heading}/items
      collectionRef = db
        .collection("grpValues")
        .doc(category) // 'clothinglist' document
        .collection(gender) // 'men' or 'women' subcollection
        .doc(heading) // Specific clothing type document (e.g., 'accessory')
        .collection("items"); // 'items' subcollection under that document
    } else if (category === "luminousclothing") {
      // Handle luminousclothing category
      if (
        !luminousType ||
        (luminousType !== "shirts" && luminousType !== "pants")
      ) {
        console.log(
          `[API Info] Luminousclothing request missing or invalid 'type' parameter. Returning 400.`
        );
        return NextResponse.json(
          {
            message:
              "Missing or invalid type for luminousclothing (must be 'shirts' or 'pants')",
          },
          { status: 400 }
        );
      }

      // FIX: Map luminousType to the original lumitshirt/lumipants documents
      // This assumes your Firestore structure has documents "lumitshirt" and "lumipants"
      // directly under "grpValues", and each has an "items" subcollection.
      const targetLuminousDoc =
        luminousType === "shirts" ? "lumitshirt" : "lumipants";

      collectionRef = db
        .collection("grpValues")
        .doc(targetLuminousDoc) // Use 'lumitshirt' or 'lumipants' as the document ID
        .collection("items"); // Access the 'items' subcollection within that document
    } else {
      // Consistent path for ALL other categories: grpValues/{category}/items
      collectionRef = db
        .collection("grpValues")
        .doc(category)
        .collection("items");
    }

    console.log(
      `[Firestore Query] Attempting to query path: ${collectionRef.path}`
    );
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
      console.log(
        `[Firestore Result] No items found for path: ${collectionRef.path}. Returning 404.`
      );
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const values = snapshot.docs.map((d) => d.data());
    console.log(
      `[Firestore Result] Successfully fetched ${values.length} items from path: ${collectionRef.path}. Returning 200.`
    );
    return NextResponse.json(values, { status: 200 });
  } catch (error: any) {
    console.error(
      `[API Critical Error] An error occurred during Firestore operation for category ${category}.`
    );
    console.error("Error details:", error);
    if (error.stack) {
      console.error("Error stack trace:", error.stack);
    }

    if (collectionRef && collectionRef.path) {
      console.error(
        `[API Critical Error] Problem was likely related to Firestore path: ${collectionRef.path}`
      );
    } else {
      console.error(
        `[API Critical Error] Problem occurred before Firestore path could be fully determined.`
      );
    }

    return NextResponse.json(
      {
        message: `An unexpected server error occurred while fetching data for category ${category}. Please check server logs for details.`,
        error: error.message || "Unknown server error",
      },
      { status: 500 }
    );
  }
}
