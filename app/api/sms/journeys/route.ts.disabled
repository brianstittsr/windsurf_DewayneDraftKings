import { NextRequest, NextResponse } from 'next/server';
import { smsJourneyService, SMSJourneyService } from '@/lib/sms-journey-service';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { SMS_COLLECTIONS } from '@/lib/sms-schema';

// GET - List all journeys
export async function GET() {
  try {
    // Check if Firebase is properly initialized
    if (!db) {
      console.error('Firebase Firestore not initialized');
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    const journeysRef = collection(db, SMS_COLLECTIONS.SMS_JOURNEYS);
    const querySnapshot = await getDocs(journeysRef);
    
    const journeys = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      journeys,
      templates: SMSJourneyService.getJourneyTemplates()
    });
  } catch (error) {
    console.error('Error fetching journeys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journeys' },
      { status: 500 }
    );
  }
}

// POST - Create a new journey or start a subscriber on a journey
export async function POST(request: NextRequest) {
  try {
    const { action, journeyData, subscriberId, journeyId } = await request.json();

    if (action === 'create') {
      // Create a new journey
      if (!journeyData) {
        return NextResponse.json(
          { error: 'Journey data is required' },
          { status: 400 }
        );
      }

      const newJourneyId = await smsJourneyService.createJourney(journeyData);
      
      return NextResponse.json({
        success: true,
        journeyId: newJourneyId,
        message: 'Journey created successfully'
      });
    }

    if (action === 'start') {
      // Start a subscriber on a journey
      if (!subscriberId || !journeyId) {
        return NextResponse.json(
          { error: 'Subscriber ID and Journey ID are required' },
          { status: 400 }
        );
      }

      await smsJourneyService.startSubscriberJourney(subscriberId, journeyId);
      
      return NextResponse.json({
        success: true,
        message: 'Subscriber journey started successfully'
      });
    }

    if (action === 'initialize_templates') {
      // Initialize predefined journey templates
      const templates = SMSJourneyService.getJourneyTemplates();
      const createdJourneys = [];

      for (const template of templates) {
        // Add stats property to template before creating journey
        const journeyWithStats = {
          ...template,
          stats: {
            totalSubscribers: 0,
            completedJourney: 0,
            optedOut: 0,
            conversionRate: 0
          }
        };
        const journeyId = await smsJourneyService.createJourney(journeyWithStats);
        createdJourneys.push({ id: journeyId, name: template.name });
      }

      return NextResponse.json({
        success: true,
        message: 'Journey templates initialized successfully',
        journeys: createdJourneys
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "create", "start", or "initialize_templates"' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in journeys API:', error);
    return NextResponse.json(
      { error: 'Failed to process journey request' },
      { status: 500 }
    );
  }
}
