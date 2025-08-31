// app/api/admin/cleanup-stuck-codes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@lib/firebaseAdmin";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Backend RBAC Check - only admins can clean up codes
    const cookieStore = await cookies();
    const isAuthenticatedCookie = cookieStore.get("isAuthenticated");
    const userRoleCookie = cookieStore.get("userRole");

    if (
      isAuthenticatedCookie?.value !== "true" ||
      userRoleCookie?.value !== "admin"
    ) {
      console.warn("Unauthorized access attempt to cleanup-stuck-codes");
      return NextResponse.json(
        { success: false, message: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    console.log("API: cleanup-stuck-codes - Starting cleanup of stuck codes");

    // Fetch all codes and filter in memory to avoid index requirements
    const snapshot = await db.collection("playerAccessCodes").get();

    if (snapshot.empty) {
      console.log("API: cleanup-stuck-codes - No codes found");
      return NextResponse.json({
        success: true,
        message: "No codes found",
        cleanedCount: 0,
      });
    }

    const batch = db.batch();
    let cleanedCount = 0;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      // Only process non-admin codes that are marked as in_use
      if (data.role !== "admin" && data.is_in_use === true) {
        const lastUsed = data.lastUsed?.toDate();
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        // Only clean up codes that haven't been used in the last hour
        if (!lastUsed || lastUsed < oneHourAgo) {
          batch.update(doc.ref, { is_in_use: false });
          cleanedCount++;
          console.log(
            `API: cleanup-stuck-codes - Marking ${doc.id} as not in use`
          );
        }
      }
    });

    if (cleanedCount > 0) {
      await batch.commit();
      console.log(
        `API: cleanup-stuck-codes - Cleaned up ${cleanedCount} stuck codes`
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up ${cleanedCount} stuck codes`,
      cleanedCount,
    });
  } catch (error) {
    console.error("API: cleanup-stuck-codes - Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
