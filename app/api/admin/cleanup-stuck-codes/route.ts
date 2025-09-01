// app/api/admin/cleanup-stuck-codes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/firebaseAdmin";
import { cookies } from "next/headers";

/**
 * This cleanup function addresses "stuck codes" - access codes that remain marked as "in use"
 * even when the user is no longer actively using them.
 *
 * ROOT CAUSES:
 * - Browser crashes/closes unexpectedly
 * - Network failures during logout
 * - Session timeouts without proper cleanup
 * - Multiple tabs/windows with inconsistent state
 *
 * PREVENTION STRATEGIES (implemented elsewhere):
 * 1. Heartbeat system in useAuth hook (every 30 seconds)
 * 2. Automatic cleanup on session expiry (1 hour)
 * 3. Robust logout API with retry logic
 * 4. Browser beforeunload event handling
 *
 * This cleanup is a "safety net" for edge cases that slip through prevention.
 */
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
    let stuckCodesDetails: Array<{
      id: string;
      reason: string;
      lastUsed: string;
    }> = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      // Process all codes that are marked as in_use (including admin codes)
      if (data.is_in_use === true) {
        const lastUsed = data.lastUsed?.toDate();
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        // For admin codes, use a longer threshold (2 hours) to be more lenient
        const threshold =
          data.role === "admin" ? 2 * 60 * 60 * 1000 : 60 * 60 * 1000;
        const thresholdDate = new Date(Date.now() - threshold);

        // Clean up codes that haven't been used within the threshold
        if (!lastUsed || lastUsed < thresholdDate) {
          const reason = !lastUsed
            ? "No lastUsed timestamp"
            : data.role === "admin"
            ? "Admin inactive for over 2 hours"
            : "Inactive for over 1 hour";
          stuckCodesDetails.push({
            id: doc.id,
            reason,
            lastUsed: lastUsed ? lastUsed.toISOString() : "Never",
          });

          batch.update(doc.ref, { is_in_use: false });
          cleanedCount++;
          console.log(
            `API: cleanup-stuck-codes - Marking ${doc.id} as not in use (${reason})`
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
      stuckCodesDetails, // Provide details for admin review
    });
  } catch (error) {
    console.error("API: cleanup-stuck-codes - Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
