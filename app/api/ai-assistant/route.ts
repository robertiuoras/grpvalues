import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../../../lib/firebaseAdmin";

// Firestore feedback interface
interface FeedbackEntry {
  originalInput: string;
  aiResponse: string;
  userCorrection: string;
  timestamp: Date;
  category: string;
  adType: string;
  formatPattern: string;
}

// Store feedback in Firestore
async function storeFeedback(feedback: FeedbackEntry): Promise<void> {
  try {
    await db.collection("ai_feedback").add({
      ...feedback,
      timestamp: new Date(),
    });
    console.log(`📝 Feedback stored for category: ${feedback.category}`);
  } catch (error) {
    console.error("Error storing feedback:", error);
    throw error;
  }
}

// Get relevant feedback from Firestore (simplified to avoid index issues)
async function getRelevantFeedback(
  input: string,
  category: string
): Promise<FeedbackEntry[]> {
  try {
    // Get recent feedback without complex queries to avoid index issues
    const feedbackQuery = await db
      .collection("ai_feedback")
      .orderBy("timestamp", "desc")
      .limit(10)
      .get();

    const feedbacks: FeedbackEntry[] = [];
    feedbackQuery.forEach((doc) => {
      const data = doc.data();
      feedbacks.push({
        originalInput: data.originalInput,
        aiResponse: data.aiResponse,
        userCorrection: data.userCorrection,
        timestamp: data.timestamp.toDate(),
        category: data.category,
        adType: data.adType,
        formatPattern: data.formatPattern,
      });
    });

    // Filter for relevant feedback based on category and similar content
    const relevantFeedbacks = feedbacks.filter((feedback) => {
      // Match by category first
      if (feedback.category === category) return true;

      // Match by similar content (simple keyword matching)
      const inputWords = input.toLowerCase().split(/\s+/);
      const feedbackWords = feedback.originalInput.toLowerCase().split(/\s+/);
      const commonWords = inputWords.filter((word) =>
        feedbackWords.includes(word)
      );

      return commonWords.length >= 2; // At least 2 common words
    });

    return relevantFeedbacks.slice(0, 3); // Return top 3 most relevant
  } catch (error) {
    console.error("Error getting feedback:", error);
    return []; // Return empty array on error
  }
}

// Fetch policy document and Google Sheets data
async function fetchPolicyData(): Promise<{
  policy: string;
  vehicleList: string;
  clothingList: string;
  itemsList: string;
}> {
  try {
    // Policy document
    const policyUrl =
      "https://docs.google.com/document/d/1hVzGDO5e54jd4-wS9SBMHPQMLyMTN_HJMf22KePaOR8/edit?tab=t.0";
    const policyResponse = await fetch(policyUrl);
    const policy = await policyResponse.text();

    // Google Sheets data
    const sheetsUrl =
      "https://docs.google.com/spreadsheets/d/1Tg8sampEnrUZ0SCfec0dCR2UZGN0pUsf93WaDnyWfv0/edit?gid=1874456586#gid=1874456586";
    const sheetsResponse = await fetch(sheetsUrl);
    const sheetsData = await sheetsResponse.text();

    // Parse CSV data from sheets
    const lines = sheetsData.split("\n");
    const vehicleList = lines
      .filter((line) => line.includes("vehicle") || line.includes("car"))
      .join("\n");
    const clothingList = lines
      .filter(
        (line) =>
          line.includes("clothing") ||
          line.includes("pants") ||
          line.includes("shirt")
      )
      .join("\n");
    const itemsList = lines
      .filter((line) => line.includes("item") || line.includes("misc"))
      .join("\n");

    return {
      policy,
      vehicleList,
      clothingList,
      itemsList,
    };
  } catch (error) {
    console.error("Error fetching policy data:", error);
    throw error;
  }
}

// Detect category from input
function detectCategory(input: string): string {
  const lowerInput = input.toLowerCase();

  if (
    lowerInput.includes("vehicle") ||
    lowerInput.includes("car") ||
    lowerInput.includes("motorcycle") ||
    lowerInput.includes("boat") ||
    lowerInput.includes("plane")
  ) {
    return "auto";
  }
  if (
    lowerInput.includes("hiring") ||
    lowerInput.includes("job") ||
    lowerInput.includes("work") ||
    lowerInput.includes("employee")
  ) {
    return "work";
  }
  if (
    lowerInput.includes("service") ||
    lowerInput.includes("repair") ||
    lowerInput.includes("maintenance") ||
    lowerInput.includes("offering")
  ) {
    return "service";
  }
  if (
    lowerInput.includes("house") ||
    lowerInput.includes("apartment") ||
    lowerInput.includes("property") ||
    lowerInput.includes("real estate")
  ) {
    return "real estate";
  }
  if (lowerInput.includes("looking for") || lowerInput.includes("dating")) {
    return "dating";
  }
  if (
    lowerInput.includes("discount") ||
    lowerInput.includes("sale") ||
    lowerInput.includes("special offer")
  ) {
    return "discount";
  }
  if (
    lowerInput.includes("business") ||
    lowerInput.includes("store") ||
    lowerInput.includes("restaurant") ||
    lowerInput.includes("trading")
  ) {
    return "business";
  }

  return "other"; // Default category
}

// Analyze ad pattern
function analyzeAdPattern(input: string): {
  adType: string;
  formatPattern: string;
} {
  const lowerInput = input.toLowerCase();

  let adType = "general";
  let formatPattern = "selling";

  if (lowerInput.includes("hiring") || lowerInput.includes("job")) {
    adType = "job";
    formatPattern = "hiring";
  } else if (
    lowerInput.includes("offering") ||
    lowerInput.includes("service")
  ) {
    adType = "service";
    formatPattern = "offering";
  } else if (
    lowerInput.includes("trading") ||
    lowerInput.includes("business")
  ) {
    adType = "business";
    formatPattern = "trading";
  } else if (lowerInput.includes("looking for")) {
    adType = "dating";
    formatPattern = "looking";
  } else {
    adType = "general";
    formatPattern = "selling";
  }

  return { adType, formatPattern };
}

