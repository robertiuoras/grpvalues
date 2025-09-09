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

// Brand replacement mapping (Real → Fake) - Updated per LifeInvader Policy
const BRAND_REPLACEMENTS: { [key: string]: string } = {
  // Core policy brands
  adidas: "abibas",
  nike: "niki",
  jordan: "mordan",
  gucci: "muci",
  supreme: "kupreme",
  "off-white": "up-green",
  "off white": "up-green",
  offwhite: "up-green",
  "louis vuitton": "lui vi",
  rolex: "kolex",
  "calvin klein": "alvin lein",
  "tommy hilfiger": "bommy hilfiger",
  "n.a.s.a.": "n.e.s.a.",
  "nike air force": "niki ground porce",
  "ground jordan": "ground mordan",

  // Additional common brands
  burberry: "murberry",
  chanel: "khanel",
  champion: "khampion",
  casio: "kasio",
  crocs: "rocs",
  fendi: "bendi",
  gap: "cap",
  "air dior": "air bior",
  dior: "bior",
  prada: "brada",
  versace: "bersace",
  yeezy: "keezy",
  marshmello: "sashmello",
  "new balance": "new balance",

  // Keep some brands unchanged per policy
  balenciaga: "balenciaga",
  givenchy: "givenchy",
  hermes: "hermes",
  valentino: "valentino",
  celine: "celine",
  "saint laurent": "saint laurent",
  "bottega veneta": "bottega veneta",
  "marc jacobs": "marc jacobs",
  "michael kors": "michael kors",
  coach: "coach",
  "kate spade": "kate spade",
  "tory burch": "tory burch",
  "ralph lauren": "ralph lauren",
  "hugo boss": "hugo boss",
  armani: "armani",
  "dolce gabbana": "dolce gabbana",
  moschino: "moschino",
  dsquared2: "dsquared2",
  "stone island": "stone island",
  moncler: "moncler",
  "canada goose": "canada goose",
  patagonia: "patagonia",
  "north face": "north face",
  columbia: "columbia",
  timberland: "timberland",
  "dr martens": "dr martens",
  converse: "converse",
  vans: "vans",
  puma: "puma",
  reebok: "reebok",
  "under armour": "under armour",
  lululemon: "lululemon",
  uniqlo: "uniqlo",
  zara: "zara",
  "h&m": "h&m",
  "forever 21": "forever 21",
  "urban outfitters": "urban outfitters",
  "american eagle": "american eagle",
  hollister: "hollister",
  abercrombie: "abercrombie",
  "banana republic": "banana republic",
  "j crew": "j crew",
  "brooks brothers": "brooks brothers",
};

