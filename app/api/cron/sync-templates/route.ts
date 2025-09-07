import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "your-cron-secret-here";

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.log("❌ Unauthorized cron request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("⏰ Cron job triggered - syncing templates...");

    // Call the sync API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const syncResponse = await fetch(`${baseUrl}/api/sync-templates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!syncResponse.ok) {
      throw new Error(`Sync API failed: ${syncResponse.status}`);
    }

    const syncResult = await syncResponse.json();

    console.log("✅ Cron sync completed successfully");

    return NextResponse.json({
      success: true,
      message: "Cron sync completed",
      timestamp: new Date().toISOString(),
      result: syncResult,
    });
  } catch (error) {
    console.error("❌ Cron sync error:", error);
    return NextResponse.json(
      { 
        error: "Cron sync failed", 
        details: error instanceof Error ? error.message : "Unknown error occurred" 
      },
      { status: 500 }
    );
  }
}
