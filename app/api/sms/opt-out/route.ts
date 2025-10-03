import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/sms/opt-out - Handle SMS opt-out requests
export async function POST(request: NextRequest) {
  try {
    const { phone, userId } = await request.json();

    if (!phone && !userId) {
      return NextResponse.json({
        success: false,
        error: 'Phone number or user ID is required'
      }, { status: 400 });
    }

    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database unavailable'
      }, { status: 503 });
    }

    const { collection, addDoc, query, where, getDocs, doc, updateDoc, Timestamp } = await import('firebase/firestore');

    // Record opt-out
    const optOutsRef = collection(db, 'sms_opt_outs');
    await addDoc(optOutsRef, {
      phone: phone || null,
      userId: userId || null,
      optedOutAt: Timestamp.now(),
      source: 'manual' // or 'twilio_webhook' when integrated
    });

    // Update user profile to mark as opted out
    if (userId) {
      // Try players first
      try {
        const playerRef = doc(db, 'players', userId);
        await updateDoc(playerRef, {
          smsOptOut: true,
          smsOptOutAt: Timestamp.now()
        });
        console.log(`✓ Player ${userId} opted out of SMS`);
      } catch (playerError) {
        // Try coaches
        try {
          const coachRef = doc(db, 'coaches', userId);
          await updateDoc(coachRef, {
            smsOptOut: true,
            smsOptOutAt: Timestamp.now()
          });
          console.log(`✓ Coach ${userId} opted out of SMS`);
        } catch (coachError) {
          console.warn('User not found in players or coaches');
        }
      }
    } else if (phone) {
      // Find user by phone and update
      const playersRef = collection(db, 'players');
      const playerQuery = query(playersRef, where('phone', '==', phone));
      const playerSnapshot = await getDocs(playerQuery);

      if (!playerSnapshot.empty) {
        const playerDoc = playerSnapshot.docs[0];
        await updateDoc(playerDoc.ref, {
          smsOptOut: true,
          smsOptOutAt: Timestamp.now()
        });
        console.log(`✓ Player with phone ${phone} opted out`);
      } else {
        // Try coaches
        const coachesRef = collection(db, 'coaches');
        const coachQuery = query(coachesRef, where('phone', '==', phone));
        const coachSnapshot = await getDocs(coachQuery);

        if (!coachSnapshot.empty) {
          const coachDoc = coachSnapshot.docs[0];
          await updateDoc(coachDoc.ref, {
            smsOptOut: true,
            smsOptOutAt: Timestamp.now()
          });
          console.log(`✓ Coach with phone ${phone} opted out`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully opted out of SMS messages'
    });

  } catch (error: any) {
    console.error('Error processing opt-out:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process opt-out',
      details: error.message
    }, { status: 500 });
  }
}

// GET /api/sms/opt-out - Get all opt-outs
export async function GET() {
  try {
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: true, 
        optOuts: [] 
      });
    }

    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    
    const optOutsRef = collection(db, 'sms_opt_outs');
    const q = query(optOutsRef, orderBy('optedOutAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const optOuts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      optedOutAt: doc.data().optedOutAt?.toDate?.()?.toISOString() || null
    }));

    return NextResponse.json({
      success: true,
      optOuts
    });
  } catch (error) {
    console.error('Error fetching opt-outs:', error);
    return NextResponse.json({ 
      success: true, 
      optOuts: []
    });
  }
}
