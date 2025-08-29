// app/api/user-ads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@lib/firebaseAdmin"; // Ensure firebaseAdmin is correctly imported and initialized
import { FieldValue, Timestamp } from "firebase-admin/firestore";

// Helper to normalize text, duplicated for backend consistency
const normalizeSearchText = (text: string): string => {
  if (!text) return "";
  let normalized = text.toLowerCase();
  normalized = normalized.replace(/24\/7/g, "24 7");
  normalized = normalized.replace(/ammo store/g, "ammunition store");
  normalized = normalized.replace(/ammo/g, "ammunition");
  normalized = normalized.replace(/gun store/g, "ammunition store");
  normalized = normalized.replace(/gun/g, "ammunition");
  normalized = normalized.replace(/temp/g, "template");
  normalized = normalized.replace(/\bn\s*(\d+)/g, "$1");
  normalized = normalized.replace(/[^a-z0-9]+/g, " ");
  normalized = normalized.replace(/\s+/g, " ");
  return normalized.trim();
};

// Helper to convert Firestore Timestamp to ISO string
// This function will now always return a string.
const toISOString = (timestamp: FieldValue | Timestamp | undefined): string => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  // Return an empty string if it's undefined or FieldValue.serverTimestamp() before resolution
  return "";
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      console.error("[API/user-ads] GET: Missing userId parameter.");
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    }

    const userAdsRef = db.collection("userAds").doc(userId).collection("ads");

    console.log(`[API/user-ads] GET: Fetching ads for userId: ${userId}`);
    const snapshot = await userAdsRef.orderBy("createdAt", "desc").get();

    const ads = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: toISOString(data.createdAt as Timestamp), // Convert Timestamp to ISO string
        updatedAt: toISOString(data.updatedAt as Timestamp), // Convert Timestamp to ISO string
      };
    });

    console.log(
      `[API/user-ads] GET: Found ${ads.length} ads for userId: ${userId}`
    );
    return NextResponse.json(ads, { status: 200 });
  } catch (error) {
    console.error("[API/user-ads] GET: Error fetching user ads:", error);
    return NextResponse.json(
      { message: "Failed to fetch user ads", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      console.error("[API/user-ads] POST: Missing userId parameter.");
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    }

    const { name, description, type, category, displayCategory } =
      await request.json();

    if (!name || !description || !type || !category || !displayCategory) {
      console.error("[API/user-ads] POST: Missing required fields in payload.");
      return NextResponse.json(
        { message: "Missing required ad fields" },
        { status: 400 }
      );
    }

    const now = FieldValue.serverTimestamp(); // Use server timestamp for creation
    const newAdPayload = {
      // Renamed to newAdPayload to avoid confusion
      name,
      description,
      type,
      category,
      displayCategory,
      normalizedName: normalizeSearchText(name),
      normalizedDescription: normalizeSearchText(description),
      normalizedType: normalizeSearchText(type),
      userId,
      createdAt: now,
      updatedAt: now,
    };

    const userAdsRef = db.collection("userAds").doc(userId).collection("ads");
    console.log(`[API/user-ads] POST: Adding new ad for userId: ${userId}`);
    const docRef = await userAdsRef.add(newAdPayload);

    // After adding, fetch the newly created document to get the resolved server timestamps
    const addedDoc = await docRef.get();
    const addedData = addedDoc.data();

    if (addedData) {
      console.log(
        `[API/user-ads] POST: Ad added with ID: ${docRef.id}, returning resolved timestamps.`
      );
      return NextResponse.json(
        {
          id: docRef.id,
          ...addedData,
          createdAt: toISOString(addedData.createdAt as Timestamp),
          updatedAt: toISOString(addedData.updatedAt as Timestamp),
        },
        { status: 201 }
      );
    } else {
      console.error(
        `[API/user-ads] POST: Failed to retrieve data for newly added ad ${docRef.id}.`
      );
      // Fallback: If for some reason we can't retrieve the added doc immediately,
      // return a response with empty strings for timestamps to maintain type consistency.
      // Explicitly construct the response without spreading 'newAdPayload' to avoid FieldValue objects.
      return NextResponse.json(
        {
          id: docRef.id,
          name: newAdPayload.name,
          description: newAdPayload.description,
          type: newAdPayload.type,
          category: newAdPayload.category,
          displayCategory: newAdPayload.displayCategory,
          normalizedName: newAdPayload.normalizedName,
          normalizedDescription: newAdPayload.normalizedDescription,
          normalizedType: newAdPayload.normalizedType,
          userId: newAdPayload.userId,
          createdAt: "", // Explicitly return empty string
          updatedAt: "", // Explicitly return empty string
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("[API/user-ads] POST: Error adding user ad:", error);
    return NextResponse.json(
      { message: "Failed to add user ad", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const adId = searchParams.get("adId");

    if (!userId || !adId) {
      console.error("[API/user-ads] PUT: Missing userId or adId parameter.");
      return NextResponse.json(
        { message: "Missing userId or adId" },
        { status: 400 }
      );
    }

    const { name, description, type, category, displayCategory } =
      await request.json();

    if (!name || !description || !type || !category || !displayCategory) {
      console.error(
        "[API/user-ads] PUT: Missing required fields in payload for update."
      );
      return NextResponse.json(
        { message: "Missing required ad fields for update" },
        { status: 400 }
      );
    }

    const updatedAdData = {
      name,
      description,
      type,
      category,
      displayCategory,
      normalizedName: normalizeSearchText(name),
      normalizedDescription: normalizeSearchText(description),
      normalizedType: normalizeSearchText(type),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const adRef = db
      .collection("userAds")
      .doc(userId)
      .collection("ads")
      .doc(adId);
    console.log(
      `[API/user-ads] PUT: Updating adId: ${adId} for userId: ${userId}`
    );
    await adRef.update(updatedAdData);

    // Fetch the updated document to return the resolved server timestamp for updatedAt
    const updatedDoc = await adRef.get();
    const updatedData = updatedDoc.data();

    if (updatedData) {
      console.log(
        `[API/user-ads] PUT: Ad updated with ID: ${adId}, returning resolved timestamps.`
      );
      return NextResponse.json(
        {
          message: "Ad updated successfully",
          id: adId,
          ...updatedData,
          createdAt: toISOString(updatedData.createdAt as Timestamp), // Ensure consistency
          updatedAt: toISOString(updatedData.updatedAt as Timestamp),
        },
        { status: 200 }
      );
    } else {
      console.error(
        `[API/user-ads] PUT: Failed to retrieve data for updated ad ${adId}.`
      );
      return NextResponse.json(
        {
          message:
            "Ad updated successfully, but failed to retrieve updated data.",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    // FIX: Use 'adId' variable here
    console.error(`[API/user-ads] PUT: Error updating user ad ${adId}:`, error);
    return NextResponse.json(
      { message: "Failed to update user ad", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const adId = searchParams.get("adId");

    if (!userId || !adId) {
      console.error("[API/user-ads] DELETE: Missing userId or adId parameter.");
      return NextResponse.json(
        { message: "Missing userId or adId" },
        { status: 400 }
      );
    }

    const adRef = db
      .collection("userAds")
      .doc(userId)
      .collection("ads")
      .doc(adId);
    console.log(
      `[API/user-ads] DELETE: Deleting adId: ${adId} for userId: ${userId}`
    );
    await adRef.delete();

    console.log(`[API/user-ads] DELETE: Ad deleted with ID: ${adId}`);
    return NextResponse.json(
      { message: "Ad deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    // FIX: Use 'adId' variable here
    console.error(
      `[API/user-ads] DELETE: Error deleting user ad ${adId}:`,
      error
    );
    return NextResponse.json(
      { message: "Failed to delete user ad", error: (error as Error).message },
      { status: 500 }
    );
  }
}
