import { google } from "googleapis";
import fs from "fs";
import path from "path";

function getServiceAccount(): any {
  // First try to read from serviceAccountKey.json file
  const serviceAccountPath = path.join(process.cwd(), "serviceAccountKey.json");
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccountData = fs.readFileSync(serviceAccountPath, "utf8");
    return JSON.parse(serviceAccountData);
  }

  // Fallback to environment variable
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
  if (!b64) {
    throw new Error(
      "Missing service account credentials. Please provide serviceAccountKey.json or GOOGLE_SERVICE_ACCOUNT_BASE64 environment variable."
    );
  }
  return JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
}

export async function getGoogleClients() {
  const sa = getServiceAccount();
  const auth = new google.auth.JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: [
      "https://www.googleapis.com/auth/documents.readonly",
      "https://www.googleapis.com/auth/spreadsheets.readonly",
    ],
  });

  await auth.authorize();

  return {
    docs: google.docs({ version: "v1", auth }),
    sheets: google.sheets({ version: "v4", auth }),
  };
}
