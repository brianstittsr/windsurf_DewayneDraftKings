# Email Configuration Setup for All Pro Sports

## Quick Setup Guide

1. **Copy the example environment file:**
   ```bash
   copy .env.local.example .env.local
   ```

2. **Configure your email settings in `.env.local`:**

### For Gmail (Recommended):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="All Pro Sports NC" <noreply@allprosportsnc.com>
```

### For Outlook/Hotmail:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM="All Pro Sports NC" <noreply@allprosportsnc.com>
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password (not your regular Gmail password) for `SMTP_PASS`

## Test Email

Once configured, run:
```bash
node test-email-simple.js
```

This will send a test email to `bstitt@mjandco.com` with:
- **Subject:** "Test from All Pro Sports"
- **Body:** "Email is now sending from All Pro Sports NC website!"

## Troubleshooting

- **Authentication Error:** Check your email and app password
- **Connection Error:** Verify SMTP host and port settings
- **Gmail Issues:** Make sure you're using an app password, not your regular password
