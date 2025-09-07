import { NextRequest, NextResponse } from "next/server";
import { getGoogleClients } from "../../../lib/googleClient";

// Original sheet base URL (the one you don't have edit access to)
const ORIGINAL_SHEET_BASE =
  "https://docs.google.com/spreadsheets/d/1CYlZX_-CjNvao7Gaowsk9tlSPzWfuflwK5vxpxN7oBs/export?format=csv&gid=";

// Your copy sheet ID (the one you control)
const YOUR_SHEET_ID = "18amnIJxs-O01CHZ--SNiveoP3wrKCrLgNpyPkkvAIy4";

// Category mappings with their gid values and correct sheet names
const CATEGORY_GIDS = {
  "24 7 store": { gid: "81154121", sheetName: "24/7 Store" },
  "ammunition store": { gid: "536670718", sheetName: "Ammunition Store" },
  atm: { gid: "1896199672", sheetName: "ATM" },
  bars: { gid: "554665436", sheetName: "Bars" },
  "car sharing": { gid: "1677731615", sheetName: "Car Sharing" },
  "chip tuning": { gid: "2124493753", sheetName: "Chip Tuning" },
  "car wash": { gid: "1560289993", sheetName: "Car Wash" },
  "clothing store": { gid: "1115970352", sheetName: "Clothing Store" },
  "electrical station": { gid: "890789305", sheetName: "Electrical Station" },
  family: { gid: "611727212", sheetName: "Family" },
  farm: { gid: "693525264", sheetName: "Farm" },
  "gas station": { gid: "1752119158", sheetName: "Gas Station" },
  "hair salon": { gid: "313635912", sheetName: "Hair Salon" },
  "jewellery store": { gid: "1913432171", sheetName: "Jewelry Store" },
  "juice shop": { gid: "1340443336", sheetName: "Juice Shop" },
  "law firm": { gid: "1563186625", sheetName: "Law Firm" },
  "misc/own business": { gid: "1861170946", sheetName: "Misc / Own Business" },
  office: { gid: "55176013", sheetName: "Office" },
  "oil well": { gid: "1090149393", sheetName: "Oil Well" },
  organisation: { gid: "76653452", sheetName: "Organisation" },
  parking: { gid: "1397100388", sheetName: "Parking" },
  "pet shop": { gid: "120656855", sheetName: "Pet Shop" },
  "service station": { gid: "488626062", sheetName: "Service Station" },
  "tattoo parlor": { gid: "1491755766", sheetName: "Tattoo Parlor" },
  "taxi cab": { gid: "1643962212", sheetName: "Taxi Cab" },
  warehouse: { gid: "366962962", sheetName: "Warehouse" },
};

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Starting comprehensive template sync...");

    // Get Google Sheets API client
    const { sheets } = await getGoogleClients();

    const syncResults = [];
    let totalTemplates = 0;
    let successCount = 0;
    let errorCount = 0;

    // Sync each category individually
    for (const [categoryName, categoryData] of Object.entries(CATEGORY_GIDS)) {
      try {
        console.log(`📊 Syncing category: ${categoryName} (gid: ${categoryData.gid})`);

        // Fetch from original sheet
        const originalUrl = `${ORIGINAL_SHEET_BASE}${categoryData.gid}`;
        const originalResponse = await fetch(originalUrl);

        if (!originalResponse.ok) {
          throw new Error(
            `Failed to fetch ${categoryName}: ${originalResponse.status}`
          );
        }

        const originalData = await originalResponse.text();
        const lines = originalData.split("\n").filter((line) => line.trim());

        // Parse templates for this category
        const templates = lines
          .map((line, index) => {
            const parts = line.split(",").map((part) => part.trim());
            return {
              name: parts[0] || "",
              description: parts[1] || "",
              type: parts[2] || "",
              row: index + 1,
              category: categoryName,
            };
          })
          .filter((template) => template.name && template.description);

        console.log(`✅ ${categoryName}: ${templates.length} templates found`);

        // Write to your copy sheet
        if (templates.length > 0) {
          // Convert templates to array format for Google Sheets
          const values = templates.map((template) => [
            template.name,
            template.description,
            template.type,
          ]);

          // Clear the existing data in the target sheet
          await sheets.spreadsheets.values.clear({
            spreadsheetId: YOUR_SHEET_ID,
            range: `${categoryData.sheetName}!A:Z`,
          });

          // Write the new data
          await sheets.spreadsheets.values.update({
            spreadsheetId: YOUR_SHEET_ID,
            range: `${categoryData.sheetName}!A1`,
            valueInputOption: "RAW",
            requestBody: {
              values: values,
            },
          });

          console.log(
            `📝 Written ${templates.length} templates to ${categoryData.sheetName} sheet`
          );
        }

        syncResults.push({
          category: categoryName,
          gid: categoryData.gid,
          templateCount: templates.length,
          success: true,
          templates: templates,
        });

        totalTemplates += templates.length;
        successCount++;
      } catch (error) {
        console.error(`❌ Error syncing ${categoryName}:`, error);
        syncResults.push({
          category: categoryName,
          gid: categoryData.gid,
          templateCount: 0,
          success: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
        errorCount++;
      }
    }

    console.log(
      `🎉 Sync completed: ${successCount}/${
        Object.keys(CATEGORY_GIDS).length
      } categories, ${totalTemplates} total templates`
    );

    return NextResponse.json({
      success: true,
      message: `Synced ${successCount} categories with ${totalTemplates} total templates`,
      data: {
        syncResults,
        totalTemplates,
        successCount,
        errorCount,
        lastSync: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Sync error:", error);
    return NextResponse.json(
      {
        error: "Failed to sync templates",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
