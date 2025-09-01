import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../../../lib/firebaseAdmin";

// Firestore feedback storage functions
interface FeedbackEntry {
  originalInput: string;
  aiResponse: string;
  userCorrection: string;
  timestamp: Date;
  category: string;
  adType?: string;
  formatPattern?: string;
}

// Store feedback in Firestore
async function storeFeedback(feedback: FeedbackEntry): Promise<void> {
  try {
    await db.collection("ai_feedback").add({
      ...feedback,
      timestamp: new Date(), // Ensure timestamp is a Firestore timestamp
    });
    console.log(
      `📝 Feedback stored in Firestore for category: ${feedback.category}`
    );
  } catch (error) {
    console.error("Error storing feedback in Firestore:", error);
    throw error;
  }
}

// Get relevant feedback from Firestore
async function getRelevantFeedbackFromFirestore(
  adContent: string,
  category: string,
  limit: number = 3
): Promise<FeedbackEntry[]> {
  try {
    // Get feedback for the specific category
    const categoryQuery = await db
      .collection("ai_feedback")
      .where("category", "==", category)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    const feedbacks: FeedbackEntry[] = [];
    categoryQuery.forEach((doc) => {
      const data = doc.data();
      feedbacks.push({
        originalInput: data.originalInput,
        aiResponse: data.aiResponse,
        userCorrection: data.userCorrection,
        timestamp: data.timestamp.toDate(), // Convert Firestore timestamp to Date
        category: data.category,
        adType: data.adType,
        formatPattern: data.formatPattern,
      });
    });

    // If we don't have enough category-specific feedback, get some from other categories
    if (feedbacks.length < limit) {
      const remainingLimit = limit - feedbacks.length;
      const generalQuery = await db
        .collection("ai_feedback")
        .orderBy("timestamp", "desc")
        .limit(remainingLimit)
        .get();

      generalQuery.forEach((doc) => {
        const data = doc.data();
        // Only add if not already in the list
        const exists = feedbacks.some(
          (f) =>
            f.originalInput === data.originalInput &&
            f.aiResponse === data.aiResponse
        );
        if (!exists) {
          feedbacks.push({
            originalInput: data.originalInput,
            aiResponse: data.aiResponse,
            userCorrection: data.userCorrection,
            timestamp: data.timestamp.toDate(),
            category: data.category,
            adType: data.adType,
            formatPattern: data.formatPattern,
          });
        }
      });
    }

    return feedbacks;
  } catch (error) {
    console.error("Error getting feedback from Firestore:", error);
    return []; // Return empty array on error
  }
}

// Function to fetch policy documents from Google APIs
async function fetchPolicyDocuments(): Promise<{
  policy: string;
  vehicleList: string;
  motorcyclesList: string;
  boatsPlanesList: string;
  clothingList: string;
  itemsList: string;
}> {
  try {
    const { google } = require("googleapis");

    // Initialize Google Auth with service account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: "test123-465815",
        private_key_id: "7d10410caae0693c1ea0c67e0a1e1b3bd675cc89",
        private_key:
          "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCyMWD9GP1MsWqM\n8EbbvtU5r/8Dg4OEUdp1/V0ulVD3gywdJFfyn3J2dRsOif8f0gx6fvk/bzGPL1Ce\nDnv2aWdCNf57sOi05jCQ1cef4AMNKV55HO5pZzR1xxpZNeL+JPt5EOHbPpkOZ63Z\nVB19K+g5GhMybeiAeLGAIYIFsG6O4IwK2P83qOW8wUBs5wAWnfukzqJG+lGHf6JY\nd3gL3t8yQXAllbOWPjiOkDA6cRPmDpxtMrsqKhB3JN6LEAzCotuppX1YWIF+AxSI\nzXCvL8IniONggsyVcN51pQ0WZrET3b83rXsnmlMP11ifrQoJY3CQik1fyxgldio5\nHpmY8B0tAgMBAAECggEAFx+aRu3NvPyO56AsicqPT++bR6Dy2aJnl4Ub6PYebiga\n+uMi+IyhZWbX7oCQ11fCH8lHXeh3hW2t5/zYMEdIS4rHLdTstcDjT4A2afQ/YR9b\nr5rGA26Nm7UNIcOA49r3uSOsM2/Bm+FvaXLlar9eYL6V/CbQE4/V9NskTMmy5x5b\nh6gnObWxO5D0ozNQM9yd3ikuRZPThbAsx5EVGgDG5XfhH4Z8sZYVRFtR7jKDBa9R\nLGFMW+qFVpv30YXQu+iuJk8QjbtmY/OhnM6Dr5NBjnf5je3AUyBvFQ6HlVF0VEz9\nZ5SR2dnUS0L6fx8LEQA9qTuuPMcktBL3m4n8Xddt4QKBgQD1N9hghLX4zXeti8e5\n3fFmnS+UkOQk4Zx9nTumHbj9NtVaBoMyTPF7IJQGEBhw0r9uxHcvAcM3sm95hvr0\n6J7ySeK0jDykqQfksggM66GS0Z0qYGp9hlShY8bSNKJO6u+IiG/xeYic+0xtsKji\nHvbN163ylgxT6uSeGqgAIonP3QKBgQC6BxpcRMd13A/RRolLomlu8Vg2EeTVrwhC\nhllf9m36t+VRfB0E29OZnEOG9+1343uFvu74FL+6vO7gQKxRAg2aRGB9yjqXwMRq\nNUGqMv5ik7f6JLRZNPxLWnR6fcxXRTtIaY5B8zE9Cd0HA/sazhq9MoWG8tKS8hvM\njTCKYwFVkQKBgGJQ9awdCWir2KP4OyfGWJcvxnfmb9JpsniapePAXv8HERt7KPbt\n6pPXSAH2ShZSKPacRrzOFBssq40qFUxESBYUkZSZ9WZ/bu6+goPLpYhcCouHBKs3\nRI9AleKJv9msUEWJjnhepetqxgXkopGmoIV/R/rPNjofH3JUda84KdDxAoGBAI9h\nxCaT+KzV9fcWh+IdB2i0aooaVqeApjwoMyDs3q3dKcoZgIBrMvf14nJYC9dZJa7b\nkHL0AydaUj/UeTxi+bsKstihk3G96WX3MGqPrVSriKUrvzn2xfMKgDadWW92dBAH\nE9evKydhv9OVdOifLSrgktyFsloCc/zAYkZ3suKRAoGAGOs0l2df4yEjhDn3B6NN\nZnsiTOJtAZ172r4XbOgwmeG9lm+2tGvd4F8ODOuCdbmmZxtqMjFPph8q/fpD51z7\nFVk+Dhu1fnpMK4e6qr0OM2O4jT1uS8nEF3WHYS5lhcRnUcufZQegrRPJRxFxb2hy\n6ICoi604f6Q+Hz6Q3YUxq0A=\n-----END PRIVATE KEY-----\n",
        client_email: "project@test123-465815.iam.gserviceaccount.com",
        client_id: "100036543159103601272",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
          "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url:
          "https://www.googleapis.com/robot/v1/metadata/x509/project%40test123-465815.iam.gserviceaccount.com",
        universe_domain: "googleapis.com",
      },
      scopes: [
        "https://www.googleapis.com/auth/documents.readonly",
        "https://www.googleapis.com/auth/spreadsheets.readonly",
      ],
    });

    const client = await auth.getClient();

    // Initialize Google APIs
    const docs = google.docs({ version: "v1", auth: client });
    const sheets = google.sheets({ version: "v4", auth: client });

    // Fetch policy document with new ID
    const policyDoc = await docs.documents.get({
      documentId: "1hVzGDO5e54jd4-wS9SBMHPQMLyMTN_HJMf22KePaOR8",
    });

    // Extract text from policy document
    let policyText = "";
    if (policyDoc.data.content) {
      policyText = policyDoc.data.content.content
        .map(
          (item: any) =>
            item.paragraph?.elements
              ?.map((el: any) => el.textRun?.content || "")
              .join("") || ""
        )
        .join("\n");
    }

    // Fetch all sheets from new spreadsheet ID
    const spreadsheetId = "1Tg8sampEnrUZ0SCfec0dCR2UZGN0pUsf93WaDnyWfv0";

    const [carsSheet, motorcyclesSheet, boatsSheet, clothingSheet, itemsSheet] =
      await Promise.all([
        sheets.spreadsheets.values.get({
          spreadsheetId,
          range: "CARS!A:Z",
        }),
        sheets.spreadsheets.values.get({
          spreadsheetId,
          range: "MOTORCYCLES!A:Z",
        }),
        sheets.spreadsheets.values.get({
          spreadsheetId,
          range: "BOATS/PLANES/HELICOPTERS!A:Z",
        }),
        sheets.spreadsheets.values.get({
          spreadsheetId,
          range: "CLOTHING LIST!A:Z",
        }),
        sheets.spreadsheets.values.get({
          spreadsheetId,
          range: "ITEMS!A:Z",
        }),
      ]);

    // Convert sheet data to text format
    const formatSheetData = (data: any) => {
      if (!data.values) return "";
      return data.values.map((row: any[]) => row.join(" | ")).join("\n");
    };

    console.log(
      "✅ Successfully fetched all policy documents and sheets from Google APIs"
    );

    return {
      policy: policyText || getDefaultPolicy(),
      vehicleList: formatSheetData(carsSheet.data) || getDefaultVehicleList(),
      motorcyclesList:
        formatSheetData(motorcyclesSheet.data) || getDefaultMotorcyclesList(),
      boatsPlanesList:
        formatSheetData(boatsSheet.data) || getDefaultBoatsPlanesList(),
      clothingList:
        formatSheetData(clothingSheet.data) || getDefaultClothingList(),
      itemsList: formatSheetData(itemsSheet.data) || getDefaultItemsList(),
    };
  } catch (error) {
    console.error(
      "❌ Error fetching policy documents from Google APIs:",
      error
    );
    console.log("🔄 Falling back to hardcoded policy content");

    // Fallback to hardcoded content
    return {
      policy: getDefaultPolicy(),
      vehicleList: getDefaultVehicleList(),
      motorcyclesList: getDefaultMotorcyclesList(),
      boatsPlanesList: getDefaultBoatsPlanesList(),
      clothingList: getDefaultClothingList(),
      itemsList: getDefaultItemsList(),
    };
  }
}

