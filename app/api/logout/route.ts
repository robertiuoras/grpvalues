// app/api/logout/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { db } from "../../../lib/firebaseAdmin"; // Ensure firebaseAdmin is correctly imported and initialized

export async function GET(request: NextRequest) {
  // This is a GET request handler
  console.log("API: /logout GET request received.");
  try {
    const cookieStore = await cookies(); // FIX: Await cookies() to resolve the Promise
    const accessCodeCookie = cookieStore.get("accessCode");

    // --- Start Cookie Domain Logic (ensuring consistent domain for deletion) ---
    let cookieDomain = "";
    // Determine the cookie domain dynamically for Vercel deployment consistency
    if (process.env.NODE_ENV === "production" && request.headers.get("host")) {
      // For production, get the host from the request headers
      // Remove port number if present, and ensure it's a valid domain format
      cookieDomain = request.headers
        .get("host")!
        .replace(/:\d+$/, "")
        .replace(/^www\./, "");
    }

    // Base options for cookie deletion (maxAge: 0 to expire immediately)
    // These options will be used with cookieStore.set() to force deletion.
    const cookieDeleteOptions = {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as "strict" | "lax" | "none",
      maxAge: 0, // Set maxAge to 0 to instruct the browser to delete the cookie
      ...(cookieDomain && { domain: cookieDomain }), // Conditionally add domain for deletion
    };
    // --- End Cookie Domain Logic ---

    console.log(
      "API: Clearing authentication cookies by setting maxAge to 0..."
    );
    // To delete a cookie with specific options (like domain/path), you must re-set it with maxAge: 0.
    cookieStore.set("isAuthenticated", "", cookieDeleteOptions);
    cookieStore.set("authTimestamp", "", cookieDeleteOptions);
    cookieStore.set("userRole", "", cookieDeleteOptions);
    cookieStore.set("userId", "", cookieDeleteOptions);
    cookieStore.set("accessCode", "", cookieDeleteOptions);
    console.log(
      "API: Cookies marked for deletion on server-side with options:",
      cookieDeleteOptions
    );

    if (accessCodeCookie) {
      const accessCodeDocId = accessCodeCookie.value; // This should be the Firestore document ID
      console.log(
        `API: Access code cookie found: '${accessCodeDocId}'. Attempting to unlock Firestore document.`
      );

      // --- CRITICAL Debugging Checks for 'db' instance (re-added for robustness) ---
      if (!db) {
        console.error(
          "[API Error] Firestore 'db' instance is undefined or null upon entry. Check Firebase Admin SDK initialization in lib/firebaseAdmin.js."
        );
        // Log this error but continue the logout flow (cookies are already cleared)
      } else if (typeof db.collection !== "function") {
        console.error(
          "[API Error] 'db' object does not appear to be a valid Firestore instance. Missing 'collection' method."
        );
        // Log this error but continue the logout flow (cookies are already cleared)
      } else {
        // --- End Debug Logging ---
        try {
          const codeRef = db
            .collection("playerAccessCodes")
            .doc(accessCodeDocId);
          console.log(`API: Checking Firestore document path: ${codeRef.path}`);
          const doc = await codeRef.get();

          if (doc.exists) {
            const docData = doc.data();
            console.log(
              `API: Document '${accessCodeDocId}' exists. Current 'is_in_use': ${docData?.is_in_use}, Role: ${docData?.role}`
            );

            // Only mark as "not in use" for non-admin codes, since admin codes can be shared
            if (docData?.is_in_use && docData?.role !== "admin") {
              await codeRef.update({
                is_in_use: false,
              });
              console.log(
                `API: Successfully updated 'is_in_use' to false for document ID: '${accessCodeDocId}'.`
              );
            } else if (docData?.role === "admin") {
              console.log(
                `API: Document '${accessCodeDocId}' is an admin code. Not marking as 'not in use' to allow multiple admin sessions.`
              );
            } else {
              console.log(
                `API: Document '${accessCodeDocId}' was already 'is_in_use: false'. No update needed.`
              );
            }
          } else {
            console.warn(
              `API: Firestore document ID '${accessCodeDocId}' from cookie does not exist.`
            );
          }
        } catch (firestoreError) {
          console.error(
            `API: Error during Firestore update for document ID '${accessCodeDocId}':`,
            firestoreError
          );
          // Continue the logout flow (cookies are already cleared) even if Firestore update fails.
        }
      }
    } else {
      console.log(
        "API: No accessCode cookie found. Cannot unlock Firestore document."
      );
    }

    console.log("API: Logout process completed. Redirecting to login page.");
    const redirectUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(redirectUrl);
    return response;
  } catch (error) {
    console.error("API: Fatal error in logout_route:", error);
    // Ensure redirection even on unexpected errors
    const redirectUrl = new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }
}
