import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/sms/messages - Get all SMS messages
export async function GET() {
  try {
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: true, 
        messages: [] 
      });
    }

    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    
    const messagesRef = collection(db, 'sms_messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      sentAt: doc.data().sentAt?.toDate?.()?.toISOString() || null,
      scheduledFor: doc.data().scheduledFor?.toDate?.()?.toISOString() || null
    }));

    return NextResponse.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching SMS messages:', error);
    return NextResponse.json({ 
      success: true, 
      messages: []
    });
  }
}