// Format ad using Gemini AI
async function formatAdWithAI(
  adContent: string,
  categories: string[],
  categoryDisplayNames: any,
  correctCategory?: string
): Promise<string> {
  try {
    console.log("🤖 Using Google Gemini AI for ad formatting...");

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey || geminiApiKey === "your_gemini_api_key_here") {
      console.log("❌ Gemini API key not configured");
      return "ad cannot be created";
    }

    // Fetch policy data
    const { policy, vehicleList, clothingList, itemsList } =
      await fetchPolicyData();

    // Detect category and get relevant feedback
    const detectedCategory = correctCategory || detectCategory(adContent);
    const relevantFeedback = await getRelevantFeedback(
      adContent,
      detectedCategory
    );

    // Create learning context from feedback
    const learningContext =
      relevantFeedback.length > 0
        ? `\n\nLEARN FROM THESE CORRECTIONS:\n${relevantFeedback
            .map(
              (f) =>
                `❌ WRONG: "${f.aiResponse}"\n✅ CORRECT: "${f.userCorrection}"\n`
            )
            .join("\n")}`
        : "";

    // Create system prompt
    const systemPrompt = `You are a LifeInvader ad formatter. Format ads according to the policy document.

CRITICAL RULES:
1. NEVER duplicate "Selling", "Price:", or "Budget:" if already present
2. Use exact names from the provided lists
3. Follow the policy document rules exactly
4. If you cannot format the ad properly, return "ad cannot be created"
5. Always assign one of these 8 categories: auto, work, service, real estate, other, discount, dating, business

POLICY DOCUMENT:
${policy}

VEHICLE LIST:
${vehicleList}

CLOTHING LIST:
${clothingList}

ITEMS LIST:
${itemsList}

CATEGORIES:
- auto: vehicles, cars, motorcycles, boats, planes
- work: jobs, hiring, employment
- service: services, repairs, maintenance
- real estate: houses, apartments, property
- other: clothing, general items, miscellaneous
- discount: discounts, sales, special offers
- dating: only for ads starting with "Looking for..."
- business: business sales, purchases, companies

FORMATTING EXAMPLES:
1. Vehicle: "Selling my nissan gtr r34" → "Selling "Annis Skyline GT-R (R34)" in full configuration with visual upgrades, insurance and drift kit. Price: Negotiable."
2. Clothing: "Selling yellow and purple vest skins. Price: 70.000$ each" → "Selling yellow and purple vest skins. Price: $70.000 each."
3. Job: "hiring chef" → "Hiring Chef. Salary: Negotiable."
4. Service: "offering car repair" → "Offering Car Repair. Price: Negotiable."
5. Business: "selling restaurant" → "Selling Restaurant. Price: Negotiable."
6. Real Estate: "selling house" → "Selling House. Price: Negotiable."

PRICE FORMATTING:
- Use periods for thousands: $70.000 (not $70,000)
- For millions: $1 Million. (with period)

Output format: Just the formatted ad text, followed by "Category: [CATEGORY_NAME]" on a new line.

${learningContext}`;

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Call Gemini API
    const result = await model.generateContent([
      systemPrompt,
      `Format this ad: "${adContent}"`,
    ]);
    const formattedResponse = result.response.text().trim();

    if (
      !formattedResponse ||
      formattedResponse.toLowerCase().includes("cannot be created")
    ) {
      return "ad cannot be created";
    }

    // Parse response
    const lines = formattedResponse.trim().split("\n");
    let formattedAd = lines[0];
    const categoryLine = lines.find((line) => line.startsWith("Category:"));

    // Apply anti-duplication fixes
    formattedAd = formattedAd
      .replace(/Selling\s+Selling/g, "Selling")
      .replace(/Price:\s*Price:/g, "Price:")
      .replace(/Budget:\s*Budget:/g, "Budget:")
      .replace(/\s+/g, " ")
      .trim();

    // Extract category
    let category = correctCategory || detectedCategory;
    if (categoryLine && !correctCategory) {
      const extractedCategory = categoryLine
        .replace("Category:", "")
        .trim()
        .toLowerCase();
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
      if (officialCategories.includes(extractedCategory)) {
        category = extractedCategory;
      }
    }

    console.log("✅ Gemini AI formatting completed successfully");
    return `${formattedAd}\nCategory: ${category}`;
  } catch (error) {
    console.error("❌ Gemini AI error:", error);
    return "ad cannot be created";
  }
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
      correctCategory, // New field for user to specify correct category
    } = await request.json();

    // Handle feedback submission
    if (feedback && originalResponse) {
      const category = correctCategory || detectCategory(query); // Use user-specified category if provided
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

      // Store feedback
      await storeFeedback(feedbackEntry);

      console.log(
        `📝 Feedback stored for category: ${category} (${adType} ${formatPattern})`
      );
      console.log(`Original: "${query}"`);
      console.log(`AI Response: "${originalResponse}"`);
      console.log(`User Correction: "${feedback}"`);

      return NextResponse.json({
        response: `Thank you for the feedback! I've learned from your correction and will apply this knowledge to future similar requests.`,
        feedbackStored: true,
      });
    }

    // Format ad using AI
    const formattedAd = await formatAdWithAI(
      query,
      categories,
      categoryDisplayNames,
      correctCategory
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