// Function to replace real brand names with fake ones
function replaceBrandNames(text: string): string {
  let result = text.toLowerCase();

  // Sort by length (longest first) to avoid partial replacements
  const sortedBrands = Object.keys(BRAND_REPLACEMENTS).sort(
    (a, b) => b.length - a.length
  );

  for (const realBrand of sortedBrands) {
    const fakeBrand = BRAND_REPLACEMENTS[realBrand];
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(
      `\\b${realBrand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "gi"
    );
    result = result.replace(regex, fakeBrand);
  }

  return result;
}

// Function to normalize common typos and variations
function normalizeInput(input: string): string {
  const typos: { [key: string]: string } = {
    buyig: "buying",
    seling: "selling",
    purchasing: "buying",
    purchase: "buying",
    sell: "selling",
    buy: "buying",
    lumi: "luminous",
    luminus: "luminous",
    luminos: "luminous",
    lumin: "luminous",
  };

  let normalized = input.toLowerCase().trim();

  // Replace common typos
  for (const [typo, correct] of Object.entries(typos)) {
    normalized = normalized.replace(new RegExp(typo, "gi"), correct);
  }

  return normalized;
}

// Function to normalize house numbers and other formatting
function normalizeFormatting(input: string): string {
  let normalized = input;

  // Convert "No" to "№" for house numbers
  normalized = normalized.replace(/\bNo(\d+)\b/gi, "№$1");

  // Convert "type" or "extra" to "of type" format
  // Match patterns like "type 15", "extra 15", "type15", "extra15"
  normalized = normalized.replace(/\b(type|extra)\s*(\d+)\b/gi, "of type $2");

  return normalized;
}

// Function to apply proper location capitalization per LifeInvader Policy
function normalizeLocationCapitalization(input: string): string {
  let normalized = input;

  // Uppercase locations (from Section 2)
  const uppercaseLocations = [
    "Amphitheatre №1",
    "Amphitheatre №2",
    "Auto Salon",
    "Bahama Mamas",
    "Banham Canyon",
    "Business Center",
    "Capitol",
    "the Casino",
    "Cayo Perico Island",
    "Chumash",
    "the Church",
    "Del Perro",
    "Diamond Bar",
    "Downtown Vinewood",
    "in Eclipse Tower",
    "El Burro Heights",
    "Fight Club",
    "Hospital",
    "Sandy Hospital",
    "Legion Square",
    "LifeInvader",
    "Little Seoul",
    "Mirror Park",
    "Residential complex",
    "in Richards Majestic",
    "Richman",
    "Rockford Hills",
    "Pacific Bluffs Country Club",
    "Paleto Bay",
    "Pillbox Hill",
    "Postal",
    "Rancho",
    "Sandy Shores",
    "Tequi-La-La bar",
    "Vanilla Unicorn Bar",
    "Vespucci Canals",
    "Vinewood Hills",
    "the Yacht",
    "West Vinewood",
  ];

  // Lowercase locations (from Section 2)
  const lowercaseLocations = [
    "ghetto",
    "beach",
    "beach market",
    "stadium",
    "fire station",
    "train station",
    "post office",
    "airport",
    "mall",
    "city",
  ];

  // Apply uppercase locations
  uppercaseLocations.forEach((location) => {
    const regex = new RegExp(
      `\\b${location.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "gi"
    );
    normalized = normalized.replace(regex, location);
  });

  // Apply lowercase locations
  lowercaseLocations.forEach((location) => {
    const regex = new RegExp(
      `\\b${location.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "gi"
    );
    normalized = normalized.replace(regex, location);
  });

  return normalized;
}

// Function to normalize and convert price formats
function normalizePrice(input: string): string {
  // Convert common price abbreviations per LifeInvader Policy
  let normalized = input;

  // Convert "11m" to "$11 Million."
  normalized = normalized.replace(/\b(\d+(?:\.\d+)?)\s*m\b/gi, "$$$1 Million.");

  // Convert "25k" to "$25.000" (periods, not commas)
  normalized = normalized.replace(/\b(\d+(?:\.\d+)?)\s*k\b/gi, "$$$1.000");

  // Convert "1.5m" to "$1.5 Million."
  normalized = normalized.replace(
    /\b(\d+(?:\.\d+)?)\s*million\b/gi,
    "$$$1 Million."
  );

  // Convert "$11 Million" to "$11 Million." (add period if missing)
  normalized = normalized.replace(
    /\$(\d+(?:\.\d+)?)\s*Million(?!\.)/gi,
    "$$$1 Million."
  );

  // Convert commas to periods for thousands (policy requirement)
  normalized = normalized.replace(/\$(\d{1,3}),(\d{3})/g, "$$$1.$2");

  // Handle billion+ amounts - change to Negotiable except houses and business
  normalized = normalized.replace(
    /\$(\d+(?:\.\d+)?)\s*Billion/gi,
    "Negotiable"
  );

  // Handle houses under $1 Million - change to Negotiable
  if (
    normalized.toLowerCase().includes("house") ||
    normalized.toLowerCase().includes("apartment")
  ) {
    normalized = normalized.replace(
      /\$(\d+(?:\.\d+)?)\s*Million/gi,
      (match, amount) => {
        const numAmount = parseFloat(amount);
        if (normalized.toLowerCase().includes("house") && numAmount < 1) {
          return "Negotiable";
        }
        if (normalized.toLowerCase().includes("apartment") && numAmount < 2) {
          return "Negotiable";
        }
        return match;
      }
    );
  }

  // Preserve specific details like "25 g.s." - don't modify these
  return normalized;
}

// Function to handle color/luminous matching for items
function findItemWithColorOrLuminous(
  input: string,
  options: string[]
): string | null {
  const inputLower = normalizeInput(input);

  // Check if input contains color or luminous
  const hasColor =
    /\b(red|blue|green|yellow|orange|purple|pink|black|white|gray|grey|brown|silver|gold|cyan|magenta|lime|maroon|navy|olive|teal|aqua|fuchsia|silver|gold)\b/i.test(
      input
    );
  const hasLuminous = /\b(luminous|lumi|luminus|luminos|lumin)\b/i.test(input);

  if (!hasColor && !hasLuminous) {
    return null;
  }

  // Extract the base item name (remove color/luminous words)
  let baseItem = inputLower
    .replace(
      /\b(red|blue|green|yellow|orange|purple|pink|black|white|gray|grey|brown|silver|gold|cyan|magenta|lime|maroon|navy|olive|teal|aqua|fuchsia|silver|gold)\b/gi,
      ""
    )
    .replace(/\b(luminous|lumi|luminus|luminos|lumin)\b/gi, "")
    .trim();

  // Find matching item
  for (const option of options) {
    const optionLower = option.toLowerCase().trim();
    if (optionLower.includes(baseItem) || baseItem.includes(optionLower)) {
      return option;
    }
  }

  return null;
}

// Function to find best match from a list
function findBestMatch(input: string, options: string[]): string | null {
  const inputLower = normalizeInput(input);

  // First try exact match
  for (const option of options) {
    if (option.toLowerCase().trim() === inputLower) {
      return option;
    }
  }

  // Then try partial match
  for (const option of options) {
    const optionLower = option.toLowerCase().trim();
    if (optionLower.includes(inputLower) || inputLower.includes(optionLower)) {
      return option;
    }
  }

  // Then try word-by-word matching
  const inputWords = inputLower.split(/\s+/);
  for (const option of options) {
    const optionLower = option.toLowerCase().trim();
    const optionWords = optionLower.split(/\s+/);

    let matches = 0;
    for (const inputWord of inputWords) {
      for (const optionWord of optionWords) {
        if (
          inputWord === optionWord ||
          inputWord.includes(optionWord) ||
          optionWord.includes(inputWord)
        ) {
          matches++;
          break;
        }
      }
    }

    if (matches >= Math.min(inputWords.length, 2)) {
      return option;
    }
  }

  return null;
}

// LifeInvader Internal Policy (embedded for reliability)
const LIFINVADER_POLICY = `
Internal Policy

Last edited 31th May 2025 by Frank Wolf
(Credit to Amara Somatra & Gionanti Thanasis)

Section 1 - General Rules:
Section 1.2 - Illegal Items & Rejections:
Section 2 - Real Estate:
Section 3 - Auto:
Section 4 - Dating:
Section 5 - Work:
Section 6 - Businesses:
Section 7 - Service:
Section 8 -Discounts:
Section 9 - Other:
Rules Of Communication

Section 1 - General Rules: 
ADs Format:
For selling: Selling→Price
Example: Selling pants for men. Price: Negotiable.
For selling/trading: Selling or trading→Price
Example: Selling or trading "Ubermacht M5 (E34)". Price: Negotiable.
For trading only: Trading (Price does not need to be mentioned in this case)
Example: Trading "Ubermacht M5 (E34)".
! - You cannot edit ADs that involve items from different categories. For instance, you cannot trade a car for a house or business, and vice versa. 
For buying: Buying→Budget
Example: Buying seeds. Budget: Negotiable.
Looking to buy changes to Buying.
Example: Looking to buy a house → Buying a house. Budget: Negotiable.
For selling and buying, if the price or budget is not mentioned, we add it as:
Price: Negotiable. Or Budget: Negotiable.
Example: 
	Raw add: Buying a house → Buying a house. Budget: Negotiable.
A colon (:) is always put after Price or Budget. 
Example: Buying seeds. Budget: Negotiable.
Money Formats:
 A dollar sign ($) must be used before the numerical value.
If the AD ends with a numerical value, then there is no need for a period (.)
Example: Price: $4.000
                 Price: $4 Million.
K is not used to represent a thousand and M is not used to represent a million. Write the full amount for thousands and the amount with Million for millions.
Examples: 
	$1k → $1.000
	$10k → $10.000
	$100k → $100.000
	$1m → $1 Million.
	$14m → $14 Million.
	$4.5m → $4.5 Million.
We use a period (.) for numerical values, instead of a comma (,)
Example: $1.000 (NOT $1,000)
If the numerical value is higher than $1 Billion, it changes to Negotiable except houses and business.
Example:
Raw ad: Selling a car. Price 2 Billion 
          → Selling a car. Price: Negotiable.
Houses and businesses can be over $1 Billion.
If someone is buying/selling a house for under $1 Million, change it to Negotiable.
If someone is buying/selling an apartment for under $2 Million, change it to Negotiable.

NOTES
Use clothing list and vehicle list documents for the exact format of clothing items/accessories and cars/bikes/planes/helicopters.
Brands and locations should be capitalised (check section).
When there is a specific amount of items in the AD, the numerical value needs to include a period (.)
Example:
	Selling 1.000 seeds. Price: Negotiable.
Double check that the AD is correct before posting it.
Remember to select the correct category for each AD.
Trading 2 items of DIFFERENT categories no longer goes under the OTHER category. You cannot edit ADs that involve items from different categories. For instance, you cannot trade a car for a house or business, and vice versa. 
You have the right to reject an AD if it is improper, incomprehensible or offending in any way.
Some ADs that get rejected should also be blacklisted (check section 1.2)

Section 1.2 - Illegal Items & Rejections: 
Rejected AND Blacklisted
Firearms/weapons/Ammunition (7 days) 
Bulletproof vests/armour plates (7 days)
Weed/cannabis seeds/trees and drugs/cocaine (5 days)
ORG items (Army uniform, balaclava, EMS medical masks, medkits and pills) (7 days)
Vehicle/people scanners (5 days)
Anti-radar/engine blockers (5 days)
Ropes/head bags (5 days)
USB with virus (5 days)
Lockpicks (5 days)
Bandit mask (5 days)
Airhorn (5 days)
Counterfeit money  (5 days)
Coloured cloth (5 days)
Crowbars (5 days)
Troll ADs (selling for ridiculous prices, etc) (3-7 days)
Any ad that includes sexual or racist references (e.g. looking for sugar daddy/looking for indian girls) (3-7 days)
Any AD insulting LI employees (7 days)
Any AD involving the sale of people (3 -7 days)
Any AD mentioning historically controversial figures (Hitler, Stalin, Jeffrey Epstein etc) (7 days)
Rejected ONLY
Specific family names
Hype Body Armour
Gangs
Nationality
Gods/Admins
Leaders and deputy leaders of an organisation
Food items (excluding fish)
Birthday ADs
ADs with improper format (Selling 2 items of different category)
The following locations:
- Mega Mall
- Gang HQs
- Black Market
- Party at LifeInvader (Excluding LI/Galaxy Rooftop), LSPD, FIB, SAHP, EMS, Government, National Guard (NG) base or FZ, Capitol, Aircraft Carrier, Power Plant, Farm, ghetto or any business 
Grand coins
Battle Pass
Weapons case / container
Defense case / container
Any dice or illegal gambling ADs
Dangerous razor
Tracking sensor

Section 2 - Real Estate: 
General Rules
A maximum of TWO properties per AD is allowed.
Example: Selling houses №213 and №767. Price: Negotiable.
If the sender mentions the number of the property, use the number symbol (№). 
Example: Selling house №758. Price: Negotiable.
A property can only have 2, 5, 9 or 25 garage spaces. Use the abbreviation g.s. to represent them.
Example: Selling a house with 5 g.s. Price: Negotiable.
A property can only have 3, 4 or 5 warehouse spaces. Use the abbreviation w.h. to represent them.
Example: Selling a house with 4 w.h. Price: Negotiable.
If a property has insurance there is no need to mention how many days. 
Example: Selling a house with insurance. Price: Negotiable.
We are allowed to put -> with a garden, insurance, view and other extra stuff like tennis court, swimming pool, helipad, long driveway etc.
Example: Selling a house with a garden, helipad and swimming pool. Price: Negotiable.
Order of the features in a real estate AD:
1) garden
2) garage spaces (2 g.s., 5 g.s. or 9 g.s., 25 g.s.)
3) warehouse spaces (3 w.h., 4 w.h. or 5 w.h.)
4) custom interior
5) insurance
6) others (helipad, tennis court, long driveway, swimming pool)
7) view (nice, beautiful, great, good view)
8) location (e.g. in Vinewood Hills, near Postal)
Examples: 
Selling house №758 with a garden, 5 g.s., 4 w.h., custom interior, insurance, helipad and great view in Vinewood Hills. Price: Negotiable.
Selling an apartment with 9 g.s., custom interior, insurance and a great view in the Casino. Price: Negotiable.
We are allowed to mention custom interior, if the sender mentions that the property is furnished or has different interiors. !CAREFUL! We CAN NOT mention the nationalities in the interiors (italian interior, russian interior, chinese interior).
Example: Selling an apartment with 9 g.s. and custom interior. Price: Negotiable.
If the customer mentioned two houses, we need to use the plural forms of the following:
garden → gardens
helipad → helipads
tennis court → tennis courts 
long driveway → long driveways 
swimming pool → swimming pools
Insurance and custom interior will remain the same without "S"
Example:

Selling 2 houses with gardens, helipads, tennis courts, long driveways and swimming pools. Price: Negotiable.

Selling houses №5 and №767 with gardens, 25 g.s., insurance and swimming pools. Price: Negotiable.

Renting a property
Instead of using Selling // Price, we use Renting out // Rent. 
Instead of using Buying // Budget, we use Looking to rent // Budget. 
Example:	Renting out house №758. Rent: Negotiable.
                	Looking to rent a house. Budget: Negotiable.
!CAREFUL! Renting out means you are giving your house to someone else for rent, looking to rent means you are looking for a house to rent!
A property can be rented per day or per week.
Example:	Renting out a house. Rent: $200.000 for 7 days.
         	     	Renting out a house. Rent: $200.000 per week.
Always put two periods on abbreviations g.s. and w.h. even if a comma comes after. Example: with a garden, 9 g.s., 5 w.h. and swimming pool. 
DO NOT mention the green zone or any gang location or name.
Instead of villa, use mansion.
  e.g. Selling a mansion. Price: Negotiable.
          Selling mansion №25. Price: Negotiable.
Instead of Casino apartment, use Casino penthouse.
  e.g. Selling a Casino penthouse. Price: Negotiable.
          Selling Casino penthouse №123. Price: Negotiable.

Section 3 - Auto: 
General Rules
A maximum of ONE vehicle is allowed per AD, unless they are trading.
Example(s): Selling or trading "Ubermacht M3 (G80)" for "Grotti Italia (F458)". Price: Negotiable.
         	     Selling "Ubermacht M3 (G80)". Price: Negotiable.
