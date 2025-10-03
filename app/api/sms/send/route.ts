import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/sms/send - Send SMS messages
export async function POST(request: NextRequest) {
  try {
    console.log('=== SMS Send endpoint called ===');
    
    const data = await request.json();
    const { recipientType, recipients, message, scheduled, scheduledFor } = data;

    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }

    // Get Firebase
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database unavailable'
      }, { status: 503 });
    }

    const { collection, addDoc, Timestamp, getDocs, query, where } = await import('firebase/firestore');

    // Get recipient phone numbers
    let recipientList: Array<{ id: string; phone: string; name: string }> = [];

    if (recipientType === 'all') {
      // Get all players and coaches
      const playersRef = collection(db, 'players');
      const coachesRef = collection(db, 'coaches');
      
      const [playersSnap, coachesSnap] = await Promise.all([
        getDocs(playersRef),
        getDocs(coachesRef)
      ]);

      playersSnap.forEach(doc => {
        const data = doc.data();
        if (data.phone) {
          recipientList.push({
            id: doc.id,
            phone: data.phone,
            name: `${data.firstName} ${data.lastName}`
          });
        }
      });

      coachesSnap.forEach(doc => {
        const data = doc.data();
        if (data.phone) {
          recipientList.push({
            id: doc.id,
            phone: data.phone,
            name: `${data.firstName} ${data.lastName}`
          });
        }
      });
    } else if (recipientType === 'group' && recipients && recipients.length > 0) {
      // Get specific recipients
      for (const recipientId of recipients) {
        // Try players first
        const playersRef = collection(db, 'players');
        const playerQuery = query(playersRef, where('__name__', '==', recipientId));
        const playerSnap = await getDocs(playerQuery);

        if (!playerSnap.empty) {
          const data = playerSnap.docs[0].data();
          if (data.phone) {
            recipientList.push({
              id: recipientId,
              phone: data.phone,
              name: `${data.firstName} ${data.lastName}`
            });
          }
          continue;
        }

        // Try coaches
        const coachesRef = collection(db, 'coaches');
        const coachQuery = query(coachesRef, where('__name__', '==', recipientId));
        const coachSnap = await getDocs(coachQuery);

        if (!coachSnap.empty) {
          const data = coachSnap.docs[0].data();
          if (data.phone) {
            recipientList.push({
              id: recipientId,
              phone: data.phone,
              name: `${data.firstName} ${data.lastName}`
            });
          }
        }
      }
    } else if (recipientType === 'individual' && recipients && recipients.length > 0) {
      // Single recipient
      const recipientId = recipients[0];
      
      // Try players
      const playersRef = collection(db, 'players');
      const playerQuery = query(playersRef, where('__name__', '==', recipientId));
      const playerSnap = await getDocs(playerQuery);

      if (!playerSnap.empty) {
        const data = playerSnap.docs[0].data();
        if (data.phone) {
          recipientList.push({
            id: recipientId,
            phone: data.phone,
            name: `${data.firstName} ${data.lastName}`
          });
        }
      } else {
        // Try coaches
        const coachesRef = collection(db, 'coaches');
        const coachQuery = query(coachesRef, where('__name__', '==', recipientId));
        const coachSnap = await getDocs(coachQuery);

        if (!coachSnap.empty) {
          const data = coachSnap.docs[0].data();
          if (data.phone) {
            recipientList.push({
              id: recipientId,
              phone: data.phone,
              name: `${data.firstName} ${data.lastName}`
            });
          }
        }
      }
    }

    if (recipientList.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid recipients found'
      }, { status: 400 });
    }

    console.log(`✓ Found ${recipientList.length} recipients`);

    // Store SMS messages in Firebase
    const messagesRef = collection(db, 'sms_messages');
    const messagePromises = recipientList.map(recipient => 
      addDoc(messagesRef, {
        recipient: recipient.phone,
        recipientName: recipient.name,
        recipientId: recipient.id,
        recipientType: recipientType,
        message: message,
        status: scheduled ? 'scheduled' : 'pending',
        scheduledFor: scheduled && scheduledFor ? new Date(scheduledFor) : null,
        sentAt: null,
        createdAt: Timestamp.now(),
        createdBy: 'admin',
        provider: 'twilio', // or your SMS provider
        cost: 0.0075, // Approximate cost per SMS
        errorMessage: null
      })
    );

    await Promise.all(messagePromises);

    console.log(`✓ ${recipientList.length} SMS messages ${scheduled ? 'scheduled' : 'queued'}`);

    // TODO: Integrate with actual SMS provider (Twilio, etc.)
    // For now, messages are stored and marked as pending
    // You would typically send them via Twilio API here

    return NextResponse.json({
      success: true,
      message: `${recipientList.length} SMS messages ${scheduled ? 'scheduled' : 'queued'} successfully`,
      count: recipientList.length
    });

  } catch (error: any) {
    console.error('✗ Error sending SMS:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send SMS',
      details: error.message
    }, { status: 500 });
  }
}
