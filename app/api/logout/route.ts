// app/api/logout/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { db } from "@lib/firebaseAdmin"; // Ensure firebaseAdmin is correctly imported and initialized

export async function GET(request: NextRequest) {
  // This is a GET request handler
  console.log("API: /logout GET request received.");
  try {
    const cookieStore = await cookies();
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
    const cookieDeleteOptions = {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as "strict" | "lax" | "none",
      maxAge: 0, // Set maxAge to 0 to instruct the browser to delete the cookie
      ...(cookieDomain && { domain: cookieDomain }), // Conditionally add domain for deletion
    };
    // --- End Cookie Domain Logic ---

    console.log("API: Clearing authentication cookies...");
    // Pass the options to the delete method to ensure correct cookie targeting
    cookieStore.delete("isAuthenticated", cookieDeleteOptions);
    cookieStore.delete("authTimestamp", cookieDeleteOptions);
    cookieStore.delete("userRole", cookieDeleteOptions);
    cookieStore.delete("userId", cookieDeleteOptions); // Also delete the userId cookie
    cookieStore.delete("accessCode", cookieDeleteOptions); // Delete the accessCode cookie itself
    console.log(
      "API: Cookies cleared on server-side with options:",
      cookieDeleteOptions
    );

    if (accessCodeCookie) {
      const accessCodeDocId = accessCodeCookie.value; // This should be the Firestore document ID
      console.log(
        `API: Access code cookie found: '${accessCodeDocId}'. Attempting to unlock Firestore document.`
      );

      if (!db || typeof db.collection !== "function") {
        console.error(
          "API: Firestore DB object is not properly initialized in logout_route!"
        );
        // Log this error but continue the logout flow (cookies are already cleared)
      } else {
        try {
          const codeRef = db
            .collection("playerAccessCodes")
            .doc(accessCodeDocId);
          console.log(`API: Checking Firestore document path: ${codeRef.path}`);
          const doc = await codeRef.get();

          if (doc.exists) {
            const docData = doc.data();
            console.log(
              `API: Document '${accessCodeDocId}' exists. Current 'is_in_use': ${docData?.is_in_use}`
            );

            if (docData?.is_in_use) {
              await codeRef.update({
                is_in_use: false,
              });
              console.log(
                `API: Successfully updated 'is_in_use' to false for document ID: '${accessCodeDocId}'.`
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