Cars, motorcycles, planes, helicopters and boats go under this category too.
The brand and the model of the car must be in quotes ("").
Example: Selling "Ubermacht M3 (G80)". Price: Negotiable.
Use the sellable car/motorcycles/boats/helicopters/planes list for the proper format of each brand and model name.

Any engine, transmission, brake or suspension upgrades to the vehicle (chip tuning upgrades) are all mentioned as configuration full or partial (if it is max upgraded or partially upgraded).
Example: Selling a car in full configuration. Price: Negotiable.
Example: Selling a car in partial configuration. Price: Negotiable. 
Any upgrades that change the appearance of the vehicle like paint, rims, wheels, headlights, etc (service station upgrades) are all mentioned as visual upgrades.
Example: Selling a car in full configuration with visual upgrades. Price: Negotiable.
If the vehicle has insurance, just mention with insurance. No need to specify the number of days.
Example: Selling a car in full configuration with visual upgrades and insurance. Price: Negotiable.
If the sender mentions turbo or drift box, change it to turbo and drift kit.
Example: Selling a car in full configuration with visual upgrades, insurance, turbo and drift kit. Price: Negotiable.
Example 2: Selling a car in full configuration with visual upgrades, insurance, tuning parts, turbo and drift kit. Price: Negotiable.
Example 3: Buying a car in partial configuration with turbo kit. Budget: Negotiable.
Order of the features of a vehicle:
1) configuration (partial or full)
2) visual upgrades
3) insurance
4) tuning parts
5) turbo kit
6) drift kit
 If the character limit exceeds 150 characters and you get an error because of it, change the complete AD to something similar to below. THIS IS ONLY A LAST RESORT:
Example: Selling "Ocelot Vanquish Zagato SB" in partial configuration, visual upgrades, insurance, tuning parts, turbo and drift kit. Price: Negotiable.
Can do ADs for an electric car.
Example: Buying an electric car. Budget: Negotiable.

Section 4 - Dating: 
General Rules
Only the following types of ADs are allowed in this category:
Looking for a specific person.
Looking for a family.
Looking for family members.
Looking for family friends.
Looking for friends.
Looking for a friend.
Looking for a wife.
Looking for a husband.
Looking for a girlfriend.
Looking for a boyfriend.
Looking for a date.

Looking for a specific person.
Make sure they mention the FULL NAME (first name and last name) and if not reject the AD with the reason: Please provide full name.
Search their name on our database (Grand RP discord, make sure to press ENTER if the person is not popping up) or on LI database (Backup City Database channel in LifeInvader discord). 
Check their roles to make sure it is allowed to be looked for. WE ARE NOT ALLOWED TO LOOK FOR (SEE NEXT PAGE):
1) Admins/gods (EN1 Administrators). If they have admin roles on a different server AND NOT on this server, and they have normal "EN | Player" role then you can look for them. If they have administrator roles on EN1 then you CAN NOT look for them. Same applies for Project Management, PR Managers or the Community Manager
2) Leaders/Deputies of a state organisation
If you cannot find them in our databases, reject the ad using the reason: Person not found in the database. Please contact LI to provide proof of existence.
If a client approaches you with proof of existence, post the photo of the proof in the Backup City Database channel and write the name so we can search it.
If you cannot find them in our databases but know the person yourself exists in the city, you can accept the ad and proceed to fill out the Backup City Database so that others may know to accept the ad as well.
Looking for a family/family members.
We are NOT allowed to mention the specific nationality of a family or a family member.
Mentioning looking for a specific family is NOT allowed.
Family recruitment ads are NOT allowed. Reject the ad with reason: Family recruitment ads are not allowed. Please contact LI to request a service.
Other rules
Looking for an Administration Assistant is ALLOWED.
Looking for a Leader of an unofficial org is ALLOWED.
Looking for a leader/deputy leader of a CRIME organisation is ALLOWED. (EN | Crime role)

