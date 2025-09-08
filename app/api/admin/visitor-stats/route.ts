import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/firebaseAdmin";

export async function GET(request: NextRequest) {
  try {
    // Get client IP
    const clientIP = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";

    // Get user agent
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Get current timestamp
    const timestamp = new Date().toISOString();

    // Record this visit
    await db.collection("visitor_logs").add({
      ip: clientIP,
      userAgent,
      timestamp,
      page: request.nextUrl.pathname,
    });

    // Get time filter from query params
    const { searchParams } = new URL(request.url);
    const timeFilter = searchParams.get('filter') || 'all'; // 'all', 'daily', 'weekly'

    // Calculate time boundaries
    let startTime: Date;
    const now = new Date();
    
    switch (timeFilter) {
      case 'daily':
        startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday start
        startTime = new Date(now);
        startTime.setDate(now.getDate() - daysToSubtract);
        startTime.setHours(0, 0, 0, 0);
        break;
      default:
        startTime = new Date(0); // All time
    }

    // Get visitor statistics with time filter
    let query = db.collection("visitor_logs")
      .orderBy("timestamp", "desc")
      .limit(1000);

    if (timeFilter !== 'all') {
      query = query.where("timestamp", ">=", startTime.toISOString());
    }

    const visitorLogs = await query.get();
    const logs = visitorLogs.docs.map(doc => doc.data());
    
    // Calculate statistics
    const totalVisitors = logs.length;
    const uniqueIPs = new Set(logs.map(log => log.ip)).size;
    
    // Count online users (active in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const onlineUsers = logs.filter(log => log.timestamp > fiveMinutesAgo).length;

    // Get recent activity (last 20 entries)
    const recentActivity = logs.slice(0, 20).map(log => ({
      ip: log.ip,
      timestamp: log.timestamp,
      userAgent: log.userAgent,
      page: log.page,
    }));

    return NextResponse.json({
      totalVisitors,
      uniqueIPs,
      onlineUsers,
      recentActivity,
      timeFilter,
      period: timeFilter === 'daily' ? 'Today' : timeFilter === 'weekly' ? 'This Week' : 'All Time',
    });

  } catch (error) {
    console.error("Error fetching visitor stats:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch visitor statistics",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
