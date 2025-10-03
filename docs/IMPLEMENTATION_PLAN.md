# All Pro Sports NC - Implementation Plan

## ✅ COMPLETED

### 1. Coupon Usage Counter Fix
- **Status**: FIXED ✅
- **Issue**: Coupon `usedCount` not incrementing after successful payment
- **Solution**: Changed webhook to use direct Firebase update instead of HTTP fetch
- **Files Modified**:
  - `app/api/payments/webhook/route.ts`
- **Testing**: Verify coupon usage increments after payment completion

### 2. SMS Management System
- **Status**: BUILT ✅
- **Components Created**:
  - `components/SMSManagement.tsx` - Full SMS interface
  - `app/api/sms/send/route.ts` - Send SMS endpoint
  - `app/api/sms/messages/route.ts` - Message history
  - `app/api/sms/templates/route.ts` - SMS templates
- **Features**:
  - Send to individual, group, or all users
  - Message templates
  - Schedule messages
  - Character/SMS count
  - Message history
- **Next Steps**: Integrate Twilio API for actual SMS sending

### 3. Notification Management System
- **Status**: BUILT ✅
- **Components Created**:
  - `components/NotificationManagement.tsx` - Full notification interface
  - `app/api/notifications/route.ts` - CRUD operations
  - `app/api/notifications/[id]/route.ts` - Update status
- **Features**:
  - Multiple notification types
  - Priority levels
  - Target audience selection
  - Schedule and expiration
  - Action buttons
  - Read tracking
- **Next Steps**: Integrate Firebase Cloud Messaging for push notifications

---

## 🔨 IN PROGRESS

### 4. Commissioner Creation Fix
- **Status**: INVESTIGATING 🔍
- **Issue**: Create Commissioner button not saving to database
- **API Endpoint**: `/api/commissioners` - Looks correct
- **Component**: `CommissionerManagement.tsx` - Form submission looks correct
- **Debugging Steps**:
  1. Check browser console for errors when clicking "Create"
  2. Check Network tab to see if POST request is sent
  3. Check server logs for Firebase errors
  4. Verify all required fields are filled
- **Possible Issues**:
  - Form validation preventing submission
  - Missing Firebase permissions
  - Network error
- **Files to Check**:
  - `components/CommissionerManagement.tsx` (lines 51-79)
  - `app/api/commissioners/route.ts` (lines 59-142)

---

## 📋 TODO - HIGH PRIORITY

### 5. QR Code Functionality
- **Status**: NOT STARTED ❌
- **Requirements**:
  - Generate QR codes for players and coaches
  - Store QR codes in Firebase
  - Display QR codes in user profiles
  - Scan QR codes for check-in
  - Track QR code usage
  
- **Implementation Plan**:
  
  **A. QR Code Generation**
  ```typescript
  // Install: npm install qrcode
  import QRCode from 'qrcode';
  
  // Generate QR code for player
  const generatePlayerQR = async (playerId: string) => {
    const qrData = {
      type: 'player',
      id: playerId,
      timestamp: Date.now()
    };
    const qrString = await QRCode.toDataURL(JSON.stringify(qrData));
    return qrString; // base64 image
  };
  ```
  
  **B. QR Code Component**
  - Create `components/QRCodeManagement.tsx`
  - Features:
    - Generate QR for all players/coaches
    - Bulk generation
    - Download individual QR codes
    - Print QR codes
    - QR code history
  
  **C. API Endpoints Needed**:
  - `POST /api/qr/generate` - Generate QR code
  - `GET /api/qr/player/[id]` - Get player QR
  - `POST /api/qr/scan` - Record QR scan
  - `GET /api/qr/scans` - Get scan history
  
  **D. Database Schema**:
  ```typescript
  interface QRCode {
    id: string;
    userId: string;
    userType: 'player' | 'coach';
    qrCodeData: string; // base64 image
    qrCodeString: string; // JSON string
    generatedAt: Date;
    expiresAt?: Date;
    scans: QRScan[];
  }
  
  interface QRScan {
    id: string;
    qrCodeId: string;
    scannedAt: Date;
    scannedBy: string;
    location?: string;
    event?: string;
  }
  ```
  
  **E. Files to Create**:
  - `components/QRCodeManagement.tsx`
  - `app/api/qr/generate/route.ts`
  - `app/api/qr/scan/route.ts`
  - `app/api/qr/player/[id]/route.ts`
  - `app/api/qr/coach/[id]/route.ts`
  
  **F. Integration Points**:
  - Add QR code to player/coach profiles
  - Add QR scanner to admin dashboard
  - Add QR download to user management
  - Email QR codes after registration