// Default policy content functions
function getDefaultPolicy(): string {
  return `LIFEINVADER INTERNAL POLICY

Ad Formatting Rules:
1. Vehicle ads must use approved vehicle names from the official list
2. All ads must follow the structure: "Selling/Offering/Hiring [Item/Service/Position] in [features]. Price: [Price]."
3. Prices must be formatted properly (e.g., "$10,000,000" instead of "10000000")
4. If no price is mentioned in selling ads, use "Price: Negotiable"
5. If no price is mentioned in buying ads, use "Budget: Negotiable"
6. Do not include insurance days remaining or extra information after the price
7. Keep ads professional and policy-compliant

Vehicle Formatting:
- Use exact vehicle names from approved list
- Structure: "Selling "[Vehicle Name]" in [features]. Price: [Price]."
- Features should include: full configuration, visual upgrades, drift kit, insurance

Business Formatting:
- Structure: "Selling [Business Type] in [location/features]. Price: [Price]."
- Include location and business features

Service Formatting:
- Structure: "Offering [Service Type] in [location/features]. Price: [Price]."

Clothing Formatting:
- Structure: "Selling [Clothing Items] in [condition/features]. Price: [Price]."
- Use exact brand names from the list (e.g., "Abibas" not "Adidas")

Job Formatting:
- Structure: "Hiring [Position] in [location/requirements]. Salary: [Salary]."`;
}

function getDefaultVehicleList(): string {
  return `APPROVED VEHICLE NAMES:
Annis Skyline GT-R (R34)
Annis GT-R I
Annis RX-7 (FD)
Annis RX-8
Annis 350Z
Declasse Camaro 2020
Declasse Corvette C7
Declasse Tahoe
Dinka NSX 2017
Elegy RH8
FMJ
Gauntlet
Jester
Kuruma
Massacro
Osiris
Pegassi Zentorno
Pegassi Infernus
Pegassi Reaper
Progen T20
Progen Tyrus
Sultan RS
T20
Turismo R
Vacca
Zentorno`;
}

function getDefaultMotorcyclesList(): string {
  return `APPROVED MOTORCYCLE NAMES:
Akuma
Bati 801
Bati 801RR
Carbon RS
Double T
Faggio
FCR 1000
Hakuchou
Hakuchou Drag
Lectro
Nemesis
PCJ 600
Ruffian
Sanchez
Sovereign
Vader`;
}

function getDefaultBoatsPlanesList(): string {
  return `APPROVED BOATS/PLANES/HELICOPTERS:
Alpha-Z1
Besra
Buzzard Attack Chopper
Cargobob
Dodo
Frogger
Luxor
Mallard
Maverick
Mesa
P-996 LAZER
Seabreeze
Shamal
Skylift
Supervolito
Supervolito Carbon
Swift
Swift Deluxe
Titan
Valkyrie
Valkyrie MOD.0
Volatus`;
}

function getDefaultClothingList(): string {
  return `APPROVED CLOTHING BRANDS:
Abibas (not Adidas)
Muci (not Gucci)
Nike
Puma
Reebok
Under Armour
Lacoste
Ralph Lauren
Tommy Hilfiger
Calvin Klein
Levi's
Wrangler
Dickies
Carhartt
The North Face
Columbia
Patagonia`;
}

function getDefaultItemsList(): string {
  return `APPROVED ITEMS:
Electronics
Phones
Computers
Laptops
Tablets
Gaming Consoles
Accessories
Tools
Equipment
Furniture
Appliances
Books
Media
Sports Equipment
Musical Instruments`;
}

// Function to analyze ad type and format pattern
function analyzeAdPattern(input: string): {
  adType: string;
  formatPattern: string;
} {
  const lowerInput = input.toLowerCase();

  // Determine ad type
  let adType = "general";
  if (
    lowerInput.includes("car") ||
    lowerInput.includes("vehicle") ||
    lowerInput.includes("gtr") ||
    lowerInput.includes("nissan") ||
    lowerInput.includes("motorcycle") ||
    lowerInput.includes("boat") ||
    lowerInput.includes("plane")
  ) {
    adType = "vehicle";
  } else if (
    lowerInput.includes("pants") ||
    lowerInput.includes("shirt") ||
    lowerInput.includes("clothing") ||
    lowerInput.includes("adidas") ||
    lowerInput.includes("abibas") ||
    lowerInput.includes("nike")
  ) {
    adType = "clothing";
  } else if (
    lowerInput.includes("house") ||
    lowerInput.includes("apartment") ||
    lowerInput.includes("property") ||
    lowerInput.includes("villa") ||
    lowerInput.includes("mansion")
  ) {
    adType = "real estate";
  } else if (
    lowerInput.includes("business") ||
    lowerInput.includes("restaurant") ||
    lowerInput.includes("store") ||
    lowerInput.includes("shop")
  ) {
    adType = "business";
  } else if (
    lowerInput.includes("service") ||
    lowerInput.includes("repair") ||
    lowerInput.includes("offering")
  ) {
    adType = "service";
  } else if (
    lowerInput.includes("hiring") ||
    lowerInput.includes("job") ||
    lowerInput.includes("position") ||
    lowerInput.includes("chef")
  ) {
    adType = "job";
  }

  // Determine format pattern
  let formatPattern = "selling";
  if (
    lowerInput.includes("buy") ||
    lowerInput.includes("looking") ||
    lowerInput.includes("want") ||
    lowerInput.includes("need")
  ) {
    formatPattern = "buying";
  } else if (lowerInput.includes("hiring") || lowerInput.includes("job")) {
    formatPattern = "hiring";
  } else if (
    lowerInput.includes("offering") ||
    lowerInput.includes("service")
  ) {
    formatPattern = "offering";
  }

  return { adType, formatPattern };
}

