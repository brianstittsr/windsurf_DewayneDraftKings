# Email Service Setup Guide

## Why Emails Aren't Sending

The registration confirmation emails aren't being sent because the email service environment variables are not configured. The system requires SMTP credentials to send emails.

## Required Environment Variables

Add these to your `.env.local` file and Vercel environment variables:

```bash
# Email Configuration (Required for registration confirmations)
EMAIL_HOST=smtp.privateemail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=info@allprosportsnc.com
EMAIL_PASS=4Football!
EMAIL_FROM=noreply@allprosportsnc.com
```

## Email Flow

1. **Payment Success** → Stripe webhook triggers
2. **Profile Creation** → `/api/registration/create-profile` called
3. **PDF Generation** → Registration forms and waivers generated
4. **Email Sending** → Confirmation email with PDF attachment sent

## Current Email Features

- **Registration Confirmation**: Sent after successful payment
- **PDF Attachments**: Includes signed forms and waivers
- **Professional Templates**: HTML and text versions
- **Emergency Contact Info**: Included in confirmation

## Testing Email Service

### 1. Check Configuration
```bash
GET /api/email/send
```
Returns current email configuration status.

### 2. Manual Test
```bash
POST /api/email/send
{
  "email": "test@example.com",
  "registrationData": {
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "(555) 123-4567",
    "role": "player"
  }
}
```

## Environment Setup

### Local Development
1. Copy `.env.example` to `.env.local`
2. Update email credentials
3. Restart development server

### Vercel Production
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add all email environment variables
3. Redeploy application

## Email Service Providers

### Current: PrivateEmail (Namecheap)
- Host: `smtp.privateemail.com`
- Port: `587`
- Security: `STARTTLS`

### Alternative: Gmail
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password  # Use App Password, not regular password
```

### Alternative: SendGrid
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check username/password
   - For Gmail: Use App Password
   - For PrivateEmail: Use full email as username

2. **Connection Timeout**
   - Check firewall settings
   - Verify SMTP host and port
   - Try different port (465 for SSL, 587 for TLS)

3. **Emails in Spam**
   - Set up SPF records
   - Configure DKIM
   - Use proper FROM address

### Debug Steps

1. **Check Environment Variables**
   ```bash
   GET /api/email/send
   ```

2. **Test Email Sending**
   ```bash
   node debug-email.js
   ```

3. **Check Server Logs**
   - Look for email service errors
   - Check SMTP connection logs

## Email Templates

The system sends professional HTML emails with:
- Welcome message
- Registration details
- Emergency contact info
- PDF attachment with forms
- Next steps information

## Security Notes

- Never commit email passwords to git
- Use environment variables for all credentials
- Consider using app-specific passwords
- Rotate credentials regularly

## Production Checklist

- [ ] Email environment variables configured in Vercel
- [ ] SMTP credentials tested and working
- [ ] Email templates reviewed and approved
- [ ] SPF/DKIM records configured for domain
- [ ] Test email flow end-to-end
- [ ] Monitor email delivery rates