### 6. Email Management System
- **Status**: NOT STARTED ❌
- **Requirements**:
  - Send emails to players and coaches
  - Email templates
  - Schedule emails
  - Email history
  - Track email opens/clicks
  
- **Implementation Plan**:
  
  **A. Email Service Integration**
  ```bash
  # Option 1: SendGrid
  npm install @sendgrid/mail
  
  # Option 2: Resend (modern, developer-friendly)
  npm install resend
  
  # Option 3: Nodemailer (self-hosted)
  npm install nodemailer
  ```
  
  **B. Email Component**
  - Create `components/EmailManagement.tsx`
  - Features:
    - Rich text editor (TinyMCE or Quill)
    - Email templates
    - Recipient selection
    - Schedule sending
    - Attachment support
    - Preview before send
  
  **C. API Endpoints Needed**:
  - `POST /api/email/send` - Send email
  - `GET /api/email/templates` - Get templates
  - `POST /api/email/templates` - Create template
  - `GET /api/email/history` - Email history
  - `POST /api/email/schedule` - Schedule email
  
  **D. Email Templates**:
  - Welcome email
  - Payment confirmation
  - Practice reminder
  - Game day notification
  - Schedule update
  - Registration confirmation
  
  **E. Files to Create**:
  - `components/EmailManagement.tsx`
  - `app/api/email/send/route.ts`
  - `app/api/email/templates/route.ts`
  - `app/api/email/history/route.ts`
  - `lib/email-service.ts`
  
  **F. Environment Variables Needed**:
  ```bash
  # SendGrid
  SENDGRID_API_KEY=your_key
  SENDGRID_FROM_EMAIL=noreply@allprosportsnc.com
  
  # Or Resend
  RESEND_API_KEY=your_key
  RESEND_FROM_EMAIL=noreply@allprosportsnc.com
  ```

### 7. Blue Sombrero Contact Import
- **Status**: NOT STARTED ❌
- **Requirements**:
  - Import contacts from Blue Sombrero
  - Map Blue Sombrero fields to our schema
  - Prevent duplicates
  - Update existing contacts
  - Import history/logs
  
- **Implementation Plan**:
  
  **A. Blue Sombrero API Integration**
  - Research Blue Sombrero API documentation
  - Get API credentials
  - Understand data format
  
  **B. Import Component**
  - Create `components/BlueSombreroImport.tsx`
  - Features:
    - API connection test
    - Field mapping interface
    - Preview import data
    - Duplicate detection
    - Bulk import
    - Import progress tracking
  
  **C. API Endpoints Needed**:
  - `POST /api/blue-sombrero/connect` - Test connection
  - `GET /api/blue-sombrero/contacts` - Fetch contacts
  - `POST /api/blue-sombrero/import` - Import contacts
  - `GET /api/blue-sombrero/import-history` - Import logs
  
  **D. Field Mapping**:
  ```typescript
  interface BlueSombreroContact {
    // Blue Sombrero fields
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    parentName?: string;
    parentEmail?: string;
    parentPhone?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    // Map to our Player/Coach schema
  }
  
  const mapToPlayer = (bsContact: BlueSombreroContact): Player => {
    return {
      firstName: bsContact.firstName,
      lastName: bsContact.lastName,
      email: bsContact.email,
      phone: bsContact.phone,
      dateOfBirth: new Date(bsContact.dateOfBirth),
      address: {
        street: bsContact.address,
        city: bsContact.city,
        state: bsContact.state,
        zipCode: bsContact.zip
      },
      emergencyContact: {
        name: bsContact.emergencyContact || bsContact.parentName,
        phone: bsContact.emergencyPhone || bsContact.parentPhone,
        relationship: 'Parent/Guardian'
      },
      // ... other fields
    };
  };
  ```
  
  **E. Duplicate Detection**:
  - Match by email (primary)
  - Match by phone (secondary)
  - Match by name + DOB (tertiary)
  - Show duplicates for review
  - Option to update or skip
  
  **F. Files to Create**:
  - `components/BlueSombreroImport.tsx`
  - `app/api/blue-sombrero/connect/route.ts`
  - `app/api/blue-sombrero/contacts/route.ts`
  - `app/api/blue-sombrero/import/route.ts`
  - `lib/blue-sombrero-service.ts`
  
  **G. Environment Variables Needed**:
  ```bash
  BLUE_SOMBRERO_API_KEY=your_key
  BLUE_SOMBRERO_API_URL=https://api.bluesombrero.com
  BLUE_SOMBRERO_ORG_ID=your_org_id
  ```

