import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

// Admin users (in production, these should be stored in a secure database)
const ADMIN_USERS = [
  { username: 'admin@example.com', password: 'admin123', role: 'admin' },
  { username: 'admin', password: 'AllProSports2024!', role: 'admin' }
];

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate credentials
    const user = ADMIN_USERS.find(u => u.username === username && u.password === password);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 });
    }

    // Create JWT token
    const token = await new SignJWT({ 
      username: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    // Create response with token in httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        username: user.username,
        role: user.role
      }
    });

    // Set secure cookie
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Login failed'
    }, { status: 500 });
  }
}
