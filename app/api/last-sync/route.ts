import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get the last sync time from the sync-templates endpoint
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const syncResponse = await fetch(`${baseUrl}/api/sync-templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!syncResponse.ok) {
      throw new Error('Failed to get sync status');
    }

    const syncData = await syncResponse.json();
    
    // Return the last sync time in a format that can be displayed
    const lastSync = syncData.data?.lastSync || syncData.lastSyncTime || new Date().toISOString();
    
    return NextResponse.json({
      success: true,
      lastSyncTime: lastSync,
      message: syncData.message || 'Templates are up to date'
    });
  } catch (error) {
    console.error('Error getting last sync time:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        lastSyncTime: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
