import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../../lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdminToken(request);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json({
      success: false,
      error: 'Verification failed'
    }, { status: 500 });
  }
}
