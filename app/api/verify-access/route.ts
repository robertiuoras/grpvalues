// app/api/verify-access/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@lib/firebaseAdmin";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  console.log("API: /api/verify-access POST request received.");
  try {
    const { accessCode } = await request.json();
    console.log(`API: Received access code: ${accessCode}`);

    if (!accessCode || typeof accessCode !== "string") {
      console.log("API: Missing or invalid access code in request (400).");
      return NextResponse.json(
        { success: false, message: "Access code is required" },
        { status: 400 }
      );
    }

    const cleanedCode = accessCode.trim().toUpperCase().replace(/\s+/g, "");
    console.log(`API: Cleaned access code: ${cleanedCode}`);

    let playerDocRef = null;
    let matchedCodeData: any = null;

    console.log("API: Attempting to find document by 'accessCode' field...");
    const plainCodeQuerySnapshot = await db
      .collection("playerAccessCodes")
      .where("accessCode", "==", cleanedCode)
      .limit(1)
      .get();

    if (!plainCodeQuerySnapshot.empty) {
      playerDocRef = plainCodeQuerySnapshot.docs[0].ref;
      matchedCodeData = plainCodeQuerySnapshot.docs[0].data();
      console.log(
        `API: Document found by 'accessCode' field: ${playerDocRef.id}`
      );
    } else {
      console.log(
        "API: Document not found by 'accessCode' field. Attempting to get by document ID..."
      );
      const docById = await db
        .collection("playerAccessCodes")
        .doc(cleanedCode)
        .get();

      if (docById.exists) {
        playerDocRef = docById.ref;
        matchedCodeData = docById.data();
        console.log(`API: Document found by ID: ${playerDocRef.id}`);
      }
    }

    if (!playerDocRef || !matchedCodeData) {
      console.log("API: No valid player document found after search (401).");
      return NextResponse.json(
        { success: false, message: "Invalid access code" },
        { status: 401 }
      );
    }

    let isCodeMatched = false;

    if (
      matchedCodeData?.accessCode &&
      matchedCodeData.accessCode.replace(/\s+/g, "") === cleanedCode
    ) {
      isCodeMatched = true;
    } else if (matchedCodeData?.hashedCode) {
      try {
        const isMatch = await bcrypt.compare(
          cleanedCode,
          matchedCodeData.hashedCode
        );
        if (isMatch) {
          isCodeMatched = true;
        }
      } catch (hashError) {
        console.error(
          `API: Error during bcrypt.compare for doc ${playerDocRef.id}:`,
          hashError
        );
        isCodeMatched = false;
      }
    }

    if (!isCodeMatched) {
      console.log(
        "API: Code found, but cryptographic comparison failed (401)."
      );
      return NextResponse.json(
        { success: false, message: "Invalid access code" },
        { status: 401 }
      );
    }

    console.log(
      `API: Code matched. Starting Firestore transaction for document ID: ${playerDocRef.id}`
    );
    const transactionResult = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(playerDocRef!);
      console.log(
        `API: Inside transaction. Document get for ID: ${playerDocRef.id}`
      );

      if (!doc.exists) {
        console.log("API: Document not found within transaction (deleted?).");
        return { success: false, message: "Invalid access code" };
      }

      const codeData = doc.data();

      if (!codeData?.isActive) {
        console.log("API: Code found but is not active (401).");
        return { success: false, message: "Invalid access code" };
      }

      // Skip the "in use" check for admin/owner codes to allow multiple simultaneous logins
      if (codeData?.is_in_use && codeData?.role !== "admin") {
        console.log("API: Code found but is already in use (409).");
        return {
          success: false,
          message: "This access code is already in use.",
        };
      }

      transaction.update(playerDocRef!, {
        is_in_use: true,
        usageCount: (codeData.usageCount || 0) + 1,
        lastUsed: new Date(),
      });
      console.log("API: Transaction update prepared: marking code as in use.");
      // FIX: Added userId to transactionResult so it's available for cookie setting
      return {
        success: true,
        userRole: codeData.role || "user",
        userId: playerDocRef!.id,
      };
    });

    if (transactionResult.success) {
      console.log(
        `API: Access granted. User role: ${transactionResult.userRole}, User ID: ${transactionResult.userId}`
      );

      const response = NextResponse.json({
        success: true,
        message: "Access granted",
        userRole: transactionResult.userRole,
        userId: transactionResult.userId, // Include userId in the API response
      });

      // Determine the cookie domain dynamically for Vercel deployment consistency
      let cookieDomain = "";
      if (
        process.env.NODE_ENV === "production" &&
        request.headers.get("host")
      ) {
        // For production, get the host from the request headers
        // Remove port number if present, and ensure it's a valid domain format
        cookieDomain = request.headers
          .get("host")!
          .replace(/:\d+$/, "")
          .replace(/^www\./, "");
        // For development, keep it empty (localhost)
      }

      const baseCookieOptions = {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as "strict" | "lax" | "none", // Changed to 'lax' for better cross-site behavior on navigation
        maxAge: 60 * 60, // 1 hour for session cookies as per useAuth expiry
      };

      // Cookies for client-side useAuth hook (NOT httpOnly)
      response.cookies.set("isAuthenticated", "true", {
        ...baseCookieOptions,
        httpOnly: false,
        ...(cookieDomain && { domain: cookieDomain }), // Conditionally add domain
      });
      response.cookies.set("authTimestamp", new Date().getTime().toString(), {
        ...baseCookieOptions,
        httpOnly: false,
        ...(cookieDomain && { domain: cookieDomain }),
      });
      response.cookies.set("userRole", transactionResult.userRole, {
        ...baseCookieOptions,
        httpOnly: false,
        ...(cookieDomain && { domain: cookieDomain }),
      });
      response.cookies.set("userId", transactionResult.userId as string, {
        // Explicitly cast to string
        ...baseCookieOptions,
        httpOnly: false,
        ...(cookieDomain && { domain: cookieDomain }),
      });

      // AccessCode cookie for server-side logout (CAN be httpOnly)
      response.cookies.set("accessCode", playerDocRef!.id, {
        ...baseCookieOptions,
        httpOnly: true,
        ...(cookieDomain && { domain: cookieDomain }),
      });

      console.log("API: Login successful. Response and cookies set.");
      console.log("API: Set cookies with options:", {
        ...baseCookieOptions,
        ...(cookieDomain && { domain: cookieDomain }),
      });
      return response;
    } else {
      console.log(
        `API: Verification failed. Reason: ${transactionResult.message} (401).`
      );
      return NextResponse.json(
        { success: false, message: transactionResult.message },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error(
      "API: Fatal access verification error in catch block (500):",
      error
    );
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
