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

        // Parse templates for this category using proper CSV parsing
        const templates = lines
          .map((line, index) => {
            // Simple CSV parser that handles quoted fields
            const parseCSVLine = (line: string) => {
              const result = [];
              let current = '';
              let inQuotes = false;
              
              for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '"') {
                  inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                  result.push(current.trim());
                  current = '';
                } else {
                  current += char;
                }
              }
              
              result.push(current.trim());
              return result;
            };

            const parts = parseCSVLine(line);
            return {
              name: parts[0] || "",
              description: parts[1] || "",
              type: parts[2] || "",
              originalRow: index + 1, // Keep track of original row position
              category: categoryName,
            };
          })
          .filter((template) => template.name && template.description);

        console.log(`✅ ${categoryName}: ${templates.length} templates found`);

        // Write to your copy sheet with incremental updates
        if (templates.length > 0) {
          // Get existing data from the target sheet
          let existingData: string[][] = [];
          try {
            const existingResponse = await sheets.spreadsheets.values.get({
              spreadsheetId: YOUR_SHEET_ID,
              range: `${categoryData.sheetName}!A:C`,
            });
            existingData = existingResponse.data.values || [];
          } catch (error) {
            console.log(`📝 No existing data found for ${categoryData.sheetName}, will create new`);
          }

          // Convert new templates to array format for Google Sheets, preserving original row positions
          const newValues = templates.map((template) => [
            template.name,
            template.description,
            template.type,
          ]);

          // Create a map of row positions to preserve gaps
          const rowMap = new Map<number, string[]>();
          templates.forEach((template, index) => {
            rowMap.set(template.originalRow, newValues[index]);
          });

          // Find the maximum row number to determine the range
          const maxRow = Math.max(...templates.map(t => t.originalRow));

          // Compare existing data with new data to find differences
          const changes = [];
          let hasChanges = false;

          // Check for new or updated templates (comparing by name and position)
          for (const [rowNum, newTemplate] of rowMap) {
            const existingTemplate = existingData[rowNum - 1]; // Convert to 0-based index

            if (!existingTemplate) {
              // New template
              changes.push({ type: 'new', data: newTemplate, row: rowNum });
              hasChanges = true;
            } else if (
              existingTemplate[0] !== newTemplate[0] ||
              existingTemplate[1] !== newTemplate[1] ||
              existingTemplate[2] !== newTemplate[2]
            ) {
              // Updated template
              changes.push({ type: 'updated', data: newTemplate, row: rowNum });
              hasChanges = true;
            }
          }

          // Check for removed templates (templates that exist in copy but not in original)
          for (let i = 0; i < existingData.length; i++) {
            const existingTemplate = existingData[i];
            const originalRow = i + 1;
            const stillExists = rowMap.has(originalRow);
            
            if (!stillExists && existingTemplate[0]) {
              changes.push({ type: 'removed', data: existingTemplate, row: originalRow });
              hasChanges = true;
            }
          }

          if (hasChanges) {
            // Retry logic for sheet operations (handles locks)
            const maxRetries = 3;
            let retryCount = 0;
            let success = false;

            while (retryCount < maxRetries && !success) {
              try {
                // Clear the existing data in the target sheet
                await sheets.spreadsheets.values.clear({
                  spreadsheetId: YOUR_SHEET_ID,
                  range: `${categoryData.sheetName}!A:Z`,
                });

                // Write data at specific row positions to preserve gaps
                for (const [rowNum, templateData] of rowMap) {
                  await sheets.spreadsheets.values.update({
                    spreadsheetId: YOUR_SHEET_ID,
                    range: `${categoryData.sheetName}!A${rowNum}:C${rowNum}`,
                    valueInputOption: "RAW",
                    requestBody: {
                      values: [templateData],
                    },
                  });
                }

                console.log(
                  `📝 Updated ${categoryData.sheetName} sheet: ${changes.length} changes (${changes.filter(c => c.type === 'new').length} new, ${changes.filter(c => c.type === 'updated').length} updated, ${changes.filter(c => c.type === 'removed').length} removed)`
                );
                success = true;
              } catch (error: any) {
                retryCount++;
                const errorMessage = error.message || 'Unknown error';
                
                if (errorMessage.includes('locked') || errorMessage.includes('conflict') || errorMessage.includes('429')) {
                  console.log(`⚠️ Sheet ${categoryData.sheetName} is locked or rate limited, retrying... (${retryCount}/${maxRetries})`);
                  
                  if (retryCount < maxRetries) {
                    // Wait before retrying (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
                  } else {
                    throw new Error(`Sheet ${categoryData.sheetName} is locked after ${maxRetries} retries: ${errorMessage}`);
                  }
                } else {
                  throw error;
                }
              }
            }
          } else {
            console.log(`✅ ${categoryData.sheetName} sheet is already up to date`);
          }
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

        // Add a small delay between categories to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));
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
        
        // Add delay even for failed categories
        await new Promise(resolve => setTimeout(resolve, 500));
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
