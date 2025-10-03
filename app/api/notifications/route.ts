import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/notifications - Get all notifications
export async function GET() {
  try {
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: true, 
        notifications: [] 
      });
    }

    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      sentAt: doc.data().sentAt?.toDate?.()?.toISOString() || null,
      scheduledFor: doc.data().scheduledFor?.toDate?.()?.toISOString() || null,
      expiresAt: doc.data().expiresAt?.toDate?.()?.toISOString() || null
    }));

    return NextResponse.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ 
      success: true, 
      notifications: []
    });
  }
}

// POST /api/notifications - Create new notification
export async function POST(request: NextRequest) {
  try {
    console.log('=== Create Notification endpoint called ===');
    
    const data = await request.json();
    const { title, message, type, priority, targetAudience, targetUsers, scheduledFor, expiresAt, actionUrl, actionLabel } = data;

    if (!title || !message) {
      return NextResponse.json({
        success: false,
        error: 'Title and message are required'
      }, { status: 400 });
    }

    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database unavailable'
      }, { status: 503 });
    }

    const { collection, addDoc, Timestamp, getDocs } = await import('firebase/firestore');

    // Calculate total recipients
    let totalRecipients = 0;
    
    if (targetAudience === 'all') {
      const playersRef = collection(db, 'players');
      const coachesRef = collection(db, 'coaches');
      
      const [playersSnap, coachesSnap] = await Promise.all([
        getDocs(playersRef),
        getDocs(coachesRef)
      ]);
      
      totalRecipients = playersSnap.size + coachesSnap.size;
    } else if (targetAudience === 'players') {
      const playersRef = collection(db, 'players');
      const playersSnap = await getDocs(playersRef);
      totalRecipients = playersSnap.size;
    } else if (targetAudience === 'coaches') {
      const coachesRef = collection(db, 'coaches');
      const coachesSnap = await getDocs(coachesRef);
      totalRecipients = coachesSnap.size;
    } else if (targetAudience === 'specific' && targetUsers) {
      totalRecipients = targetUsers.length;
    }

    // Create notification
    const notificationsRef = collection(db, 'notifications');
    const notificationData = {
      title,
      message,
      type: type || 'info',
      priority: priority || 'medium',
      targetAudience,
      targetUsers: targetUsers || [],
      status: scheduledFor ? 'scheduled' : 'sent',
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      sentAt: scheduledFor ? null : Timestamp.now(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdAt: Timestamp.now(),
      createdBy: 'admin',
      readCount: 0,
      totalRecipients,
      actionUrl: actionUrl || null,
      actionLabel: actionLabel || null
    };

    const docRef = await addDoc(notificationsRef, notificationData);

    console.log(`✓ Notification created with ID: ${docRef.id}`);

    // TODO: Send push notifications to users
    // This would integrate with Firebase Cloud Messaging or similar service

    return NextResponse.json({
      success: true,
      message: 'Notification created successfully',
      notificationId: docRef.id,
      totalRecipients
    });

  } catch (error: any) {
    console.error('✗ Error creating notification:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create notification',
      details: error.message
    }, { status: 500 });
  }
}
