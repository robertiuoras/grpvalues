import admin from "firebase-admin";
import { readFileSync } from "fs";

// Try to use service account JSON file first, fall back to environment variables
let credential;
let hasValidCredentials = false;

try {
  // Option 1: Use service account JSON file
  const serviceAccount = JSON.parse(
    readFileSync("./serviceAccountKey.json", "utf8")
  );
  credential = admin.credential.cert(serviceAccount);
  hasValidCredentials = true;
  console.log("✅ Using service account JSON file");
} catch (error) {
  // Option 2: Use environment variables
  console.log("📝 Service account JSON not found, using environment variables");

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Remove outer quotes and process newlines
    privateKey = privateKey.replace(/^["']/, "").replace(/["']$/, "");
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (
    !projectId ||
    !clientEmail ||
    !privateKey ||
    projectId === "your-firebase-project-id" ||
    clientEmail ===
      "your-firebase-client-email@your-project.iam.gserviceaccount.com" ||
    privateKey.includes("Your long private key here")
  ) {
    console.log(
      "⚠️ Firebase Admin credentials not configured - some features may not work"
    );
    hasValidCredentials = false;
  } else {
    try {
      credential = admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      });
      hasValidCredentials = true;
    } catch (credentialError) {
      console.log(
        "⚠️ Firebase Admin credential creation failed - using mock database"
      );
      hasValidCredentials = false;
    }
  }
}

// Initialize Firebase Admin
let app;
let db;

if (hasValidCredentials) {
  try {
    app = admin.app(); // Check if default app exists
    db = admin.firestore();
  } catch (error) {
    try {
      app = admin.initializeApp({ credential });
      db = admin.firestore();
    } catch (initError) {
      console.log(
        "⚠️ Firebase Admin initialization failed - using mock database"
      );
      // Create a mock db object
      db = createMockDb();
    }
  }
} else {
  console.log("⚠️ Using mock database due to missing credentials");
  db = createMockDb();
}

// Helper function to create mock database
function createMockDb() {
  return {
    collection: () => ({
      doc: () => ({
        get: () => Promise.resolve({ exists: false, data: () => null }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve(),
        delete: () => Promise.resolve(),
      }),
      where: () => ({
        limit: () => ({
          get: () => Promise.resolve({ docs: [], empty: true }),
        }),
        get: () => Promise.resolve({ docs: [], empty: true }),
      }),
    }),
  };
}

export { db };
