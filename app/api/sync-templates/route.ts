import { NextRequest, NextResponse } from "next/server";
import { getGoogleClients } from "../../../lib/googleClient";

// Original sheet base URL (the one you don't have edit access to)
const ORIGINAL_SHEET_BASE =
  "https://docs.google.com/spreadsheets/d/1CYlZX_-CjNvao7Gaowsk9tlSPzWfuflwK5vxpxN7oBs/pub?gid=";

// Your copy sheet ID (the one you control)
const YOUR_SHEET_ID = "18amnIJxs-O01CHZ--SNiveoP3wrKCrLgNpyPkkvAIy4";

// Category mappings with their gid values
const CATEGORY_GIDS = {
  "24 7 store": "81154121",
  "ammunition store": "536670718",
  atm: "1896199672",
  bars: "554665436",
  "car sharing": "1677731615",
  "chip tuning": "2124493753",
  "car wash": "1560289993",
  "clothing store": "1115970352",
  "electrical station": "890789305",
  family: "611727212",
  farm: "693525264",
  "gas station": "1752119158",
  "hair salon": "313635912",
  "jewellery store": "1913432171",
  "juice shop": "1340443336",
  "law firm": "1563186625",
  "misc/own business": "1861170946",
  office: "55176013",
  "oil well": "1090149393",
  organisation: "76653452",
  parking: "1397100388",
  "pet shop": "120656855",
  "service station": "488626062",
  "tattoo parlor": "1491755766",
  "taxi cab": "1643962212",
  warehouse: "366962962",
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
    for (const [categoryName, gid] of Object.entries(CATEGORY_GIDS)) {
      try {
        console.log(`📊 Syncing category: ${categoryName} (gid: ${gid})`);

        // Fetch from original sheet
        const originalUrl = `${ORIGINAL_SHEET_BASE}${gid}&single=true&output=csv`;
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
          const values = templates.map(template => [
            template.name,
            template.description,
            template.type
          ]);

          // Clear the existing data in the target sheet
          await sheets.spreadsheets.values.clear({
            spreadsheetId: YOUR_SHEET_ID,
            range: `${categoryName}!A:Z`,
          });

          // Write the new data
          await sheets.spreadsheets.values.update({
            spreadsheetId: YOUR_SHEET_ID,
            range: `${categoryName}!A1`,
            valueInputOption: "RAW",
            requestBody: {
              values: values
            },
          });

          console.log(`📝 Written ${templates.length} templates to ${categoryName} sheet`);
        }

        syncResults.push({
          category: categoryName,
          gid: gid,
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
          gid: gid,
          templateCount: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error occurred",
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
        details: error instanceof Error ? error.message : "Unknown error occurred" 
      },
      { status: 500 }
    );
  }
}
