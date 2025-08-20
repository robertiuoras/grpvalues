// app/api/verify-access/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@lib/firebaseAdmin'; // FIX: Changed to use path alias
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { accessCode } = await request.json();

    if (!accessCode || typeof accessCode !== 'string') {
      console.log('API: Missing or invalid access code in request.'); // Added log
      return NextResponse.json(
        { success: false, message: 'Access code is required' },
        { status: 400 }
      );
    }

    // Clean the access code (remove spaces, convert to uppercase)
    const cleanedCode = accessCode.trim().toUpperCase().replace(/\s+/g, '');

    // Query all player access codes from Firestore
    const snapshot = await db.collection('playerAccessCodes').get();
    
    if (snapshot.empty) {
      console.log('API: No access codes found in database.'); // Added log
      return NextResponse.json(
        { success: false, message: 'Invalid access code' },
        { status: 401 }
      );
    }

    let isValidCode = false;
    let playerDoc = null;

    // Check each document to see if the access code matches
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      if (!data.isActive) {
        console.log(`API: Skipping inactive code for playerId: ${doc.id}`); // Added log
        continue; // Skip inactive codes
      }

      // Check if the plain access code matches (if stored)
      if (data.accessCode && data.accessCode.replace(/\s+/g, '') === cleanedCode) {
        isValidCode = true;
        playerDoc = doc;
        console.log(`API: Match found via plain code for playerId: ${doc.id}`); // Added log
        break;
      }

      // Check against hashed code if available
      if (data.hashedCode) {
        try {
          const isMatch = await bcrypt.compare(cleanedCode, data.hashedCode);
          if (isMatch) {
            isValidCode = true;
            playerDoc = doc;
            console.log(`API: Match found via hashed code for playerId: ${doc.id}`); // Added log
            break;
          }
        } catch (hashError) {
          console.error('API: Error comparing hashed code:', hashError); // Added log
        }
      }
    }

    if (!isValidCode || !playerDoc) {
      console.log('API: No valid access code or player document found.'); // Added log
      return NextResponse.json(
        { success: false, message: 'Invalid access code' },
        { status: 401 }
      );
    }

    // Update usage statistics
    const currentData = playerDoc.data();
    await playerDoc.ref.update({
      usageCount: (currentData.usageCount || 0) + 1,
      lastUsed: new Date(),
    });

    console.log(`API: Access granted for player: ${currentData.playerId}`);
    const responseData = { // Prepare response data explicitly
      success: true,
      message: 'Access granted',
      playerId: currentData.playerId,
      userRole: currentData.role || 'user', // Include the user's role, default to 'user' if not set
    };
    console.log('API: Sending response data:', responseData); // NEW LOG

    return NextResponse.json(responseData); // Return the explicitly prepared data

  } catch (error) {
    console.error('API: Fatal access verification error:', error); // Changed log
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
