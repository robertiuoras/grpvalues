import admin from "firebase-admin";
import { readFileSync } from 'fs';

// Try to use service account JSON file first, fall back to environment variables
let credential;

try {
  // Option 1: Use service account JSON file
  const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
  credential = admin.credential.cert(serviceAccount);
  console.log("✅ Using service account JSON file");
} catch (error) {
  // Option 2: Use environment variables
  console.log("📝 Service account JSON not found, using environment variables");
  
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Remove outer quotes and process newlines
    privateKey = privateKey.replace(/^["']/, '').replace(/["']$/, '');
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin environment variables and no serviceAccountKey.json file found."
    );
  }

  credential = admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  });
}

// Initialize Firebase Admin
let app;
try {
  app = admin.app(); // Check if default app exists
} catch (error) {
  app = admin.initializeApp({ credential });
}

export const db = admin.firestore();