// Function to get relevant feedback for similar inputs with pattern matching
async function getRelevantFeedback(
  input: string,
  category: string
): Promise<string> {
  try {
    const feedbacks = await getRelevantFeedbackFromFirestore(
      input,
      category,
      3
    );
    const { adType, formatPattern } = analyzeAdPattern(input);

    // First, try to find feedback that matches both ad type and format pattern
    let relevantFeedbacks = feedbacks.filter((feedback: FeedbackEntry) => {
      const feedbackPattern = analyzeAdPattern(feedback.originalInput);
      return (
        feedbackPattern.adType === adType &&
        feedbackPattern.formatPattern === formatPattern
      );
    });

    // If no exact match, try to find feedback that matches ad type only
    if (relevantFeedbacks.length === 0) {
      relevantFeedbacks = feedbacks.filter((feedback: FeedbackEntry) => {
        const feedbackPattern = analyzeAdPattern(feedback.originalInput);
        return feedbackPattern.adType === adType;
      });
    }

    // If still no match, try to find feedback that matches format pattern only
    if (relevantFeedbacks.length === 0) {
      relevantFeedbacks = feedbacks.filter((feedback: FeedbackEntry) => {
        const feedbackPattern = analyzeAdPattern(feedback.originalInput);
        return feedbackPattern.formatPattern === formatPattern;
      });
    }

    // If still no match, fall back to enhanced keyword similarity
    if (relevantFeedbacks.length === 0) {
      relevantFeedbacks = feedbacks.filter((feedback: FeedbackEntry) => {
        const inputWords = input.toLowerCase().split(/\s+/);
        const feedbackWords = feedback.originalInput.toLowerCase().split(/\s+/);

        // Count exact word matches
        const exactMatches = inputWords.filter((word) =>
          feedbackWords.includes(word)
        );

        // Count semantic matches (similar words)
        const semanticMatches = inputWords.filter((inputWord) =>
          feedbackWords.some(
            (feedbackWord) => calculateSimilarity(inputWord, feedbackWord) > 0.7
          )
        );

        // Count category-specific keyword matches
        const categoryKeywords: Record<string, string[]> = {
          auto: [
            "car",
            "vehicle",
            "gtr",
            "nissan",
            "bmw",
            "sell",
            "buy",
            "price",
          ],
          "clothing store": [
            "pants",
            "shoes",
            "shirt",
            "adidas",
            "nike",
            "sell",
            "buy",
            "price",
          ],
          office: ["job", "hire", "work", "employee", "position", "salary"],
          "service station": [
            "service",
            "repair",
            "maintenance",
            "offer",
            "work",
          ],
          "misc/own business": [
            "business",
            "restaurant",
            "house",
            "apartment",
            "sell",
            "buy",
            "price",
          ],
        };

        const categoryKeyMatches =
          categoryKeywords[category]?.filter(
            (keyword: string) =>
              inputWords.includes(keyword) && feedbackWords.includes(keyword)
          ) || [];

        const totalMatches =
          exactMatches.length +
          semanticMatches.length +
          categoryKeyMatches.length;
        return totalMatches >= 2; // At least 2 matches (exact, semantic, or category-specific)
      });
    }

    // Take up to 3 most recent relevant feedbacks
    const recentFeedbacks = relevantFeedbacks
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 3);

    if (recentFeedbacks.length === 0) {
      return "";
    }

    // Create learning instructions from feedback
    const learningInstructions = `ENHANCED MACHINE LEARNING RULES:
1. Learn from user corrections and apply to similar ${adType} ${formatPattern} ads
2. Use exact formatting patterns from successful corrections
3. Apply category-specific rules consistently
4. Remember price formatting preferences (periods for thousands, "Million." for millions)
5. Use correct vehicle/clothing names from approved lists
6. Follow policy document examples and rules exactly
7. Pay attention to specific word choices and sentence structure from corrections
8. Apply learned patterns to future ${adType} ${formatPattern} ads automatically
9. Remember exact formatting rules from policy document
10. Use fuzzy matching to find correct names even with spelling errors

RECENT CORRECTIONS TO LEARN FROM:
${recentFeedbacks
  .map(
    (feedback) =>
      `Original: "${feedback.originalInput}" → Corrected: "${feedback.userCorrection}"`
  )
  .join("\n")}`;

    return learningInstructions;
  } catch (error) {
    console.error("Error getting relevant feedback:", error);
    return "";
  }
}

// Function to format ad content using Gemini AI
async function formatAdWithAI(
  adContent: string,
  categories: string[],
  categoryDisplayNames: any
): Promise<string> {
  // Reference to LifeInvader Internal Policy: https://docs.google.com/document/d/1zNTpF4bmcjOVef6XmCvq3x6DxPkWAFNdJJE5mwS5D3o/edit?tab=t.0

  try {
    // Check if Gemini API key is available
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey || geminiApiKey === "your_gemini_api_key_here") {
      // Fallback to basic formatting if no API key
      console.log("Gemini API key not configured, using basic formatting");
      return formatAdBasic(adContent, categories, categoryDisplayNames);
    }

    // Fetch the actual policy documents
    const {
      policy,
      vehicleList,
      motorcyclesList,
      boatsPlanesList,
      clothingList,
      itemsList,
    } = await fetchPolicyDocuments();

    // Determine the category first to get relevant feedback
    const detectedCategory = detectCategory(adContent);
    const relevantFeedback = await getRelevantFeedback(
      adContent,
      detectedCategory
    );

    // Extract exact names using fuzzy matching
    const vehicleName = extractVehicleName(adContent, vehicleList);
    const clothingName = extractClothingName(adContent, clothingList);

    // Debug logging
    console.log(`🔍 Vehicle extraction for "${adContent}":`, vehicleName);
    console.log(`🔍 Clothing extraction for "${adContent}":`, clothingName);

    // Add extracted names to the prompt for better accuracy
    const extractedNames = vehicleName
      ? `\nEXTRACTED VEHICLE NAME: "${vehicleName}"`
      : "";
    const extractedClothing = clothingName
      ? `\nEXTRACTED CLOTHING NAME: "${clothingName}"`
      : "";

    // Create the system prompt with actual policy context and feedback
    const systemPrompt = `You are an expert LifeInvader ad formatter. Your job is to format user ads according to the LifeInvader Internal Policy.

IMPORTANT: Format ANY ad content provided by the user. Do NOT reject ads that don't fit predefined structures.

FUZZY MATCHING FOR NAMES:
- Use fuzzy matching to find exact names even with spelling errors
- For vehicles: Match user input to exact vehicle names from the lists
- For clothing: Match user input to exact brand names from the lists
- Examples: "nissan gtr" → "Annis Skyline GT-R (R34)", "adidas pants" → "Abibas pants"

EXACT NAMES FROM LISTS:
- Use EXACT vehicle names from Vehicle List (with fuzzy matching)
- Use EXACT motorcycle names from Motorcycles List (with fuzzy matching)
- Use EXACT boat/plane/helicopter names from Boats/Planes/Helicopters List (with fuzzy matching)
- Use EXACT clothing brands from Clothing List (with fuzzy matching)
- Use EXACT item names from Items List (with fuzzy matching)

EXTRACTED NAMES FROM USER INPUT:${extractedNames}${extractedClothing}

CRITICAL: If a vehicle name is extracted above, you MUST use that exact name in your response. Do not substitute it with any other vehicle name.

ACTUAL POLICY DOCUMENT FROM GOOGLE DOCS:
${policy}

VEHICLE LIST:
${vehicleList}

MOTORCYCLES LIST:
${motorcyclesList}

BOATS/PLANES/HELICOPTERS LIST:
${boatsPlanesList}

CLOTHING LIST:
${clothingList}

ITEMS LIST:
${itemsList}

OFFICIAL CATEGORIES (USE ONLY THESE):
- auto: for vehicles, cars, motorcycles, boats, planes, helicopters
- work: for jobs, hiring, employment, positions
- service: for services, repairs, maintenance, assistance
- real estate: for houses, apartments, property, real estate
- other: for clothing items, general items, miscellaneous
- discount: for discounts, sales, special offers
- dating: ONLY for ads starting with "Looking for..."
- business: for business sales, purchases, companies

Output format: Just the formatted ad text, followed by "Category: [OFFICIAL_CATEGORY_NAME]" on a new line.

CRITICAL: You MUST use ONLY the official categories listed above. Do NOT use any other category names like "Family", "Clothing Store", "Office", etc.

FORMATTING GUIDELINES:
1. For vehicle ads: Use quotes around vehicle names and include "in full configuration with visual upgrades, insurance and drift kit"
   - ALWAYS use the EXTRACTED VEHICLE NAME if provided above
   - Do not substitute with other vehicle names
   - Category: "auto"
2. For clothing/item ads: Use correct brand names (Abibas, Niki, etc.) and include condition/features
   - ALWAYS use the EXTRACTED CLOTHING NAME if provided above
   - Category: "other"
3. For job ads: Use "Hiring [Position] in [location/requirements]. Salary: [amount]"
   - Category: "work"
4. For service ads: Use "Offering [Service Type] in [location/features]. Price: [amount]"
   - Category: "service"
5. For business ads: Use "Selling [Business Type] in [location/features]. Price: [amount]"
   - Category: "business"
6. For real estate ads: Use "Selling [Property Type] in [location/features]. Price: [amount]"
   - Category: "real estate"
7. For dating ads: Format naturally as "Looking for [description]" or similar
   - Category: "dating" (ONLY for ads starting with "Looking for...")
8. For any other ads: Format naturally and appropriately for the content
   - Category: "other"
9. Use periods (.) for thousands separator: $1.000.000
10. For millions: $1 Million. (with period)

IMPORTANT: Always format the ad content provided. Do not reject or refuse to format any ad.${relevantFeedback}`;

    // Create the user message
    const userMessage = `Please format this ad according to the LifeInvader Internal Policy: "${adContent}"`;

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Call Gemini API
    const result = await model.generateContent([systemPrompt, userMessage]);

    const formattedResponse = result.response.text().trim();

    if (!formattedResponse) {
      throw new Error("No response from Gemini");
    }

    // Parse the AI response to extract formatted ad and category
    const lines = formattedResponse.trim().split("\n");
    const formattedAd = lines[0];
    const categoryLine = lines.find((line) => line.startsWith("Category:"));

    // Define official categories
    const officialCategories = [
      "auto",
      "work",
      "service",
      "real estate",
      "other",
      "discount",
      "dating",
      "business",
    ];

    let category = detectedCategory; // Default to detected category

    if (categoryLine) {
      const extractedCategory = categoryLine
        .replace("Category:", "")
        .trim()
        .toLowerCase();
      // Only use the extracted category if it's an official one
      if (officialCategories.includes(extractedCategory)) {
        category = extractedCategory;
      } else {
        console.log(
          `⚠️ AI returned non-official category: "${extractedCategory}", using detected category: "${detectedCategory}"`
        );
      }
    }

    // Only store feedback when user actually provides corrections
    // Removed automatic storage of every request to avoid database bloat

    // Return formatted ad with category
    return `${formattedAd}\nCategory: ${category}`;
  } catch (error) {
    console.error("Gemini API error:", error);
    // Fallback to basic formatting
    return formatAdBasic(adContent, categories, categoryDisplayNames);
  }
}

