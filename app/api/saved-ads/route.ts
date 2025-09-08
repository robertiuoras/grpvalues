import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/firebaseAdmin";

// Helper function to normalize search text
function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove special characters
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim();
}

// Helper function to get client identifier (IP + User Agent hash)
function getClientIdentifier(request: NextRequest): string {
  const clientIP = request.headers.get("x-forwarded-for") || 
                   request.headers.get("x-real-ip") || 
                   "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  
  // Create a simple hash of IP + User Agent for better identification
  const combined = `${clientIP}-${userAgent}`;
  return Buffer.from(combined).toString('base64').slice(0, 32);
}

export async function GET(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    
    console.log(`[API/saved-ads] GET: Fetching ads for clientId: ${clientId}`);
    
    const userAdsRef = db.collection("savedAds").doc(clientId).collection("ads");
    const snapshot = await userAdsRef.orderBy("createdAt", "desc").get();

    const ads = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });

    console.log(`[API/saved-ads] GET: Found ${ads.length} ads for clientId: ${clientId}`);
    return NextResponse.json(ads, { status: 200 });
  } catch (error) {
    console.error("[API/saved-ads] GET: Error fetching saved ads:", error);
    return NextResponse.json(
      { message: "Failed to fetch saved ads", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    const { name, description, type, category, displayCategory } = await request.json();

    if (!name || !description || !type || !category || !displayCategory) {
      console.error("[API/saved-ads] POST: Missing required fields in payload.");
      return NextResponse.json(
        { message: "Missing required ad fields" },
        { status: 400 }
      );
    }

    const now = new Date();
    const newAdPayload = {
      name,
      description,
      type,
      category,
      displayCategory,
      normalizedName: normalizeSearchText(name),
      normalizedDescription: normalizeSearchText(description),
      normalizedType: normalizeSearchText(type),
      clientId,
      createdAt: now,
      updatedAt: now,
    };

    const userAdsRef = db.collection("savedAds").doc(clientId).collection("ads");
    console.log(`[API/saved-ads] POST: Adding new ad for clientId: ${clientId}`);
    const docRef = await userAdsRef.add(newAdPayload);

    console.log(`[API/saved-ads] POST: Ad added with ID: ${docRef.id}`);
    return NextResponse.json(
      {
        id: docRef.id,
        ...newAdPayload,
        createdAt: newAdPayload.createdAt.toISOString(),
        updatedAt: newAdPayload.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API/saved-ads] POST: Error adding saved ad:", error);
    return NextResponse.json(
      { message: "Failed to add saved ad", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    const { searchParams } = new URL(request.url);
    const adId = searchParams.get("adId");

    if (!adId) {
      console.error("[API/saved-ads] PUT: Missing adId parameter.");
      return NextResponse.json(
        { message: "Missing adId" },
        { status: 400 }
      );
    }

    const { name, description, type, category, displayCategory } = await request.json();

    if (!name || !description || !type || !category || !displayCategory) {
      console.error("[API/saved-ads] PUT: Missing required fields in payload for update.");
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
      updatedAt: new Date(),
    };

    const adRef = db
      .collection("savedAds")
      .doc(clientId)
      .collection("ads")
      .doc(adId);
    
    console.log(`[API/saved-ads] PUT: Updating adId: ${adId} for clientId: ${clientId}`);
    await adRef.update(updatedAdData);

    // Fetch the updated document to return the resolved data
    const updatedDoc = await adRef.get();
    const updatedData = updatedDoc.data();

    if (updatedData) {
      console.log(`[API/saved-ads] PUT: Ad updated successfully with ID: ${adId}`);
      return NextResponse.json(
        {
          id: adId,
          ...updatedData,
          createdAt: updatedData.createdAt?.toDate?.()?.toISOString() || updatedData.createdAt,
          updatedAt: updatedData.updatedAt?.toDate?.()?.toISOString() || updatedData.updatedAt,
        },
        { status: 200 }
      );
    } else {
      console.error(`[API/saved-ads] PUT: Failed to retrieve updated ad ${adId}`);
      return NextResponse.json(
        { message: "Failed to retrieve updated ad" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[API/saved-ads] PUT: Error updating saved ad:", error);
    return NextResponse.json(
      { message: "Failed to update saved ad", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    const { searchParams } = new URL(request.url);
    const adId = searchParams.get("adId");

    if (!adId) {
      console.error("[API/saved-ads] DELETE: Missing adId parameter.");
      return NextResponse.json(
        { message: "Missing adId" },
        { status: 400 }
      );
    }

    const adRef = db
      .collection("savedAds")
      .doc(clientId)
      .collection("ads")
      .doc(adId);
    
    console.log(`[API/saved-ads] DELETE: Deleting adId: ${adId} for clientId: ${clientId}`);
    await adRef.delete();

    console.log(`[API/saved-ads] DELETE: Ad deleted with ID: ${adId}`);
    return NextResponse.json(
      { message: "Ad deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API/saved-ads] DELETE: Error deleting saved ad:", error);
    return NextResponse.json(
      { message: "Failed to delete saved ad", error: (error as Error).message },
      { status: 500 }
    );
  }
}
