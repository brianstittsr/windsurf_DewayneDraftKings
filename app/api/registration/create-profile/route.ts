import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationPDF } from '@/lib/pdf-generator';
import { sendRegistrationEmail } from '@/lib/email-pdf-service';
import { RegistrationData, UserProfile, COLLECTIONS } from '@/lib/firestore-schema';

export async function POST(request: NextRequest) {
  try {
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const body = await request.json();
    const { registrationData, paymentId, stripeSessionId } = body;

    if (!registrationData) {
      return NextResponse.json({ error: 'Registration data is required' }, { status: 400 });
    }

    // Generate PDF
    const pdfBuffer = await generateRegistrationPDF(registrationData, {
      includeWaiver: true,
      includeLogo: true,
      headerColor: '#1f2937'
    });

    // Upload PDF to Firebase Storage (if available) or store as base64
    let registrationPdfUrl = '';
    try {
      const { storage } = await import('@/lib/firebase').catch(() => ({ storage: null }));
      if (storage) {
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const fileName = `registrations/${registrationData.firstName}_${registrationData.lastName}_${Date.now()}.pdf`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, pdfBuffer);
        registrationPdfUrl = await getDownloadURL(storageRef);
      }
    } catch (error) {
      console.warn('PDF upload to storage failed, storing as base64:', error);
      registrationPdfUrl = `data:application/pdf;base64,${Buffer.from(pdfBuffer).toString('base64')}`;
    }

    // Create user profile
    const userProfile = {
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      email: registrationData.email,
      phone: registrationData.phone,
      dateOfBirth: serverTimestamp(),
      role: registrationData.role,
      jerseySize: registrationData.jerseySize,
      registrationData: {
        ...registrationData,
        submittedAt: serverTimestamp()
      },
      registrationPdfUrl,
      stripeSessionId,
      paymentStatus: paymentId ? 'paid' : 'pending',
      paymentId,
      status: 'active',
      isVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Save to Firestore
    const docRef = await addDoc(collection(db, COLLECTIONS.USER_PROFILES), userProfile);

    // Send confirmation email
    try {
      const emailResult = await sendRegistrationEmail(registrationData, registrationData.email);
      if (!emailResult.success) {
        console.error('Email sending failed:', emailResult.error);
      }
    } catch (error) {
      console.error('Email service error:', error);
    }

    return NextResponse.json({
      success: true,
      profileId: docRef.id,
      registrationPdfUrl,
      emailSent: true
    });

  } catch (error) {
    console.error('Profile creation error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Profile creation failed'
    }, { status: 500 });
  }
}