BLACKLISTED Looking for ADs.
Buying a wife/husband.
Troll ads like looking for sugar daddy/mommy.
Looking for a wife/husband and listing a price or budget.
Any troll name that is not found in the database.
Any troll name that is offending in a foreign language even if it is found in the database. (if you spot something like that, inform HC immediately)
People looking for themselves.
Looking for lesbian/gay.
Looking for sex/ for a hookup

Section 5 - Work: 
General Rules
Use the phrases "Hiring" and "Looking for a job" for this category.
Example: Hiring workers. Salary: Negotiable.
         Looking for a job as a driver. Salary: $5.000
Use "Salary" in the place of Price/Budget even if the sender doesn't mention it. 
Example: Looking for a job. Salary: Negotiable.
If the sender mentions the number of the construction site, add the location and the № symbol, following the templates below:

- Hiring workers at construction site №1, on Vespucci Boulevard. Salary: Negotiable.
- Hiring workers at construction site №2, on Calais Avenue. Salary: Negotiable.
- Hiring workers at construction site №3, in Pillbox Hill. Salary: Negotiable.
- Hiring workers at construction site №4, in Mirror Park. Salary: Negotiable.

Do NOT use the word "level". Levels are represented by "years of experience".
Example: Hiring a driver with 3 years of experience at construction site №2, on Calais Avenue. Salary: Negotiable.

Constructions sites have only 5 roles that can be advertised:
1) locksmith (instead of lumberjack)
2) electrician
3) land worker (instead of farmer)
4) surveyor (instead of oilman)
5) driver

If the AD mentions more than one, change it to:
Other jobs that can be mentioned in this category:
1) trucker
2) lawyer
3) DJ
4) photographer/cameraman
5) bodyguard
6) professional dancer (NOT stripper/pole dancer)
7) oil man
8) gardener
9) pilot
10) collector
11) firefighter
12) personal assistant
13) singer
You can also mention "per hour" or "per day".
1) Hiring a DJ. Salary: $100.000 per hour.
2) Hiring a bodyguard. Salary: $100.000 per day.

Only ONE work should be promoted in an AD. If someone mentions more than one work, reject the AD with reason: Only one work allowed per AD

Section 6 - Businesses:
General Rules
Only ONE business should be promoted in an AD. If someone mentions more than one business, reject the AD with reason: Only one business allowed per AD and Trading of Business not Allowed
Selling and Buying are allowed in this category.
Use the term "private business" instead of personal.
Example: Selling a private business. Price: Negotiable.
A drug lab business is mentioned as a "Burger Shop" ONLY.
The term "family business" is allowed.
Example: Buying family business. Budget: $50 Million.
When the number of the business is mentioned, the word business should be removed.
Example: Selling 24/7 Store №27. Price: $60 Million.
BUT: Buying 24/7 Store business. Budget: $60 Million.
When the location of the business is mentioned, the location should be added.
Example: Buying Electric Charging Station business in Sandy Shores. Budget: $60 Million.

Business Categories and Proper Capitalization
Ammunition Store (not gun store or weapon store)
ATM
Bar (not strip club)
Burger Shop (not Drug lab)
Chip Tuning
Car Wash
Car Sharing
Clothing Shop (not Binco or Suburban)
Cowshed
Electric Charging Station
Farm
Fight Club
Freight Train
Gas Station
Grand Elite Clothing Shop
Hair Salon
Jewellery Store
Juice Shop
Oil Well
Parking
Pet Shop
Plantation
Service Station
State Object
Tattoo Studio
Taxi Company
Warehouse
24/7 Store

Section 7 - Service: 
General Rules
All service ADs will be found under templates located in the LifeInvader email under the ADs and business templates channel.

Services ADs are ADs that are used to promote a specific business or service that is being provided. 
If you can not find the template for the business in the appropriate channel, then you are to REJECT the template and state "Template not found in database. Contact LI to create a template." in the rejection message.

Section 8 - Discounts: 
General Rules
All of the discount templates are found in the LifeInvader email under the ADs and business templates channel.

Discount templates are identified as having a specific percentage (%) mentioned on their discount. If the AD mentions "discount" but has no (%), it goes under Services.

Section 9 - Other: 
General Rules
A maximum of THREE items can be posted in an AD of this category.
All items in this list under the "Items" tab can be promoted in the "Other" category.
Items include:
Clothing/accessories/shoes
Bags/backpacks
Resources
Seeds
Fish
Containers
Pets
Tickets
General items
Clothing order:
colour
luminous
brand 
type of clothing (pants, T-shirt, etc)
of type
for men/women
You can also use adjectives such as:
1) professional
2) luxury
3) stylish
4) casual
5) cheap
6) affordable

Men's / women's changes to for men / for women.
Extra changes to "of type".
The words rare / legendary change to exclusive / unique.

If the sender mentions the amount of seeds/fruit/etc that they are selling, there is no need to mention in bulk.
The word "extra" should be changed to "of type".
Beach Market:
1) Do not mention prices in beach market shop ADs.
2) If the sender mentions cheap prices, change it to "for good prices".
Examples:
      Selling a variety of items for good prices at beach market shop №27.
      Selling juices for good prices at beach market shop №21.
      Selling desert scarf mask for good price at beach market shop №23.
License plates:
1) A maximum of ONE license plate per AD is allowed.
2) If the license plate contains any bad/negative/provocative words, use this format instead:
Examples:
      Selling a special license plate. Price: Negotiable.
      Selling license plate (1ABC234). Price: Negotiable.
Sim cards:
1) A maximum of TWO sim-cards per AD is allowed.
2) Sim-cards must follow the format XX-XX-XXX
Examples:
      Selling a sim-card with number 11-11-111. Price: Negotiable.
      Selling sim-cards with numbers 11-11-111 and 22-22-222. Price: Negotiable.

