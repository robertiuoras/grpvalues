// app/api/get-active-users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@lib/firebaseAdmin.js'; // FIX: Corrected alias usage from '@/lib' to '@lib'
import { FieldValue } from 'firebase-admin/firestore'; // Import FieldValue for timestamp queries
import { cookies } from 'next/headers'; // Import cookies for server-side access

export async function GET(request: NextRequest) {
  try {
    // --- Backend RBAC Check ---
    // FIX: Await cookies() to resolve the Promise<ReadonlyRequestCookies> type error
    const cookieStore = await cookies(); 
    const isAuthenticatedCookie = cookieStore.get('isAuthenticated');
    const userRoleCookie = cookieStore.get('userRole');

    // Check if user is authenticated and has the 'admin' role
    if (isAuthenticatedCookie?.value !== 'true' || userRoleCookie?.value !== 'admin') {
      console.warn('Unauthorized access attempt to /api/get-active-users:', {
        isAuthenticated: isAuthenticatedCookie?.value,
        userRole: userRoleCookie?.value,
        // ip: request.ip, // FIX: Removed request.ip as it causes a type error on Vercel
      });
      return NextResponse.json(
        { success: false, message: 'Forbidden: You do not have permission to access this resource.' },
        { status: 403 } // 403 Forbidden status
      );
    }
    // --- End Backend RBAC Check ---

    // Define a time window for "active" users (e.g., last 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // Changed from 15 minutes to 1 hour

    // Query access codes that are active and have activity within the last hour
    const snapshot = await db.collection('playerAccessCodes')
      .where('isActive', '==', true)
      .where('lastUsed', '>=', oneHourAgo) // Changed from lastActivity to lastUsed
      // Note: Firestore queries on range operators (like '>=') require an index.
      // If you encounter an error about a missing index, Firebase will provide a link
      // in the console to create it automatically.
      .get();

    const activeUsers: Array<{ playerId: string; lastActivity: string; accessCodeId: string }> = [];

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      // Ensure data.playerId and data.lastUsed exist before pushing
      if (data.playerId && data.lastUsed) {
        activeUsers.push({
          playerId: data.playerId,
          lastActivity: data.lastUsed.toDate().toLocaleString(), // Use data.lastUsed here
          accessCodeId: doc.id, // Include the document ID for reference
        });
      }
    });

    return NextResponse.json({ success: true, activeUsers });

  } catch (error) {
    console.error('❌ Error fetching active users:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
