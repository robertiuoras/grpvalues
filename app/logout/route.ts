// app/api/logout/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { db } from "@lib/firebaseAdmin"; // Ensure firebaseAdmin is correctly imported and initialized

export async function GET(request: NextRequest) {
  // This is a GET request handler
  console.log("API: /logout GET request received.");
  try {
    // FIX: Await cookies() to resolve the Promise<ReadonlyRequestCookies> type error
    const cookieStore = await cookies();
    const accessCodeCookie = cookieStore.get("accessCode");

    console.log("API: Clearing authentication cookies...");
    cookieStore.delete("isAuthenticated");
    cookieStore.delete("authTimestamp");
    cookieStore.delete("userRole");
    cookieStore.delete("accessCode"); // Delete the accessCode cookie itself
    console.log("API: Cookies cleared on server-side.");

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