---

## 🔧 ADMIN PAGE INTEGRATION

### Fix Admin Page Tabs
- **Issue**: Syntax errors in `app/admin/page.tsx`
- **Solution**: Properly integrate SMS and Notification components
- **Steps**:
  1. Revert corrupted changes
  2. Add imports correctly
  3. Add case handlers for 'sms' and 'notifications' tabs
  4. Test all navigation

**Correct Integration**:
```typescript
// Add imports
import SMSManagement from '@/components/SMSManagement';
import NotificationManagement from '@/components/NotificationManagement';

// Add case handlers
case 'sms':
  return (
    <div className="fade-in">
      <SMSManagement />
    </div>
  );

case 'notifications':
  return (
    <div className="fade-in">
      <NotificationManagement />
    </div>
  );
```

---

## 📊 TESTING CHECKLIST

### Commissioner Creation
- [ ] Fill all required fields
- [ ] Click "Create Commissioner"
- [ ] Check browser console for errors
- [ ] Check Network tab for POST request
- [ ] Verify data appears in Firebase
- [ ] Verify commissioner appears in list

### Coupon Usage
- [ ] Create test coupon
- [ ] Apply coupon to registration
- [ ] Complete payment
- [ ] Check coupon `usedCount` incremented
- [ ] Verify `lastUsedAt` timestamp updated

### SMS Management
- [ ] Send SMS to individual
- [ ] Send SMS to group
- [ ] Send SMS to all
- [ ] Schedule SMS for later
- [ ] Use SMS template
- [ ] Check message history

### Notification Management
- [ ] Create notification
- [ ] Target specific users
- [ ] Schedule notification
- [ ] Set expiration date
- [ ] Add action button
- [ ] Archive notification

---

## 🚀 DEPLOYMENT CHECKLIST

### Environment Variables
```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# GoHighLevel
GOHIGHLEVEL_API_KEY=
GOHIGHLEVEL_LOCATION_ID=
GOHIGHLEVEL_FROM_EMAIL=

# OpenAI
OPENAI_API_KEY=

# SMS (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Email (SendGrid or Resend)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
# OR
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Blue Sombrero
BLUE_SOMBRERO_API_KEY=
BLUE_SOMBRERO_API_URL=
BLUE_SOMBRERO_ORG_ID=

# App
NEXT_PUBLIC_BASE_URL=https://allprosportsnc.com
```

### NPM Packages to Install
```bash
# QR Code
npm install qrcode
npm install @types/qrcode --save-dev

# Email
npm install @sendgrid/mail
# OR
npm install resend

# SMS
npm install twilio

# Rich Text Editor (for emails)
npm install @tinymce/tinymce-react
# OR
npm install react-quill
```

---

## 📝 NOTES

### Commissioner Creation Debug
1. Open browser DevTools
2. Go to Network tab
3. Click "Create Commissioner"
4. Look for POST to `/api/commissioners`
5. Check request payload
6. Check response status and body
7. If 200 OK but not appearing, check Firebase console
8. If error, check server logs

### Coupon Usage Verification
- Check Firebase Console → coupons collection
- Look for `usedCount` field
- Should increment by 1 after each successful payment
- Check `lastUsedAt` timestamp

### SMS Provider Setup (Twilio)
1. Sign up at https://www.twilio.com
2. Get Account SID and Auth Token
3. Get phone number
4. Add to environment variables
5. Update `app/api/sms/send/route.ts` to use Twilio

### Email Provider Setup (SendGrid)
1. Sign up at https://sendgrid.com
2. Create API key
3. Verify sender email
4. Add to environment variables
5. Create email templates in SendGrid

---

## 🎯 PRIORITY ORDER

1. **Fix Commissioner Creation** (CRITICAL)
2. **Fix Admin Page Integration** (HIGH)
3. **QR Code Functionality** (HIGH)
4. **Email Management** (MEDIUM)
5. **SMS Provider Integration** (MEDIUM)
6. **Blue Sombrero Import** (LOW)
7. **Push Notifications** (LOW)

---

## 📞 SUPPORT

If you encounter issues:
1. Check browser console for errors
2. Check server logs
3. Check Firebase console
4. Check Network tab for failed requests
5. Verify environment variables are set
6. Restart dev server after env changes

---

**Last Updated**: 2025-10-02
**Version**: 1.0
**Status**: In Progress