// Function to calculate similarity between two strings (fuzzy matching)
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, "");
  const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;

  // For vehicle names, check if words match
  const s1Words = s1.split(/\s+/);
  const s2Words = s2.split(/\s+/);

  let wordMatches = 0;
  for (const word1 of s1Words) {
    for (const word2 of s2Words) {
      if (word1 === word2) {
        wordMatches++;
      } else if (word1.includes(word2) || word2.includes(word1)) {
        wordMatches += 0.8;
      }
    }
  }

  if (wordMatches > 0) {
    return Math.min(
      0.95,
      wordMatches / Math.max(s1Words.length, s2Words.length)
    );
  }

  // Simple Levenshtein-like similarity for character-level matching
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1.0;

  const distance = longer.length - shorter.length;
  const maxDistance = Math.floor(longer.length * 0.3); // Allow 30% difference

  if (distance > maxDistance) return 0;

  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }

  return matches / longer.length;
}

// Function to find best match from a list using fuzzy matching
function findBestMatch(
  input: string,
  options: string[]
): { match: string; similarity: number } | null {
  let bestMatch = null;
  let bestSimilarity = 0;

  for (const option of options) {
    const similarity = calculateSimilarity(input, option);
    if (similarity > bestSimilarity && similarity > 0.6) {
      // Minimum 60% similarity
      bestSimilarity = similarity;
      bestMatch = option;
    }
  }

  return bestMatch ? { match: bestMatch, similarity: bestSimilarity } : null;
}

// Function to extract and match vehicle names from input
function extractVehicleName(input: string, vehicleList: string): string {
  const lowerInput = input.toLowerCase();
  const vehicleLines = vehicleList.split("\n").filter((line) => line.trim());
  const vehicleNames = vehicleLines
    .map((line) => line.split("|")[0]?.trim())
    .filter((name) => name);

  // First, try exact matches
  for (const vehicleName of vehicleNames) {
    if (lowerInput.includes(vehicleName.toLowerCase())) {
      return vehicleName;
    }
  }

  // Then try fuzzy matching for common vehicle keywords
  const vehicleKeywords = [
    "gtr",
    "r34",
    "skyline",
    "nissan",
    "mazda",
    "bmw",
    "mercedes",
    "ferrari",
    "lamborghini",
    "porsche",
    "audi",
    "toyota",
    "honda",
    "ford",
    "dodge",
    "chevrolet",
    "camaro",
    "tahoe",
    "nsx",
    "elegy",
    "fmj",
    "gauntlet",
    "jester",
    "land cruiser",
    "supra",
    "tundra",
    "r8",
    "rs6",
    "rs7",
    "pariah",
    "huayra",
    "performante",
    "re-7b",
    "schafter",
    "tempesta",
    "tezeract",
    "m3",
    "m4",
    "vagner",
    "raptor",
    "x80",
    "zentorno",
    "mustang",
    "corvette",
    "rx7",
    "progen",
    "p1",
    "t20",
    "chiron",
    "truffade",
    "motorcycle",
    "bike",
    "boat",
    "plane",
    "helicopter",
  ];

  // Debug: Log available vehicle names
  console.log("🔍 Available vehicle names:", vehicleNames.slice(0, 10)); // First 10 for debugging

  // Try fuzzy matching for common vehicle keywords
  for (const keyword of vehicleKeywords) {
    if (lowerInput.includes(keyword)) {
      console.log(`🔍 Found keyword "${keyword}" in input`);
      const match = findBestMatch(keyword, vehicleNames);
      if (match) {
        console.log(
          `🔍 Found match for "${keyword}": "${match.match}" (similarity: ${match.similarity})`
        );
        return match.match;
      }
    }
  }

  // Try fuzzy matching the entire input against vehicle names
  const inputWords = lowerInput.split(/\s+/).filter((word) => word.length > 2);
  console.log(`🔍 Input words:`, inputWords);

  for (const word of inputWords) {
    const match = findBestMatch(word, vehicleNames);
    if (match && match.similarity > 0.7) {
      console.log(
        `🔍 Found match for word "${word}": "${match.match}" (similarity: ${match.similarity})`
      );
      return match.match;
    }
  }

  // Try partial matching for vehicle names
  for (const vehicleName of vehicleNames) {
    const lowerVehicleName = vehicleName.toLowerCase();
    const vehicleWords = lowerVehicleName.split(/\s+/);

    for (const inputWord of inputWords) {
      for (const vehicleWord of vehicleWords) {
        if (
          vehicleWord.includes(inputWord) ||
          inputWord.includes(vehicleWord)
        ) {
          if (vehicleWord.length > 2 && inputWord.length > 2) {
            console.log(
              `🔍 Found partial match: "${inputWord}" matches "${vehicleWord}" in "${vehicleName}"`
            );
            return vehicleName;
          }
        }
      }
    }
  }

  console.log("🔍 No vehicle match found");
  return "";
}

