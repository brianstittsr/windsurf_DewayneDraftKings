# Tournament Bracket Email Setup

## Issue
Email bracket feature requires email configuration to work.

## Quick Fix

Add these variables to your `.env.local` file:

```bash
# Email Configuration
EMAIL_HOST="smtp.privateemail.com"
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER="info@allprosportsnc.com"
EMAIL_PASS="4Football!"
EMAIL_FROM="info@allprosportsnc.com"
```

## Restart Server

After adding the variables:

```bash
# Stop the dev server (Ctrl+C)
# Then restart:
npm run dev
```

## Test Email

1. Go to http://localhost:3000/admin?tab=tournaments
2. Click on a tournament
3. Click "Email Bracket"
4. Enter your email address
5. Click "Send Email"

## Alternative: Use PDF Download

If you don't want to configure email, you can still:
- ✅ Download bracket as PDF
- ✅ View bracket in browser
- ✅ Print bracket
- ✅ Share PDF file manually

## Production Setup

For production (Vercel), add the same variables to:
- Vercel Dashboard → Project → Settings → Environment Variables

## Troubleshooting

### Error: "Email service not configured"
**Solution**: Add EMAIL_USER and EMAIL_PASS to .env.local

### Error: "Invalid credentials"
**Solution**: Verify EMAIL_USER and EMAIL_PASS are correct

### Error: "Connection timeout"
**Solution**: Check EMAIL_HOST and EMAIL_PORT settings

## Email Providers

### PrivateEmail (Current):
```
HOST: smtp.privateemail.com
PORT: 587
SECURE: false
```

### Gmail:
```
HOST: smtp.gmail.com
PORT: 587
SECURE: false
USER: your-email@gmail.com
PASS: your-app-password (not regular password)
```

### SendGrid:
```
HOST: smtp.sendgrid.net
PORT: 587
SECURE: false
USER: apikey
PASS: your-sendgrid-api-key
```

## Complete Guide

See `docs/email-setup-guide.md` for comprehensive email configuration instructions.
