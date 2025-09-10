import { NextRequest, NextResponse } from "next/server";
import { db } from "@lib/firebaseAdmin";

// Google Sheets URL for cars data
const CARS_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRjuFIpuM_5_WX-1OWOUegJ1adaTatCiFUFhFw0Nmodm5ZgljB-aSfWFMvVSTAmerdfFBfBKeW7syCV/pub?gid=0&single=true&output=csv";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Starting cars data sync...");

    // Fetch cars data from Google Sheets
    const response = await fetch(CARS_SHEET_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch cars data: ${response.status}`);
    }

    const csvText = await response.text();
    const lines = csvText.split("\n").filter((line) => line.trim());

    // Parse CSV data
    const carsData = lines
      .map((line, index) => {
        const columns = line.split(",");
        if (columns.length < 2) return null;

        const name = columns[0]?.trim();
        const value = columns[1]?.trim();
        const description = columns[2]?.trim() || "";

        if (!name || !value) return null;

        return {
          name,
          value,
          description,
          category: "cars",
          order: index,
        };
      })
      .filter(Boolean);

    console.log(`📊 Parsed ${carsData.length} cars from Google Sheets`);

    // Clear existing cars data
    const carsRef = db.collection("grpValues").doc("cars").collection("items");
    const existingSnapshot = await carsRef.get();
    
    if (!existingSnapshot.empty) {
      console.log("🗑️ Clearing existing cars data...");
      const batch = db.batch();
      existingSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    // Add new cars data to Firestore
    console.log("💾 Adding cars data to Firestore...");
    const batch = db.batch();
    
    carsData.forEach((car, index) => {
      const docRef = carsRef.doc();
      batch.set(docRef, {
        ...car,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    await batch.commit();

    console.log("✅ Cars data sync completed successfully");

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${carsData.length} cars`,
      count: carsData.length,
    });

  } catch (error) {
    console.error("❌ Cars sync error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Cars sync endpoint. Use POST to sync data.",
    method: "POST",
  });
}