// Function to extract and match clothing names from input
function extractClothingName(input: string, clothingList: string): string {
  const lowerInput = input.toLowerCase();
  const clothingLines = clothingList.split("\n").filter((line) => line.trim());
  const clothingNames = clothingLines
    .map((line) => line.split("|")[0]?.trim())
    .filter((name) => name);

  // First, try exact matches
  for (const clothingName of clothingNames) {
    if (lowerInput.includes(clothingName.toLowerCase())) {
      return clothingName;
    }
  }

  // Then try fuzzy matching for common clothing keywords
  const clothingKeywords = [
    "adidas",
    "abibas",
    "nike",
    "puma",
    "reebok",
    "under armour",
    "new balance",
    "converse",
    "vans",
    "jordan",
    "yeezy",
    "supreme",
    "off-white",
    "gucci",
    "louis vuitton",
    "balenciaga",
    "versace",
    "prada",
    "chanel",
    "pants",
    "shirt",
    "hoodie",
    "shoes",
    "sneakers",
    "jacket",
    "dress",
    "skirt",
    "jeans",
    "sweater",
    "coat",
    "suit",
    "tie",
    "hat",
    "cap",
    "bag",
    "purse",
    "wallet",
    "belt",
    "watch",
    "jewelry",
    "ring",
    "necklace",
    "bracelet",
    "earrings",
    "sunglasses",
    "glasses",
  ];

  for (const keyword of clothingKeywords) {
    if (lowerInput.includes(keyword)) {
      const match = findBestMatch(keyword, clothingNames);
      if (match) {
        return match.match;
      }
    }
  }

  return "";
}

// Function to format price according to policy rules
function formatPrice(price: string): string {
  // Remove any non-numeric characters except decimal points
  const numericPrice = price.replace(/[^\d.]/g, "");

  // Parse as number
  const num = parseFloat(numericPrice);
  if (isNaN(num)) return price; // Return original if not a valid number

  // Format according to policy: use period (.) for thousands, not comma
  if (num >= 1000000) {
    return `$${num / 1000000} Million.`;
  } else if (num >= 1000) {
    return `$${num.toLocaleString("en-US").replace(/,/g, ".")}`;
  } else {
    return `$${num}`;
  }
}

// Function to detect category from input with improved logic
function detectCategory(input: string): string {
  const lowerInput = input.toLowerCase();

  // Check for buying vs selling intent first
  const isBuying =
    lowerInput.includes("buy") ||
    lowerInput.includes("looking") ||
    lowerInput.includes("want") ||
    lowerInput.includes("need");
  const isSelling =
    lowerInput.includes("sell") ||
    lowerInput.includes("selling") ||
    lowerInput.includes("offering");
  const isHiring =
    lowerInput.includes("hiring") ||
    lowerInput.includes("job") ||
    lowerInput.includes("position") ||
    lowerInput.includes("employee");
  const isService =
    lowerInput.includes("service") ||
    lowerInput.includes("offering") ||
    lowerInput.includes("repair") ||
    lowerInput.includes("maintenance");
  const isDating =
    lowerInput.includes("looking for") ||
    lowerInput.includes("sugar") ||
    lowerInput.includes("dating") ||
    lowerInput.includes("relationship") ||
    lowerInput.includes("girlfriend") ||
    lowerInput.includes("boyfriend");

  // Vehicle detection - comprehensive with priority
  const vehicleKeywords = [
    "vehicle",
    "car",
    "gtr",
    "r34",
    "rx7",
    "mustang",
    "corvette",
    "skyline",
    "nissan",
    "mazda",
    "bmw",
    "mercedes",
    "ferrari",
    "lamborghini",
    "porsche",
    "audi",
    "toyota",
    "honda",
    "ford",
    "dodge",
    "chevrolet",
    "camaro",
    "tahoe",
    "nsx",
    "elegy",
    "fmj",
    "gauntlet",
    "jester",
    "land cruiser",
    "supra",
    "tundra",
    "r8",
    "rs6",
    "rs7",
    "pariah",
    "huayra",
    "performante",
    "re-7b",
    "schafter",
    "tempesta",
    "tezeract",
    "m3",
    "m4",
    "vagner",
    "raptor",
    "x80",
    "zentorno",
    "drift",
    "tuned",
    "engine",
    "transmission",
    "wheels",
    "brakes",
    "spoiler",
    "neon",
    "insurance",
    "motorcycle",
    "bike",
    "boat",
    "plane",
    "helicopter",
  ];

  if (vehicleKeywords.some((keyword) => lowerInput.includes(keyword))) {
    return "auto";
  }

  // Clothing detection - comprehensive
  const clothingKeywords = [
    "clothing",
    "clothes",
    "shirt",
    "pants",
    "trousers",
    "hoodie",
    "shoes",
    "sneakers",
    "jacket",
    "dress",
    "skirt",
    "jeans",
    "sweater",
    "coat",
    "suit",
    "tie",
    "hat",
    "cap",
    "bag",
    "purse",
    "wallet",
    "belt",
    "watch",
    "jewelry",
    "jewellery",
    "ring",
    "necklace",
    "bracelet",
    "earrings",
    "sunglasses",
    "glasses",
    "luminous",
    "glowing",
    "gucci",
    "muci",
    "designer",
    "brand",
    "fashion",
    "style",
    "outfit",
    "wardrobe",
    "adidas",
    "abibas",
    "nike",
  ];

  if (clothingKeywords.some((keyword) => lowerInput.includes(keyword))) {
    return "clothing store";
  }

  // Real estate detection - comprehensive
  const realEstateKeywords = [
    "villa",
    "mansion",
    "house",
    "apartment",
    "property",
    "real estate",
    "vinewood",
    "hills",
    "garage",
    "warehouse",
    "rooftop",
    "helipad",
    "pool",
    "tennis",
    "interior",
    "plantation",
    "garden",
    "swimming",
    "penthouse",
    "condo",
    "townhouse",
    "duplex",
    "studio",
    "loft",
    "bungalow",
    "cottage",
    "cabin",
    "chalet",
    "beach house",
    "lake house",
  ];

  if (realEstateKeywords.some((keyword) => lowerInput.includes(keyword))) {
    return "misc/own business"; // Real estate falls under misc/own business
  }

  // Job detection - high priority
  const jobKeywords = [
    "hiring",
    "job",
    "position",
    "chef",
    "employee",
    "staff",
    "worker",
    "vacancy",
    "employment",
    "career",
    "salary",
    "wage",
    "pay",
    "manager",
    "assistant",
    "driver",
    "security",
    "guard",
    "mechanic",
    "technician",
    "sales",
    "marketing",
    "accountant",
    "lawyer",
    "doctor",
    "nurse",
    "teacher",
    "instructor",
    "trainer",
    "consultant",
  ];

  if (jobKeywords.some((keyword) => lowerInput.includes(keyword))) {
    return "office";
  }

  // Service detection
  const serviceKeywords = [
    "service",
    "repair",
    "offering",
    "maintenance",
    "help",
    "assistance",
    "consulting",
    "support",
    "installation",
    "cleaning",
    "transport",
    "delivery",
    "towing",
    "moving",
    "construction",
    "renovation",
    "painting",
    "plumbing",
    "electrical",
    "carpentry",
    "landscaping",
    "gardening",
    "catering",
    "photography",
    "videography",
    "design",
    "web design",
    "graphic design",
    "tutoring",
    "coaching",
    "training",
  ];

  if (serviceKeywords.some((keyword) => lowerInput.includes(keyword))) {
    return "service station";
  }

  // Business detection - broader
  const businessKeywords = [
    "business",
    "restaurant",
    "store",
    "shop",
    "company",
    "enterprise",
    "firm",
    "corporation",
    "establishment",
    "venue",
    "facility",
    "operation",
    "franchise",
    "outlet",
    "branch",
    "office",
    "warehouse",
    "factory",
    "manufacturing",
    "retail",
    "wholesale",
    "import",
    "export",
    "trading",
    "investment",
    "consulting firm",
  ];

  if (businessKeywords.some((keyword) => lowerInput.includes(keyword))) {
    return "misc/own business";
  }

  // Dating detection
  if (isDating) {
    return "misc/own business"; // Dating ads fall under misc/own business
  }

  // Default based on intent
  if (isHiring) return "office";
  if (isService) return "service station";
  if (isBuying || isSelling) return "misc/own business"; // Default for buying/selling

  return "misc/own business"; // Final default
}

