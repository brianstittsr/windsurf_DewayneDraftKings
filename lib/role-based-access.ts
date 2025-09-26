// Role-based access control utilities

export type UserRole = 'admin' | 'coach' | 'player';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Admin has full access to everything
    { resource: 'users', action: 'manage' },
    { resource: 'payments', action: 'manage' },
    { resource: 'coupons', action: 'manage' },
    { resource: 'teams', action: 'manage' },
    { resource: 'seasons', action: 'manage' },
    { resource: 'pricing', action: 'manage' },
    { resource: 'settings', action: 'manage' },
    { resource: 'reports', action: 'read' }
  ],
  coach: [
    // Coach can manage their own teams and players
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' }, // Only their assigned players
    { resource: 'teams', action: 'read' },
    { resource: 'teams', action: 'update' }, // Only their teams
    { resource: 'payments', action: 'read' }, // Only their players' payments
    { resource: 'reports', action: 'read' } // Limited reports
  ],
  player: [
    // Player can only view their own information
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'update' }, // Only their own profile
    { resource: 'payments', action: 'read' }, // Only their own payments
    { resource: 'teams', action: 'read' } // Only their team info
  ]
};

// Navigation items based on role
export const ROLE_NAVIGATION: Record<UserRole, string[]> = {
  admin: [
    'dashboard',
    'user-profiles', 
    'teams',
    'payments',
    'coupons',
    'seasons',
    'pricing',
    'meal-plans',
    'settings'
  ],
  coach: [
    'dashboard',
    'my-teams',
    'my-players',
    'payments',
    'reports'
  ],
  player: [
    'dashboard',
    'my-profile',
    'my-team',
    'my-payments'
  ]
};

export function hasPermission(
  userRole: UserRole, 
  resource: string, 
  action: 'create' | 'read' | 'update' | 'delete' | 'manage'
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  
  return permissions.some(permission => 
    permission.resource === resource && 
    (permission.action === 'manage' || permission.action === action)
  );
}

export function canAccessNavItem(userRole: UserRole, navItem: string): boolean {
  return ROLE_NAVIGATION[userRole].includes(navItem);
}

export function getAvailableNavItems(userRole: UserRole): string[] {
  return ROLE_NAVIGATION[userRole];
}

// Helper function to get role display name
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'admin': return 'Administrator';
    case 'coach': return 'Coach';
    case 'player': return 'Player';
    default: return role;
  }
}

// Helper function to get role color
export function getRoleColor(role: UserRole): string {
  switch (role) {
    case 'admin': return 'danger';
    case 'coach': return 'warning';
    case 'player': return 'info';
    default: return 'secondary';
  }
}
