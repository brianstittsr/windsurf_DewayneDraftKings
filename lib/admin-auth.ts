import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export interface AdminUser {
  username: string;
  role: 'admin' | 'coach' | 'player';
}

// In production, this should be stored in a secure database
const ADMIN_USERS = [
  // Admin users
  { username: 'admin@example.com', password: 'admin123', role: 'admin' as const },
  { username: 'admin', password: 'AllProSports2024!', role: 'admin' as const },
  // Coach users
  { username: 'coach@example.com', password: 'coach123', role: 'coach' as const },
  { username: 'coach', password: 'Coach2024!', role: 'coach' as const },
  // Player users
  { username: 'player@example.com', password: 'player123', role: 'player' as const },
  { username: 'player', password: 'Player2024!', role: 'player' as const }
];

export async function verifyAdminToken(request: NextRequest): Promise<AdminUser | null> {
  try {
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    return payload as unknown as AdminUser;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function requireAdminAuth(request: NextRequest): Promise<AdminUser> {
  const user = await verifyAdminToken(request);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

// Client-side auth check
export async function checkAdminAuth(): Promise<{ isAuthenticated: boolean; user?: AdminUser }> {
  try {
    const response = await fetch('/api/auth/admin/verify', {
      method: 'GET',
      credentials: 'include'
    });
    
    const data = await response.json();
    
    return {
      isAuthenticated: data.success,
      user: data.user
    };
  } catch (error) {
    console.error('Auth check failed:', error);
    return { isAuthenticated: false };
  }
}