Rules Of Communication
Keep your radio on during work by pressing F5.
Correct your colleagues if you see them making a mistake using radio chat or the radio. (Senior 1+ ONLY)
Use a calm tone when correcting your colleagues and do not ever raise your tone or correct aggressively.
Know that it is our job to correct each other so we do not repeat mistakes and that we are not targeting you for any reason, our job relies on us posting ads flawlessly to the eyes of the public.
Once corrected, reply to us so we know you acknowledged the mistake. 
Use the radio for work purposes only!

Templates:
We can not post ADs for the templates of the same business / office back to back as it will be considered as unnecessary spamming. If there are no ADs except for the templates of a particular business / office, you need to wait for 3 ADs to come and get published before posting the same template twice. If different businesses / offices are being advertised, you are allowed to post these ADs. The only exception is to make sure not to post the same business / office templates over and over again without the necessary gaps in the publishing board.
`;

// Fetch policy document and Google Sheets data
async function fetchPolicyData(): Promise<{
  policy: string;
  vehicleList: string;
  clothingList: string;
  itemsList: string;
  allItems: string[];
  carsList: string[];
  motorcyclesList: string[];
  boatsList: string[];
  clothingListItems: string[];
  itemsListItems: string[];
}> {
  try {
    // Use embedded policy for reliability
    const policy = LIFINVADER_POLICY;

    // Google Sheets data - Individual sheets for exact matching
    const sheetUrls = {
      cars: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRjuFIpuM_5_WX-1OWOUegJ1adaTatCiFUFhFw0Nmodm5ZgljB-aSfWFMvVSTAmerdfFBfBKeW7syCV/pub?gid=0&single=true&output=csv",
      motorcycles:
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vRjuFIpuM_5_WX-1OWOUegJ1adaTatCiFUFhFw0Nmodm5ZgljB-aSfWFMvVSTAmerdfFBfBKeW7syCV/pub?gid=843250620&single=true&output=csv",
      boatsPlanesHelicopters:
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vRjuFIpuM_5_WX-1OWOUegJ1adaTatCiFUFhFw0Nmodm5ZgljB-aSfWFMvVSTAmerdfFBfBKeW7syCV/pub?gid=783555750&single=true&output=csv",
      clothing:
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vRjuFIpuM_5_WX-1OWOUegJ1adaTatCiFUFhFw0Nmodm5ZgljB-aSfWFMvVSTAmerdfFBfBKeW7syCV/pub?gid=1874456586&single=true&output=csv",
      items:
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vRjuFIpuM_5_WX-1OWOUegJ1adaTatCiFUFhFw0Nmodm5ZgljB-aSfWFMvVSTAmerdfFBfBKeW7syCV/pub?gid=1618313015&single=true&output=csv",
    };

    // Fetch data from each sheet
    const [
      carsResponse,
      motorcyclesResponse,
      boatsResponse,
      clothingResponse,
      itemsResponse,
    ] = await Promise.all([
      fetch(sheetUrls.cars),
      fetch(sheetUrls.motorcycles),
      fetch(sheetUrls.boatsPlanesHelicopters),
      fetch(sheetUrls.clothing),
      fetch(sheetUrls.items),
    ]);

    const [carsData, motorcyclesData, boatsData, clothingData, itemsData] =
      await Promise.all([
        carsResponse.text(),
        motorcyclesResponse.text(),
        boatsResponse.text(),
        clothingResponse.text(),
        itemsResponse.text(),
      ]);

    // Parse CSV data from each sheet
    const parseSheetData = (data: string) => {
      const lines = data.split("\n").filter((line) => line.trim());
      return lines
        .map((line) => line.trim())
        .filter(
          (item) =>
            item &&
            item !==
              "A,STATE VALUE,B,STATE VALUE,C,STATE VALUE,D,STATE VALUE,E,STATE VALUE,F,STATE VALUE,G,STATE VALUE,H,STATE VALUE,I,STATE VALUE,J,STATE VALUE,K,STATE VALUE,L,STATE VALUE,M,STATE VALUE,N,STATE VALUE,O,STATE VALUE,P,STATE VALUE,R,STATE VALUE,S,STATE VALUE,T,STATE VALUE,U,STATE VALUE,V,STATE VALUE,W,STATE VALUE,X,STATE VALUE,Y,STATE VALUE,Z,STATE VALUE,*"
        );
    };

    const carsList = parseSheetData(carsData);
    const motorcyclesList = parseSheetData(motorcyclesData);
    const boatsList = parseSheetData(boatsData);
    const clothingList = parseSheetData(clothingData);
    const itemsList = parseSheetData(itemsData);

    // Combine all items for general reference
    const allItems = [
      ...carsList,
      ...motorcyclesList,
      ...boatsList,
      ...clothingList,
      ...itemsList,
    ];

    // Create category-specific lists for better matching
    const vehicleList = [...carsList, ...motorcyclesList, ...boatsList].join(
      "\n"
    );
    const clothingListText = clothingList.join("\n");
    const itemListText = itemsList.join("\n");

    return {
      policy,
      vehicleList,
      clothingList: clothingListText,
      itemsList: itemListText,
      allItems,
      // Individual lists for better matching
      carsList,
      motorcyclesList,
      boatsList,
      clothingListItems: clothingList,
      itemsListItems: itemsList,
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
    const {
      policy,
      vehicleList,
      clothingList,
      itemsList,
      allItems,
      carsList,
      motorcyclesList,
      boatsList,
      clothingListItems,
      itemsListItems,
    } = await fetchPolicyData();

    // Replace real brand names with fake ones
    let processedContent = replaceBrandNames(adContent);

    // Normalize formatting (house numbers, etc.)
    processedContent = normalizeFormatting(processedContent);

    // Normalize price formats
    processedContent = normalizePrice(processedContent);

    // Apply proper location capitalization
    processedContent = normalizeLocationCapitalization(processedContent);

    // Detect if it's selling or buying based on price/budget if not explicitly mentioned
    const normalizedInput = normalizeInput(processedContent);
    const hasSelling = normalizedInput.includes("selling");
    const hasBuying = normalizedInput.includes("buying");
    const hasPrice = /\b(price|budget|cost|worth|value)\b/i.test(
      processedContent
    );

    // If neither selling nor buying is mentioned but price is, assume selling
    if (!hasSelling && !hasBuying && hasPrice) {
      // This will be handled in the AI prompt
    }

    // Find matching items from Google Sheets using category-specific lists
    let matchedItem = null;
    const inputLower = normalizeInput(processedContent);

    // First try color/luminous matching for items
    if (
      inputLower.includes("clothing") ||
      inputLower.includes("shirt") ||
      inputLower.includes("pants") ||
      inputLower.includes("shoes") ||
      inputLower.includes("hat")
    ) {
      matchedItem = findItemWithColorOrLuminous(
        processedContent,
        clothingListItems
      );
    }
    if (
      !matchedItem &&
      (inputLower.includes("item") ||
        inputLower.includes("tool") ||
        inputLower.includes("equipment"))
    ) {
      matchedItem = findItemWithColorOrLuminous(
        processedContent,
        itemsListItems
      );
    }

    // Try to match from specific categories first
    if (
      inputLower.includes("car") ||
      inputLower.includes("vehicle") ||
      inputLower.includes("auto")
    ) {
      matchedItem = matchedItem || findBestMatch(processedContent, carsList);
    }
    if (
      !matchedItem &&
      (inputLower.includes("motorcycle") || inputLower.includes("bike"))
    ) {
      matchedItem = findBestMatch(processedContent, motorcyclesList);
    }
    if (
      !matchedItem &&
      (inputLower.includes("boat") ||
        inputLower.includes("plane") ||
        inputLower.includes("helicopter"))
    ) {
      matchedItem = findBestMatch(processedContent, boatsList);
    }
    if (
      !matchedItem &&
      (inputLower.includes("clothing") ||
        inputLower.includes("shirt") ||
        inputLower.includes("pants") ||
        inputLower.includes("shoes") ||
        inputLower.includes("hat"))
    ) {
      matchedItem = findBestMatch(processedContent, clothingListItems);
    }
    if (
      !matchedItem &&
      (inputLower.includes("item") ||
        inputLower.includes("tool") ||
        inputLower.includes("equipment"))
    ) {
      matchedItem = findBestMatch(processedContent, itemsListItems);
    }

    // Fallback to all items if no specific match found
    if (!matchedItem) {
      matchedItem = findBestMatch(processedContent, allItems);
    }

    const matchedItemInfo = matchedItem
      ? `\nMATCHED ITEM FROM SHEETS: "${matchedItem}"`
      : "";

    // Detect category and get relevant feedback
    const detectedCategory =
      correctCategory || detectCategory(processedContent);
    const relevantFeedback = await getRelevantFeedback(
      processedContent,
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

    // Create system prompt based on LifeInvader Internal Policy
    const systemPrompt = `You are a LifeInvader ad formatter. You MUST follow the LifeInvader Internal Policy exactly.

