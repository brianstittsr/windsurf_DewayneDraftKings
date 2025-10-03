import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/sms/templates - Get all SMS templates
export async function GET() {
  try {
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      // Return default templates if Firebase unavailable
      return NextResponse.json({ 
        success: true, 
        templates: getDefaultTemplates()
      });
    }

    const { collection, getDocs } = await import('firebase/firestore');
    
    const templatesRef = collection(db, 'sms_templates');
    const snapshot = await getDocs(templatesRef);
    
    const templates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // If no templates in database, return defaults
    if (templates.length === 0) {
      return NextResponse.json({
        success: true,
        templates: getDefaultTemplates()
      });
    }

    return NextResponse.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error fetching SMS templates:', error);
    return NextResponse.json({ 
      success: true, 
      templates: getDefaultTemplates()
    });
  }
}

function getDefaultTemplates() {
  return [
    {
      id: 'welcome',
      name: 'Welcome Message',
      message: 'Welcome to All Pro Sports NC! We\'re excited to have you join us. Check your email for important information.',
      category: 'onboarding',
      variables: []
    },
    {
      id: 'practice_reminder',
      name: 'Practice Reminder',
      message: 'Reminder: Practice tomorrow at 6 PM. Please arrive 15 minutes early. See you there!',
      category: 'reminders',
      variables: []
    },
    {
      id: 'game_day',
      name: 'Game Day',
      message: 'Game day! Don\'t forget your uniform and arrive 30 minutes before kickoff. Let\'s go!',
      category: 'events',
      variables: []
    },
    {
      id: 'payment_reminder',
      name: 'Payment Reminder',
      message: 'Friendly reminder: Your payment is due soon. Please complete payment to avoid any interruptions.',
      category: 'billing',
      variables: []
    },
    {
      id: 'schedule_update',
      name: 'Schedule Update',
      message: 'Schedule Update: Please check the app for the latest schedule changes. Contact us with any questions.',
      category: 'updates',
      variables: []
    }
  ];
}