// Fallback basic formatting function
function formatAdBasic(
  adContent: string,
  categories: string[],
  categoryDisplayNames: any
): string {
  const content = adContent.trim();
  const lowerContent = content.toLowerCase();

  // Determine category based on content
  let suggestedCategory = "auto";

  if (
    lowerContent.includes("car") ||
    lowerContent.includes("vehicle") ||
    lowerContent.includes("auto") ||
    lowerContent.includes("nissan") ||
    lowerContent.includes("gtr") ||
    lowerContent.includes("tuned") ||
    lowerContent.includes("engine") ||
    lowerContent.includes("transmission") ||
    lowerContent.includes("wheels") ||
    lowerContent.includes("brakes") ||
    lowerContent.includes("drift") ||
    lowerContent.includes("neon") ||
    lowerContent.includes("spoiler") ||
    lowerContent.includes("windows") ||
    lowerContent.includes("insurance")
  ) {
    suggestedCategory = "auto";
  } else if (
    lowerContent.includes("clothing") ||
    lowerContent.includes("shirt") ||
    lowerContent.includes("pants") ||
    lowerContent.includes("shoes") ||
    lowerContent.includes("jacket") ||
    lowerContent.includes("hat") ||
    lowerContent.includes("mask")
  ) {
    suggestedCategory = "clothing store";
  } else if (
    lowerContent.includes("job") ||
    lowerContent.includes("work") ||
    lowerContent.includes("hire") ||
    lowerContent.includes("employment") ||
    lowerContent.includes("position") ||
    lowerContent.includes("vacancy")
  ) {
    suggestedCategory = "office";
  } else if (
    lowerContent.includes("service") ||
    lowerContent.includes("repair") ||
    lowerContent.includes("maintenance") ||
    lowerContent.includes("help") ||
    lowerContent.includes("assistance")
  ) {
    suggestedCategory = "service station";
  } else if (
    lowerContent.includes("business") ||
    lowerContent.includes("company") ||
    lowerContent.includes("enterprise")
  ) {
    suggestedCategory = "misc/own business";
  } else if (
    lowerContent.includes("sale") ||
    lowerContent.includes("selling") ||
    lowerContent.includes("buy") ||
    lowerContent.includes("purchase")
  ) {
    suggestedCategory = "misc/own business";
  }

  // Format the ad content according to LifeInvader Internal Policy
  let formattedAd = content;

  // Extract and format price according to policy
  let priceMatch = formattedAd.match(/(\d+)\s*(million|k|thousand)/i);
  if (!priceMatch) {
    // Look for large numbers that might be prices (like 10000000, 1200000)
    const largeNumberMatch = formattedAd.match(/(\d{7,})/);
    if (largeNumberMatch) {
      const amount = parseInt(largeNumberMatch[1]);
      if (amount >= 1000000) {
        // Format with commas as thousands separator
        const formattedPrice = `$${amount.toLocaleString()}`;
        formattedAd = formattedAd.replace(largeNumberMatch[1], formattedPrice);
        priceMatch = [formattedPrice, amount.toString(), "million"];
      }
    }
  } else {
    const amount = parseInt(priceMatch[1]);
    const unit = priceMatch[2].toLowerCase();
    let formattedPrice;
    if (unit === "million") {
      // Convert millions to full number with commas
      const fullAmount = amount * 1000000;
      formattedPrice = `$${fullAmount.toLocaleString()}`;
    } else if (unit === "k" || unit === "thousand") {
      // Convert thousands to full number with commas
      const fullAmount = amount * 1000;
      formattedPrice = `$${fullAmount.toLocaleString()}`;
    } else {
      formattedPrice = `$${amount.toLocaleString()}`;
    }
    formattedAd = formattedAd.replace(priceMatch[0], formattedPrice);
  }

  // Extract price for final formatting
  let price = "";
  if (priceMatch) {
    if (priceMatch[2] && priceMatch[2].toLowerCase() === "million") {
      const millions = parseFloat(priceMatch[1]);
      if (millions === Math.floor(millions)) {
        price = `$${millions} Million`;
      } else {
        price = `$${millions.toFixed(1)} Million`;
      }
    } else if (priceMatch[2] && priceMatch[2].toLowerCase() === "k") {
      price = `$${priceMatch[1]}K`;
    } else {
      // Handle the case where we formatted a large number
      price = priceMatch[0];
    }
  } else {
    // No price found - determine if it's a selling or buying ad
    const isBuyingAd =
      lowerContent.includes("buy") ||
      lowerContent.includes("looking") ||
      lowerContent.includes("want") ||
      lowerContent.includes("need");
    if (isBuyingAd) {
      price = "Budget: Negotiable";
    } else {
      price = "Price: Negotiable";
    }
  }

  // Format based on category
  if (suggestedCategory === "auto") {
    // Vehicle formatting according to policy
    // Map vehicle names to approved names from policy
    const vehicleMappings: { [key: string]: string } = {
      "nissan gtr r34": "Annis Skyline GT-R (R34)",
      "nissan gtr": "Annis GT-R I",
      "gtr r34": "Annis Skyline GT-R (R34)",
      gtr: "Annis GT-R I",
      skyline: "Annis Skyline GT-R (R34)",
      r34: "Annis Skyline GT-R (R34)",
      "nissan 350z": "Annis 350Z",
      "350z": "Annis 350Z",
      "mazda rx7": "Annis RX-7 (FD)",
      "mazda rx-7": "Annis RX-7 (FD)",
      rx7: "Annis RX-7 (FD)",
      "rx-7": "Annis RX-7 (FD)",
      "mazda rx8": "Annis RX-8",
      "mazda rx-8": "Annis RX-8",
      rx8: "Annis RX-8",
      "rx-8": "Annis RX-8",
      camaro: "Declasse Camaro 2020",
      corvette: "Declasse Corvette C7",
      tahoe: "Declasse Tahoe",
      "honda nsx": "Dinka NSX 2017",
      nsx: "Dinka NSX 2017",
      elegy: "Elegy RH8",
      "ford mustang": "FMJ",
      mustang: "FMJ",
      "dodge challenger": "Gauntlet",
      challenger: "Gauntlet",
      "honda civic": "Jester",
      civic: "Jester",
      "land cruiser": "Karin Land Cruiser 200",
      "toyota supra": "Karin Supra A80",
      supra: "Karin Supra A80",
      "toyota tundra": "Karin Tundra 2021",
      tundra: "Karin Tundra 2021",
      "audi r8": "Obey R8",
      r8: "Obey R8",
      "audi rs6": "Obey RS6",
      rs6: "Obey RS6",
      "audi rs7": "Obey RS7",
      rs7: "Obey RS7",
      pariah: "Pariah",
      "pagani huayra": "Pegassi Huayra BC",
      huayra: "Pegassi Huayra BC",
      "lamborghini performante": "Pegassi Performante (LP640)",
      performante: "Pegassi Performante (LP640)",
      "re-7b": "RE-7B",
      "mercedes schafter": "Schafter",
      schafter: "Schafter",
      "lamborghini tempesta": "Tempesta",
      tempesta: "Tempesta",
      tezeract: "Tezeract",
      "bmw m3 e46": "Ubermacht M3 (E46)",
      "bmw m3": "Ubermacht M3 (G80)",
      m3: "Ubermacht M3 (G80)",
      "bmw m4": "Ubermacht M4 (G82)",
      m4: "Ubermacht M4 (G82)",
      vagner: "Vagner",
      "ford mustang gt500": "Vapid Mustang GT500",
      "mustang gt500": "Vapid Mustang GT500",
      "ford raptor": "Vapid Raptor (F150)",
      raptor: "Vapid Raptor (F150)",
      "x80 proto": "X80 Proto",
      "lamborghini zentorno": "Zentorno",
      zentorno: "Zentorno",
      // Add more mappings based on the policy document
      nissan: "Annis Skyline GT-R (R34)",
      mazda: "Annis RX-7 (FD)",
      honda: "Dinka NSX 2017",
      toyota: "Karin Supra A80",
      ford: "FMJ",
      dodge: "Gauntlet",
      audi: "Obey R8",
      bmw: "Ubermacht M3 (G80)",
      pagani: "Pegassi Huayra BC",
      lamborghini: "Pegassi Performante (LP640)",
    };

    // Replace vehicle names with policy-approved names and format user's price
    let vehicleName = "Vehicle";
    let correctPrice = formatPrice(price); // Format user's price with commas

    // Vehicle name and price mappings from the policy document
    const vehiclePriceMappings: {
      [key: string]: { name: string; price: string };
    } = {
      "nissan gtr r34": {
        name: "Annis Skyline GT-R (R34)",
        price: "$4.5 Million",
      },
      "gtr r34": { name: "Annis Skyline GT-R (R34)", price: "$4.5 Million" },
      skyline: { name: "Annis Skyline GT-R (R34)", price: "$4.5 Million" },
      r34: { name: "Annis Skyline GT-R (R34)", price: "$4.5 Million" },
      "nissan gtr": { name: "Annis GT-R I", price: "$3.8 Million" },
      gtr: { name: "Annis GT-R I", price: "$3.8 Million" },
      "nissan 350z": { name: "Annis 350Z", price: "$2.75 Million" },
      "350z": { name: "Annis 350Z", price: "$2.75 Million" },
      "mazda rx7": { name: "Annis RX-7 (FD)", price: "$450K" },
      "mazda rx-7": { name: "Annis RX-7 (FD)", price: "$450K" },
      rx7: { name: "Annis RX-7 (FD)", price: "$450K" },
      "rx-7": { name: "Annis RX-7 (FD)", price: "$450K" },
      "mazda rx8": { name: "Annis RX-8", price: "$1.3 Million" },
      "mazda rx-8": { name: "Annis RX-8", price: "$1.3 Million" },
      rx8: { name: "Annis RX-8", price: "$1.3 Million" },
      "rx-8": { name: "Annis RX-8", price: "$1.3 Million" },
      camaro: { name: "Declasse Camaro 2020", price: "$4.5 Million" },
      corvette: { name: "Declasse Corvette C7", price: "$4.4 Million" },
      tahoe: { name: "Declasse Tahoe", price: "$1.5 Million" },
      "honda nsx": { name: "Dinka NSX 2017", price: "$10 Million" },
      nsx: { name: "Dinka NSX 2017", price: "$10 Million" },
      elegy: { name: "Elegy RH8", price: "$1.2 Million" },
      "ford mustang": { name: "FMJ", price: "$3.2 Million" },
      mustang: { name: "FMJ", price: "$3.2 Million" },
      "dodge challenger": { name: "Gauntlet", price: "$530K" },
      challenger: { name: "Gauntlet", price: "$530K" },
      "honda civic": { name: "Jester", price: "$2.8 Million" },
      civic: { name: "Jester", price: "$2.8 Million" },
      "land cruiser": { name: "Karin Land Cruiser 200", price: "$3.2 Million" },
      "toyota supra": { name: "Karin Supra A80", price: "$2.5 Million" },
      supra: { name: "Karin Supra A80", price: "$2.5 Million" },
      "toyota tundra": { name: "Karin Tundra 2021", price: "$3 Million" },
      tundra: { name: "Karin Tundra 2021", price: "$3 Million" },
      "audi r8": { name: "Obey R8", price: "$2.8 Million" },
      r8: { name: "Obey R8", price: "$2.8 Million" },
      "audi rs6": { name: "Obey RS6", price: "$3.2 Million" },
      rs6: { name: "Obey RS6", price: "$3.2 Million" },
      "audi rs7": { name: "Obey RS7", price: "$3.2 Million" },
      rs7: { name: "Obey RS7", price: "$3.2 Million" },
      pariah: { name: "Pariah", price: "$2.3 Million" },
      "pagani huayra": { name: "Pegassi Huayra BC", price: "$9 Million" },
      huayra: { name: "Pegassi Huayra BC", price: "$9 Million" },
      "lamborghini performante": {
        name: "Pegassi Performante (LP640)",
        price: "$5 Million",
      },
      performante: { name: "Pegassi Performante (LP640)", price: "$5 Million" },
      "re-7b": { name: "RE-7B", price: "$3.7 Million" },
      schafter: { name: "Schafter", price: "$1.35 Million" },
      tempesta: { name: "Tempesta", price: "$3.59 Million" },
      tezeract: { name: "Tezeract", price: "$4.25 Million" },
      "bmw m3": { name: "Ubermacht M3 (G80)", price: "$3.8 Million" },
      m3: { name: "Ubermacht M3 (G80)", price: "$3.8 Million" },
      "bmw m4": { name: "Ubermacht M4 (G82)", price: "$3.5 Million" },
      m4: { name: "Ubermacht M4 (G82)", price: "$3.5 Million" },
      vagner: { name: "Vagner", price: "$2.85 Million" },
      "ford mustang gt500": {
        name: "Vapid Mustang GT500",
        price: "$4.5 Million",
      },
      "mustang gt500": { name: "Vapid Mustang GT500", price: "$4.5 Million" },
      "ford raptor": { name: "Vapid Raptor (F150)", price: "$4.5 Million" },
      raptor: { name: "Vapid Raptor (F150)", price: "$4.5 Million" },
      "x80 proto": { name: "X80 Proto", price: "$4.2 Million" },
      x80: { name: "X80 Proto", price: "$4.2 Million" },
      zentorno: { name: "Zentorno", price: "$2.999 Million" },
    };

    for (const [key, value] of Object.entries(vehiclePriceMappings)) {
      if (lowerContent.includes(key.toLowerCase())) {
        vehicleName = value.name;
        correctPrice = value.price;
        break;
      }
    }

    // Structure vehicle ad according to policy format
    const features = [];
    if (
      lowerContent.includes("chip upgrade") ||
      lowerContent.includes("chip-tuned") ||
      lowerContent.includes("tuned") ||
      lowerContent.includes("pro engine") ||
      lowerContent.includes("pro transmission") ||
      lowerContent.includes("pro wheels") ||
      lowerContent.includes("pro brakes")
    ) {
      features.push("full configuration");
    }
    if (
      lowerContent.includes("neon") ||
      lowerContent.includes("spoiler") ||
      lowerContent.includes("wheels") ||
      lowerContent.includes("custom spoiler") ||
      lowerContent.includes("big wheels")
    ) {
      features.push("visual upgrades");
    }
    if (lowerContent.includes("drift")) {
      features.push("drift kit");
    }
    if (lowerContent.includes("insurance")) {
      features.push("insurance");
    }

    // Use the vehicle name we found earlier
    // vehicleName is already set from the mapping loop above

    // Format according to LifeInvader Internal Policy
    formattedAd = `Selling "${vehicleName}" in ${features.join(
      ", "
    )}. Price: ${correctPrice}.`;
  } else if (suggestedCategory === "misc/own business") {
    // Business/Real Estate ad formatting according to LifeInvader Internal Policy

    // Check if it's real estate/property
    if (
      lowerContent.includes("house") ||
      lowerContent.includes("villa") ||
      lowerContent.includes("property")
    ) {
      let propertyType = "property";
      if (lowerContent.includes("house")) propertyType = "house";
      else if (lowerContent.includes("villa")) propertyType = "villa";

      // Extract property number if present
      const numberMatch = content.match(/(\d+)/);
      const propertyNumber = numberMatch ? ` №${numberMatch[1]}` : "";

      formattedAd = `Selling ${propertyType}${propertyNumber}. Price: ${price}.`;
    } else {
      // Regular business formatting
      const businessKeywords = [
        "restaurant",
        "shop",
        "store",
        "business",
        "company",
        "enterprise",
      ];

      let businessType = "Business";
      for (const keyword of businessKeywords) {
        if (lowerContent.includes(keyword)) {
          businessType = keyword.charAt(0).toUpperCase() + keyword.slice(1);
          break;
        }
      }

      // Extract location and features according to policy
      const features = [];

      // Location features
      if (lowerContent.includes("downtown")) features.push("downtown location");
      else if (lowerContent.includes("north side"))
        features.push("north side location");
      else if (lowerContent.includes("south side"))
        features.push("south side location");
      else if (lowerContent.includes("east side"))
        features.push("east side location");
      else if (lowerContent.includes("west side"))
        features.push("west side location");
      else if (lowerContent.includes("center"))
        features.push("center location");

      // Business features
      if (
        lowerContent.includes("established") ||
        lowerContent.includes("customer base")
      ) {
        features.push("established customer base");
      }
      if (
        lowerContent.includes("equipped") ||
        lowerContent.includes("kitchen")
      ) {
        features.push("fully equipped");
      }
      if (
        lowerContent.includes("good location") ||
        lowerContent.includes("prime location")
      ) {
        features.push("prime location");
      }

      const featuresText =
        features.length > 0 ? ` in ${features.join(", ")}` : "";
      formattedAd = `Selling ${businessType}${featuresText}. Price: ${price}.`;
    }
  } else if (suggestedCategory === "service station") {
    // Service ad formatting according to LifeInvader Internal Policy
    const serviceKeywords = [
      "repair",
      "maintenance",
      "service",
      "help",
      "assistance",
    ];
    let serviceType = "Service";

    for (const keyword of serviceKeywords) {
      if (lowerContent.includes(keyword)) {
        serviceType = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        break;
      }
    }

    // Extract service features according to policy
    const features = [];

    if (
      lowerContent.includes("experienced") ||
      lowerContent.includes("mechanics")
    ) {
      features.push("experienced mechanics");
    }
    if (
      lowerContent.includes("reasonable") ||
      lowerContent.includes("prices")
    ) {
      features.push("reasonable prices");
    }
    if (
      lowerContent.includes("call for quote") ||
      lowerContent.includes("contact")
    ) {
      features.push("call for quote");
    }

    const featuresText =
      features.length > 0 ? ` in ${features.join(", ")}` : "";
    formattedAd = `Offering ${serviceType} Services${featuresText}. Price: ${price}.`;
  } else if (suggestedCategory === "clothing store") {
    // Clothing ad formatting according to LifeInvader Internal Policy
    // Preserve original clothing names and brand names exactly as written
    let clothingDescription = content;

    // Handle specific brand name corrections
    if (lowerContent.includes("adidas")) {
      clothingDescription = clothingDescription.replace(/adidas/gi, "Abibas");
    }
    if (lowerContent.includes("gucci")) {
      clothingDescription = clothingDescription.replace(/gucci/gi, "Muci");
    }

    // Extract clothing features according to policy
    const features = [];

    if (
      lowerContent.includes("brand new") ||
      lowerContent.includes("new condition")
    ) {
      features.push("brand new condition");
    } else if (lowerContent.includes("good condition")) {
      features.push("good condition");
    }
    if (
      lowerContent.includes("various sizes") ||
      lowerContent.includes("sizes available")
    ) {
      features.push("various sizes available");
    }

    const featuresText =
      features.length > 0 ? ` in ${features.join(", ")}` : "";
    formattedAd = `Selling ${clothingDescription}${featuresText}. Price: ${price}.`;
  } else if (suggestedCategory === "office") {
    // Job ad formatting according to LifeInvader Internal Policy
    const jobKeywords = ["chef", "manager", "worker", "employee", "staff"];
    let position = "Position";

    for (const keyword of jobKeywords) {
      if (lowerContent.includes(keyword)) {
        position = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        break;
      }
    }

    // Extract job features according to policy
    const features = [];

    if (lowerContent.includes("experienced")) {
      position = "Experienced " + position;
    }
    if (
      lowerContent.includes("downtown") ||
      lowerContent.includes("location")
    ) {
      features.push("downtown location");
    }
    if (
      lowerContent.includes("competitive") ||
      lowerContent.includes("salary")
    ) {
      features.push("competitive salary");
    }
    if (
      lowerContent.includes("benefits") ||
      lowerContent.includes("included")
    ) {
      features.push("benefits included");
    }

    const featuresText =
      features.length > 0 ? ` in ${features.join(", ")}` : "";
    formattedAd = `Hiring ${position}${featuresText}. Salary: ${price}.`;
  } else {
    // Generic ad formatting
    formattedAd = `Selling Item. Price: ${price}.`;
  }

  // Basic formatting for all ads according to policy
  formattedAd = formattedAd
    .replace(/(^|\.\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();

  if (
    !formattedAd.endsWith(".") &&
    !formattedAd.endsWith("!") &&
    !formattedAd.endsWith("?")
  ) {
    formattedAd += ".";
  }

  return `${formattedAd}\n\nCategory: ${
    categoryDisplayNames[suggestedCategory] || suggestedCategory
  }`;
}

export async function POST(request: NextRequest) {
  try {
    const {
      query,
      templates,
      categories,
      categoryDisplayNames,
      feedback,
      originalResponse,
    } = await request.json();

    // Handle feedback submission
    if (feedback && originalResponse) {
      const category = detectCategory(query);
      const { adType, formatPattern } = analyzeAdPattern(query);
      const feedbackEntry: FeedbackEntry = {
        originalInput: query,
        aiResponse: originalResponse,
        userCorrection: feedback,
        timestamp: new Date(),
        category: category,
        adType: adType,
        formatPattern: formatPattern,
      };

      // Store in Firestore
      await storeFeedback(feedbackEntry);

      console.log(
        `📝 Feedback stored for category: ${category} (${adType} ${formatPattern})`
      );
      console.log(`Original: "${query}"`);
      console.log(`AI Response: "${originalResponse}"`);
      console.log(`User Correction: "${feedback}"`);

      return NextResponse.json({
        response: `Thank you for the feedback! I've learned from your correction for ${adType} ${formatPattern} ads and will apply this knowledge to future similar requests.`,
        feedbackStored: true,
      });
    }

    // Simple AI logic for now - can be enhanced with actual AI service
    const lowerQuery = query.toLowerCase();

    // Handle template categorization - only when explicitly asking about templates
    if (
      lowerQuery.includes("what category") ||
      lowerQuery.includes("template category") ||
      lowerQuery.includes("which category")
    ) {
      // Try to find matching templates
      const searchTerm = lowerQuery
        .replace(/what category|template category|which category/gi, "")
        .trim();
      const matchingTemplates = templates.filter(
        (template: any) =>
          template.name.toLowerCase().includes(searchTerm) ||
          template.description.toLowerCase().includes(searchTerm)
      );

      if (matchingTemplates.length > 0) {
        const template = matchingTemplates[0];
        return NextResponse.json({
          response: `Based on your query, I found a similar template:

**Template**: ${template.name}
**Category**: ${template.displayCategory}
**Type**: ${template.type}
**Description**: ${template.description}

This template belongs to the "${template.displayCategory}" category. You can use this as a reference for creating similar ads.`,
        });
      }

      return NextResponse.json({
        response: `I can help you find the right category for your template. Please provide more details about the template you're asking about, or share the template name/description so I can suggest the appropriate category from our available options:

${categories
  .map((cat: string) => `• ${categoryDisplayNames[cat] || cat}`)
  .join("\n")}`,
      });
    }

    if (lowerQuery.includes("vehicle") || lowerQuery.includes("clothing")) {
      return NextResponse.json({
        response: `For vehicle and clothing compliance:

**Vehicles**: Ensure all vehicle references follow the approved list in the Vehicle/Clothing document. Common approved vehicles include standard civilian cars, trucks, and motorcycles.

**Clothing**: All clothing items must be from the approved clothing list. Avoid referencing specific brands unless they're explicitly approved.

**Best Practices**:
- Use generic terms when possible
- Reference the Vehicle/Clothing list document for specific items
- Avoid brand names unless approved
- Keep descriptions factual and compliant

For specific items, please check the Vehicle/Clothing List document linked above.`,
      });
    }

    // Default behavior - format any input as an ad using AI-like logic
    const formattedAd = await formatAdWithAI(
      query,
      categories,
      categoryDisplayNames
    );
    return NextResponse.json({
      response: formattedAd,
    });
  } catch (error) {
    console.error("AI Assistant error:", error);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    );
  }
}