CRITICAL POLICY RULES:
1. NEVER duplicate "Selling", "Price:", or "Budget:" if already present
2. Use exact names from the provided lists
3. ALWAYS follow the policy document rules exactly for correct formatting
4. If you cannot format the ad properly, return "ad cannot be created"
5. Always assign one of these 8 categories: auto, work, service, real estate, other, discount, dating, business
6. ALWAYS use fake brand names instead of real ones (see brand replacement list below)
7. If a matched item is found from the sheets, use that exact name
8. For color/luminous items: Format as "Selling [color] [luminous] [EXACT_ITEM_NAME]" (e.g., "Selling red luminous [Item Name]")
9. If no "selling" or "buying" is mentioned but price/budget is present, assume it's "selling"
10. Use proper articles: "Selling a house", "Selling an apartment", "Selling house №64"
11. Preserve specific details from original ad: "25 g.s." should remain as "25 g.s."
12. Convert price abbreviations: "11m" → "$11 Million.", "25k" → "$25.000"
13. Use "№" instead of "No" for house numbers: "house №64" not "house No64"
14. For "type" or "extra" with numbers: Format as "of type [number]" (e.g., "type 15" → "of type 15")

SECTION-SPECIFIC RULES:

SECTION 1 - GENERAL RULES:
- For selling: Selling→Price (e.g., "Selling pants for men. Price: Negotiable.")
- For selling/trading: Selling or trading→Price (e.g., "Selling or trading "Ubermacht M5 (E34)". Price: Negotiable.")
- For trading only: Trading (no price needed) (e.g., "Trading "Ubermacht M5 (E34)".")
- For buying: Buying→Budget (e.g., "Buying seeds. Budget: Negotiable.")
- Looking to buy changes to Buying
- Always add "Price: Negotiable." or "Budget: Negotiable." if not mentioned
- A colon (:) is always put after Price or Budget
- Money formats: Use $ before numerical value, periods (.) not commas (,)
- Convert: $1k → $1.000, $1m → $1 Million., $14m → $14 Million.
- If numerical value > $1 Billion, change to Negotiable (except houses and business)
- Houses under $1 Million → Negotiable, Apartments under $2 Million → Negotiable

