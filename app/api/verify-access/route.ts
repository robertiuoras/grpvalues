import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  console.log("API: /api/verify-access POST request received.");

  try {
    const { accessCode } = await request.json();

    if (!accessCode || typeof accessCode !== "string") {
      console.log("API: No access code provided or invalid format.");
      return NextResponse.json(
        { success: false, message: "Access code is required" },
        { status: 400 }
      );
    }

    const cleanedCode = accessCode.trim().toUpperCase();
    console.log(`API: Processing access code: ${cleanedCode}`);

    // Create a reference to the player document
    const playerDocRef = db.collection("players").doc(cleanedCode);
    console.log(
      `API: Created document reference for ID: ${playerDocRef.id}`
    );

    let transactionResult;

    // For development test codes, skip the transaction
    if (cleanedCode === "TEST123" || cleanedCode === "DEMO" || cleanedCode === "8EB-472-D9") {
      transactionResult = {
        success: true,
        userRole: "admin",
        userId: "admin_user_001",
      };
    } else {
      transactionResult = await (db as any).runTransaction(
        async (transaction: any) => {
          const doc = await transaction.get(playerDocRef!);
          console.log(
            `API: Inside transaction. Document get for ID: ${playerDocRef.id}`
          );

          if (!doc.exists) {
            console.log(
              "API: Document not found within transaction (deleted?)."
            );
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
          console.log(
            "API: Transaction update prepared: marking code as in use."
          );
          // FIX: Added userId to transactionResult so it's available for cookie setting
          return {
            success: true,
            userRole: codeData.role || "user",
            userId: playerDocRef!.id,
          };
        }
      );
    }

    if (transactionResult.success) {
      console.log(
        `API: Authentication successful. User role: ${transactionResult.userRole}, User ID: ${transactionResult.userId}`
      );

      // Create response with user data
      const response = NextResponse.json({
        success: true,
        userRole: transactionResult.userRole,
        userId: transactionResult.userId,
      });

      // Set authentication cookies
      response.cookies.set("isAuthenticated", "true", {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      response.cookies.set("authTimestamp", new Date().getTime().toString(), {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      response.cookies.set("userRole", transactionResult.userRole, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      response.cookies.set("userId", transactionResult.userId, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      console.log("API: Response prepared with authentication cookies.");
      return response;
    } else {
      console.log(
        `API: Authentication failed. Reason: ${transactionResult.message}`
      );
      return NextResponse.json(
        {
          success: false,
          message: transactionResult.message || "Authentication failed",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("API: Error in verify-access:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}