// lib/firebaseAdmin.js
// Centralized initialization of Firebase Admin SDK for server-side use.

import admin from "firebase-admin";

// Access environment variables
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
let FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY;

// IMPORTANT: Ensure private key newline characters are correctly parsed.
// If your .env file or hosting environment escapes newlines as \\n,
// this replacement is necessary. If they are literal \n, this does nothing.
if (FIREBASE_PRIVATE_KEY) {
  FIREBASE_PRIVATE_KEY = FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
}

// --- Debug Logging for Private Key ---
console.log("Firebase Admin Init Debug:");
console.log("  Project ID:", FIREBASE_PROJECT_ID ? "Loaded" : "MISSING");
console.log("  Client Email:", FIREBASE_CLIENT_EMAIL ? "Loaded" : "MISSING");
if (FIREBASE_PRIVATE_KEY) {
  console.log(
    "  Private Key present (length:",
    FIREBASE_PRIVATE_KEY.length,
    ")"
  );
  console.log(
    "  Private Key starts with:",
    FIREBASE_PRIVATE_KEY.substring(0, 25) + "..."
  );
  console.log(
    "  Private Key ends with:",
    "..." + FIREBASE_PRIVATE_KEY.substring(FIREBASE_PRIVATE_KEY.length - 25)
  );
  console.log(
    "  Private Key contains literal newlines?",
    FIREBASE_PRIVATE_KEY.includes("\n")
  );
} else {
  console.error(
    "  Private Key is UNDEFINED or EMPTY. Please check your .env.local or Vercel config."
  );
}
// --- End Debug Logging ---

// Only initialize once
if (!admin.apps.length) {
  try {
    // Check if all necessary credentials are provided before initializing
    if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: FIREBASE_PRIVATE_KEY, // Use the processed private key
        }),
      });
      console.log("Firebase Admin SDK initialized successfully.");
    } else {
      console.error(
        "Firebase Admin SDK: Skipping initialization due to missing environment variables."
      );
    }
  } catch (error) {
    console.error("Firebase Admin SDK initialization error:", error);
  }
}

// Export the Firestore database instance.
// Note: This line will throw an error if `initializeApp()` failed
// and no default app exists, leading to the "default Firebase app does not exist" error.
export const db = admin.firestore();
