// app/api/get-active-users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@lib/firebaseAdmin.js";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // --- Backend RBAC Check ---
    const cookieStore = cookies();
    const isAuthenticatedCookie = cookieStore.get("isAuthenticated");
    const userRoleCookie = cookieStore.get("userRole");

    if (
      isAuthenticatedCookie?.value !== "true" ||
      userRoleCookie?.value !== "admin"
    ) {
      console.warn("Unauthorized access attempt to /api/get-active-users:", {
        isAuthenticated: isAuthenticatedCookie?.value,
        userRole: userRoleCookie?.value,
      });
      return NextResponse.json(
        {
          success: false,
          message:
            "Forbidden: You do not have permission to access this resource.",
        },
        { status: 403 }
      );
    }
    // --- End Backend RBAC Check ---

    // Define a time window for "recently active" users (e.g., last 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Query all player access codes that are active OR have been used recently
    // Firestore does not allow OR queries across different fields easily without denormalization
    // For simplicity and to show both statuses, we will fetch all active codes
    // and then filter/process for "recently active" on the server.
    const snapshot = await db
      .collection("playerAccessCodes")
      .where("isActive", "==", true) // Only consider active codes that are valid for use
      .get();

    const usersData: Array<{
      accessCodeId: string;
      playerId: string | null;
      is_in_use: boolean;
      lastUsed: string | null;
      isRecentlyActive: boolean;
      isActiveCode: boolean; // Add this to explicitly show if the code itself is active
    }> = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const lastUsedDate = data.lastUsed?.toDate();
      const isRecentlyActive = lastUsedDate
        ? lastUsedDate.getTime() >= oneHourAgo.getTime()
        : false;

      usersData.push({
        accessCodeId: doc.id,
        playerId: data.playerId || null, // Ensure playerId is included
        is_in_use: !!data.is_in_use, // Convert to boolean, default to false if not set
        lastUsed: lastUsedDate ? lastUsedDate.toLocaleString() : "Never",
        isRecentlyActive: isRecentlyActive,
        isActiveCode: !!data.isActive, // Explicitly show code's active status
      });
    });

    // Sort by is_in_use (true first), then by isRecentlyActive (true first), then by lastUsed (desc)
    usersData.sort((a, b) => {
      if (a.is_in_use !== b.is_in_use) return a.is_in_use ? -1 : 1;
      if (a.isRecentlyActive !== b.isRecentlyActive)
        return a.isRecentlyActive ? -1 : 1;
      // Handle 'Never' for lastUsed in sorting
      const aTime =
        a.lastUsed === "Never" ? 0 : new Date(a.lastUsed!).getTime();
      const bTime =
        b.lastUsed === "Never" ? 0 : new Date(b.lastUsed!).getTime();
      return bTime - aTime;
    });

    return NextResponse.json({ success: true, users: usersData }); // Renamed 'activeUsers' to 'users'
  } catch (error) {
    console.error("❌ Error fetching users data for admin panel:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
