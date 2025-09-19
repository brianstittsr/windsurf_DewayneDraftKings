# Firebase Permissions Fix for Pricing Collection

## Issue

The database-driven pricing system was encountering a "Missing or insufficient permissions" error when trying to access the new `pricing` collection in Firestore.

## Solution

1. **Updated Firestore Rules**
   - Added permissions for the `pricing` collection in `firestore.rules`
   - Set read and write permissions to `if true` for development (allowing all operations)

2. **Deployed Updated Rules**
   - Used `firebase deploy --only firestore:rules` to deploy the updated rules
   - Verified successful deployment through Firebase console

3. **Seeded Initial Data**
   - Created scripts to seed the initial pricing data via the API
   - Added all 5 pricing plans with correct pricing calculations

## Changes Made

### Firestore Rules Update

Added the following rule to `firestore.rules`:

```
// Pricing collection - Allow all operations for development
match /pricing/{pricingId} {
  allow read, write: if true;
}
```

### Data Seeding

Seeded the following pricing plans:
1. Jamboree Game ($23.50 + $3.00 service fee = $26.50 total)
2. Complete Season ($56.00 + $3.00 service fee = $59.00 total)
3. Jamboree + Season ($85.50 + $3.00 service fee = $88.50 total)
4. Assistant Coach ($42.00 + $3.00 service fee = $45.00 total)
5. Head Coach ($72.00 + $3.00 service fee = $75.00 total)

## Verification

- API endpoint `/api/pricing` now returns a 200 status with pricing data
- All pricing calculations are correct with proper service fee inclusion
- Admin panel can create, read, update, and delete pricing plans
- Pricing page displays data from the database instead of static fallback

## Production Considerations

For production deployment, the Firestore rules should be updated to include proper authentication and authorization checks:

```
// Pricing collection - Production rules
match /pricing/{pricingId} {
  allow read: if true;  // Public read access for pricing information
  allow create, update, delete: if isAdmin();  // Admin-only write access
}
```

This would require implementing the `isAdmin()` function that checks if the authenticated user has admin privileges.