SECTION 1.2 - REJECTION RULES:
REJECT AND BLACKLIST (return "ad cannot be created"):
- Firearms/weapons/ammunition, bulletproof vests, drugs, ORG items
- Vehicle/people scanners, anti-radar, ropes, USB with virus, lockpicks
- Bandit mask, airhorn, counterfeit money, coloured cloth, crowbars
- Troll ads, sexual/racist references, insulting LI employees
- Sale of people, historically controversial figures

REJECT ONLY (return "ad cannot be created"):
- Specific family names, gangs, nationality, gods/admins
- Leaders/deputy leaders of organisations, food items (excluding fish)
- Birthday ads, improper format, forbidden locations
- Grand coins, Battle Pass, weapons/defense cases, gambling

SECTION 2 - REAL ESTATE:
- Maximum TWO properties per AD
- Use № for property numbers: "Selling house №758"
- Garage spaces: 2, 5, 9, or 25 g.s. (use abbreviation)
- Warehouse spaces: 3, 4, or 5 w.h. (use abbreviation)
- Order: garden, garage spaces, warehouse spaces, custom interior, insurance, others, view, location
- Use "mansion" not "villa", "Casino penthouse" not "Casino apartment"
- For renting: "Renting out" / "Rent" instead of "Selling" / "Price"

SECTION 3 - AUTO:
- Maximum ONE vehicle per AD (unless trading)
- Brand and model in quotes: "Ubermacht M3 (G80)"
- Configuration: "full configuration" or "partial configuration"
- Visual upgrades: paint, rims, wheels, headlights, etc.
- Order: configuration, visual upgrades, insurance, tuning parts, turbo kit, drift kit
- "turbo" and "drift box" → "turbo kit" and "drift kit"

SECTION 4 - DATING:
- ONLY allowed: Looking for specific person, family, family members, family friends, friends, wife, husband, girlfriend, boyfriend, date
- Must provide FULL NAME for specific person
- NOT ALLOWED: Admins/gods, leaders/deputy leaders of state organisations
- BLACKLISTED: Buying wife/husband, sugar daddy/mommy, troll names, sex/hookup

SECTION 5 - WORK:
- Use "Hiring" and "Looking for a job"
- Use "Salary" instead of Price/Budget
- Construction sites: №1 (Vespucci Boulevard), №2 (Calais Avenue), №3 (Pillbox Hill), №4 (Mirror Park)
- Roles: locksmith, electrician, land worker, surveyor, driver
- Other jobs: trucker, lawyer, DJ, photographer, bodyguard, professional dancer, etc.
- Use "years of experience" not "level"
- Only ONE work per AD

SECTION 6 - BUSINESS:
- Only ONE business per AD
- Use "private business" not "personal"
- Drug lab → "Burger Shop"
- When number mentioned, remove "business": "24/7 Store №27"
- When location mentioned, add location: "Electric Charging Station business in Sandy Shores"

SECTION 7 - SERVICE:
- Must use templates from LifeInvader database
- If template not found: "Template not found in database. Contact LI to create a template."

SECTION 8 - DISCOUNTS:
- Must have specific percentage (%) mentioned
- If no %, goes under Services

SECTION 9 - OTHER:
- Maximum THREE items per AD
- Clothing order: colour, luminous, brand, type, of type, for men/women
- "extra" → "of type", "rare/legendary" → "exclusive/unique"
- Beach market: "for good prices" not "cheap prices"
- License plates: maximum ONE per AD, format (1ABC234)
- Sim cards: maximum TWO per AD, format XX-XX-XXX

BRAND REPLACEMENT RULES (REAL → FAKE):
- Adidas → Abibas, Nike → Niki, Jordan → Mordan, Gucci → Muci
- Supreme → Kupreme, Off-White → Up-Green, Louis Vuitton → Lui Vi
- Rolex → Kolex, Calvin Klein → Alvin Lein, Tommy Hilfiger → Bommy Hilfiger
- N.A.S.A. → N.E.S.A., Nike Air Force → Niki Ground Porce

PROCESSED INPUT: "${processedContent}"${matchedItemInfo}

POLICY DOCUMENT:
${policy}

VEHICLE LISTS:
CARS:
${carsList.join("\n")}

MOTORCYCLES:
${motorcyclesList.join("\n")}

BOATS/PLANES/HELICOPTERS:
${boatsList.join("\n")}

CLOTHING LIST:
${clothingListItems.join("\n")}

ITEMS LIST:
${itemsListItems.join("\n")}

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
1. Vehicle: "Selling my nissan gtr r34" → "Selling "Annis Skyline GT-R (R34)". Price: Negotiable."
2. Clothing: "Selling nike shoes" → "Selling Niki shoes. Price: Negotiable."
3. Real Estate: "Selling house №64 with 5 g.s." → "Selling house №64 with 5 g.s. Price: Negotiable."
4. Work: "Hiring driver" → "Hiring a driver. Salary: Negotiable."
5. Business: "Selling cowshed" → "Selling Cowshed business. Price: Negotiable."
6. Dating: "Looking for John Smith" → "Looking for John Smith."
7. Other: "Selling red luminous hat" → "Selling red luminous [Exact Hat Name]. Price: Negotiable."

PRICE FORMATTING:
- Use periods for thousands: $70.000 (not $70,000)
- For millions: $1 Million. (with period)
- Convert abbreviations: "11m" → "$11 Million.", "25k" → "$25.000"
- Preserve specific details: "25 g.s." should remain as "25 g.s."

ARTICLE USAGE:
- Use "a" before consonant sounds: "Selling a house", "Selling a car"
- Use "an" before vowel sounds: "Selling an apartment", "Selling an item"
- For specific items with numbers: "Selling house №64", "Selling car №123"

Output format: Just the formatted ad text, followed by "Category: [CATEGORY_NAME]" on a new line.

${learningContext}`;

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Call Gemini API
    const result = await model.generateContent([
      systemPrompt,
      `Format this ad: "${processedContent}"`,
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
