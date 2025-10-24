# Email Configuration Setup Instructions

## Issue
Registration emails are not being sent after successful registration because email environment variables are not configured.

## Quick Fix

### 1. Add Email Variables to .env.local

Open your `.env.local` file and add these lines:

```env
# Email Configuration for Registration Confirmations
EMAIL_HOST=smtp.privateemail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=info@allprosportsnc.com
EMAIL_PASS=4Football!
EMAIL_FROM=noreply@allprosportsnc.com
```

### 2. Restart Development Server

Stop your current server (Ctrl+C) and restart:

```bash
npm run dev
```

### 3. Test Email Sending

Run the email configuration checker:

```bash
node check-email-config.js
```

You should see all green checkmarks ✅ indicating email is configured.

### 4. Test with Registration

Try completing a registration to verify emails are now being sent.

---

## For Production (Vercel)

### Add Environment Variables in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add each variable:
   - `EMAIL_HOST` = `smtp.privateemail.com`
   - `EMAIL_PORT` = `587`
   - `EMAIL_SECURE` = `false`
   - `EMAIL_USER` = `info@allprosportsnc.com`
   - `EMAIL_PASS` = `4Football!`
   - `EMAIL_FROM` = `noreply@allprosportsnc.com`
5. **Redeploy** your application

---

## Email Flow

Once configured, the registration process will:

1. ✅ Create user profile in Firebase
2. ✅ Generate registration PDF
3. ✅ Send confirmation email with:
   - Welcome message
   - Registration details
   - PDF attachment
   - Next steps
4. ✅ User receives email at provided address

---

## Troubleshooting

### Emails Still Not Sending?

1. **Check SMTP credentials** are correct
2. **Verify email server** allows SMTP access
3. **Check server logs** for error messages:
   ```bash
   # Look for email-related errors in terminal
   ```

### Email Service Test

Create a test email endpoint:

```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-test-email@example.com",
    "subject": "Test Email",
    "html": "<h1>Test Email</h1><p>If you receive this, email is working!</p>"
  }'
```

---

## Current Code Flow

### 1. Registration Endpoint
`/app/api/registration/create-profile/route.ts` (lines 275-359)
- Creates profile
- Generates PDF
- Calls `/api/email/send` to send confirmation

### 2. Email API Endpoint
`/app/api/email/send/route.ts` (lines 17-27)
- Checks if `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS` are set
- If missing: Returns success but doesn't send (to not break registration)
- If configured: Sends email via nodemailer

### 3. Current Behavior Without Config
- ✅ Registration completes successfully
- ✅ Profile saved to Firebase
- ⚠️ Email returns "success" but **doesn't actually send**
- ❌ User doesn't receive confirmation email

---

## After Configuration

With email variables configured:
- ✅ Registration completes successfully
- ✅ Profile saved to Firebase
- ✅ Email **actually sends** to user
- ✅ User receives confirmation with PDF

---

**Next Step**: Add the email variables to your `.env.local` file and restart your server!
