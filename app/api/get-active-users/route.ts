// app/api/get-active-users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/firebaseAdmin";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // --- Backend RBAC Check ---
    // FIX: Await cookies() to resolve the Promise<ReadonlyRequestCookies> type error
    const cookieStore = await cookies();
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

    const snapshot = await db
      .collection("playerAccessCodes")
      .where("isActive", "==", true)
      .get();

    const usersData: Array<{
      accessCodeId: string;
      playerId: string | null;
      is_in_use: boolean;
      lastUsed: string | null;
      isRecentlyActive: boolean;
      isActiveCode: boolean;
    }> = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const lastUsedDate = data.lastUsed?.toDate();

      const isRecentlyActive = lastUsedDate
        ? lastUsedDate.getTime() >= oneHourAgo.getTime()
        : false;

      // If a user hasn't been active for over 1 hour, consider them logged out
      // regardless of the is_in_use field (this prevents the display bug)
      const effectiveLoginStatus = data.is_in_use && isRecentlyActive;

      usersData.push({
        accessCodeId: doc.id,
        playerId: data.playerId || null,
        is_in_use: effectiveLoginStatus, // Use effective status instead of raw is_in_use
        lastUsed: lastUsedDate ? lastUsedDate.getTime().toString() : "Never",
        isRecentlyActive: isRecentlyActive,
        isActiveCode: !!data.isActive,
      });
    });

    usersData.sort((a, b) => {
      if (a.is_in_use !== b.is_in_use) return a.is_in_use ? -1 : 1;
      if (a.isRecentlyActive !== b.isRecentlyActive)
        return a.isRecentlyActive ? -1 : 1;
      const aTime = a.lastUsed === "Never" ? 0 : parseInt(a.lastUsed!);
      const bTime = b.lastUsed === "Never" ? 0 : parseInt(b.lastUsed!);
      return bTime - aTime;
    });

    return NextResponse.json({ success: true, users: usersData });
  } catch (error) {
    console.error("❌ Error fetching users data for admin panel:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
