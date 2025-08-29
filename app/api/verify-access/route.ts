// app/api/verify-access/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@lib/firebaseAdmin";
import bcrypt from "bcryptjs";

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

    // Clean the access code (remove spaces, convert to uppercase)
    const cleanedCode = accessCode.trim().toUpperCase().replace(/\s+/g, "");
    console.log(`API: Cleaned access code: ${cleanedCode}`);

    let playerDocRef = null;
    let matchedCodeData: any = null;

    // --- Step 1: Efficiently find the correct document ---

    // Option A: Try to find by 'accessCode' field (requires Firestore index on 'accessCode' field)
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
      // Option B: If not found by 'accessCode' field, try to find by document ID
      // This is efficient if the document ID itself is the access code (or a derivative)
      console.log(
        "API: Document not found by 'accessCode' field. Attempting to get by document ID..."
      );
      const docById = await db
        .collection("playerAccessCodes")
        .doc(cleanedCode)
        .get();

      if (docById.exists) {
        // If document found by ID, it might contain a hashedCode or even a plain accessCode field
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
    // --- End Step 1 ---

    // --- Step 2: Perform cryptographic comparison and transaction on the identified document ---
    let isCodeMatched = false;

    // Check against plain access code field (if it exists and was the primary match)
    if (
      matchedCodeData?.accessCode &&
      matchedCodeData.accessCode.replace(/\s+/g, "") === cleanedCode
    ) {
      isCodeMatched = true;
    }
    // If not matched by plain field, and a hashed code exists, compare against it
    else if (matchedCodeData?.hashedCode) {
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
        // Treat comparison failure as no match
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

    // If the code is matched, proceed with the transaction to update its status
    console.log(
      `API: Code matched. Starting Firestore transaction for document ID: ${playerDocRef.id}`
    );
    const transactionResult = await db.runTransaction(async (transaction) => {
      // Re-fetch the document within the transaction to ensure up-to-date data
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

      if (codeData?.is_in_use) {
        console.log("API: Code found but is already in use (409).");
        return {
          success: false,
          message: "This access code is already in use.",
        };
      }

      // If all checks pass, update document to mark as in use
      transaction.update(playerDocRef!, {
        is_in_use: true,
        usageCount: (codeData.usageCount || 0) + 1,
        lastUsed: new Date(),
      });
      console.log("API: Transaction update prepared: marking code as in use.");
      return { success: true, userRole: codeData.role || "user" };
    });

    if (transactionResult.success) {
      console.log(
        `API: Access granted. User role: ${transactionResult.userRole}`
      );

      const response = NextResponse.json({
        success: true,
        message: "Access granted",
        userRole: transactionResult.userRole,
      });

      response.cookies.set("accessCode", playerDocRef!.id, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
      });
      console.log("API: Login successful. Response and cookie set.");
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
