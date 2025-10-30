import { NextRequest, NextResponse } from 'next/server';
import { getEmailConfig, addEmailRecipient, removeEmailRecipient } from '@/lib/email-config';

export const dynamic = 'force-dynamic';

// GET /api/email/recipients - Get all email recipients
export async function GET() {
  try {
    const config = await getEmailConfig();
    
    return NextResponse.json({
      success: true,
      recipients: config.registrationNotifications,
      lastUpdated: config.lastUpdated
    });
  } catch (error) {
    console.error('Error getting email recipients:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get email recipients',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/email/recipients - Add a new email recipient
export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }
    
    const success = await addEmailRecipient(email, name);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Email recipient added successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to add email recipient'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error adding email recipient:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add email recipient',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/email/recipients - Remove an email recipient
export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }
    
    const success = await removeEmailRecipient(email);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Email recipient removed successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to remove email recipient or recipient not found'
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error removing email recipient:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to remove email recipient',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
