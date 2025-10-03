# Firestore Security Rules Fix for Commissioners

## Issue
Commissioner creation is failing with a 500 error: "User failed to save to database"

This is likely a **Firestore security rules** issue where the `commissioners` collection doesn't have write permissions.

## Solution

### 1. Update Firestore Security Rules

Go to Firebase Console → Firestore Database → Rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Commissioners collection - Admin only
    match /commissioners/{commissionerId} {
      allow read: if true; // Allow reading for display
      allow write: if true; // Temporary - allow all writes for testing
      // TODO: Add proper admin authentication check:
      // allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Players collection
    match /players/{playerId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Coaches collection
    match /coaches/{coachId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Teams collection
    match /teams/{teamId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Leagues collection
    match /leagues/{leagueId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Seasons collection
    match /seasons/{seasonId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Games collection
    match /games/{gameId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Payments collection
    match /payments/{paymentId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Coupons collection
    match /coupons/{couponId} {
      allow read: if true;
      allow write: if true;
    }
    
    // SMS messages
    match /sms_messages/{messageId} {
      allow read: if true;
      allow write: if true;
    }
    
    // SMS opt-outs
    match /sms_opt_outs/{optOutId} {
      allow read: if true;
      allow write: if true;
    }
    
    // SMS templates
    match /sms_templates/{templateId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Notifications
    match /notifications/{notificationId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Tournaments
    match /tournaments/{tournamentId} {
      allow read: if true;
      allow write: if true;
    }
    
    // GoHighLevel imported workflows
    match /ghl_imported_workflows/{workflowId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Meal plans
    match /meal_plans/{mealPlanId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Pricing plans
    match /pricing_plans/{pricingId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Default - deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 2. Deploy Rules

After updating the rules in Firebase Console:
1. Click "Publish" button
2. Wait for deployment (usually instant)
3. Try creating commissioner again

### 3. Alternative: Deploy via Firebase CLI

If you have Firebase CLI installed:

```bash
# Login to Firebase
firebase login

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Or deploy everything
firebase deploy
```

### 4. Verify Rules Are Applied

Check in Firebase Console:
1. Go to Firestore Database
2. Click "Rules" tab
3. Verify the `commissioners` collection has write permissions
4. Check the "Rules Playground" to test permissions

## Temporary Development Rules

For **development only**, you can use these permissive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // WARNING: Open to all - DEV ONLY
    }
  }
}
```

⚠️ **WARNING**: Never use these rules in production!

## Production Rules (Secure)

For production, implement proper authentication:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.admin == true;
    }
    
    // Commissioners - Admin only
    match /commissioners/{commissionerId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // Players - Read public, write admin
    match /players/{playerId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Coaches - Read public, write admin
    match /coaches/{coachId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Other collections...
  }
}
```

## Testing After Fix

1. Try creating a commissioner
2. Check browser console for detailed error
3. Check Vercel logs for server-side error
4. Verify data appears in Firebase Console

## Common Errors

### Permission Denied
```
Error code: permission-denied
Solution: Update Firestore rules as shown above
```

### Missing Collection
```
Error: Collection not found
Solution: Collection will be created automatically on first write
```

### Invalid Data
```
Error: Invalid document data
Solution: Check that all required fields are provided
```

## Need Help?

If the issue persists:
1. Check Vercel function logs
2. Check Firebase Console → Firestore → Usage tab
3. Verify Firebase project is active
4. Check that environment variables are set correctly
