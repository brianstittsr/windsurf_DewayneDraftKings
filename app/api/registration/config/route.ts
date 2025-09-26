import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';

// GET /api/registration/config - Get registration form configuration options
export async function GET(request: NextRequest) {
  try {
    // Default configuration if Firebase data doesn't exist
    const defaultConfig = {
      jerseySizes: [
        { value: 'XS', label: 'Extra Small (XS)' },
        { value: 'S', label: 'Small (S)' },
        { value: 'M', label: 'Medium (M)' },
        { value: 'L', label: 'Large (L)' },
        { value: 'XL', label: 'Extra Large (XL)' },
        { value: 'XXL', label: '2X Large (XXL)' }
      ],
      playerPositions: [
        { value: 'flex', label: 'Flexible' },
        { value: 'quarterback', label: 'Quarterback' },
        { value: 'receiver', label: 'Receiver' },
        { value: 'rusher', label: 'Rusher' },
        { value: 'offense', label: 'Offense' },
        { value: 'defense', label: 'Defense' }
      ],
      emergencyRelations: [
        { value: 'parent', label: 'Parent' },
        { value: 'guardian', label: 'Guardian' },
        { value: 'spouse', label: 'Spouse' },
        { value: 'sibling', label: 'Sibling' },
        { value: 'friend', label: 'Friend' },
        { value: 'other', label: 'Other' }
      ],
      communicationMethods: [
        { value: 'email', label: 'Email' },
        { value: 'sms', label: 'SMS/Text' },
        { value: 'phone', label: 'Phone Call' },
        { value: 'both', label: 'Email & SMS' }
      ]
    };

    try {
      // Try to fetch from Firebase
      const configDoc = await getDoc(doc(db, 'configuration', 'registration'));
      
      if (configDoc.exists()) {
        const firebaseConfig = configDoc.data();
        return NextResponse.json({
          success: true,
          config: {
            jerseySizes: firebaseConfig.jerseySizes || defaultConfig.jerseySizes,
            playerPositions: firebaseConfig.playerPositions || defaultConfig.playerPositions,
            emergencyRelations: firebaseConfig.emergencyRelations || defaultConfig.emergencyRelations,
            communicationMethods: firebaseConfig.communicationMethods || defaultConfig.communicationMethods
          },
          source: 'firebase'
        });
      } else {
        // Return default config if no Firebase document exists
        return NextResponse.json({
          success: true,
          config: defaultConfig,
          source: 'default'
        });
      }
    } catch (firebaseError) {
      console.warn('Firebase config fetch failed, using defaults:', firebaseError);
      
      // Return default config if Firebase fails
      return NextResponse.json({
        success: true,
        config: defaultConfig,
        source: 'default_fallback'
      });
    }

  } catch (error) {
    console.error('Error fetching registration config:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch registration configuration'
    }, { status: 500 });
  }
}

// POST /api/registration/config - Update registration configuration (admin only)
export async function POST(request: NextRequest) {
  try {
    const configData = await request.json();
    
    // Validate the configuration structure
    const requiredFields = ['jerseySizes', 'playerPositions', 'emergencyRelations', 'communicationMethods'];
    for (const field of requiredFields) {
      if (!configData[field] || !Array.isArray(configData[field])) {
        return NextResponse.json({
          success: false,
          error: `Invalid configuration: ${field} must be an array`
        }, { status: 400 });
      }
    }

    // Save to Firebase
    const configRef = doc(db, 'configuration', 'registration');
    await setDoc(configRef, {
      ...configData,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin' // TODO: Get actual admin user ID
    });

    return NextResponse.json({
      success: true,
      message: 'Registration configuration updated successfully'
    });

  } catch (error) {
    console.error('Error updating registration config:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update registration configuration'
    }, { status: 500 });
  }
}
