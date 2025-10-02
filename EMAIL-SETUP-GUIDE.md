# 📧 Email Setup Guide - All Pro Sports

## Quick Setup Checklist

- [ ] Email service provider chosen (Gmail, SendGrid, etc.)
- [ ] App password generated (for Gmail)
- [ ] Environment variables added to `.env.local`
- [ ] Environment variables added to Vercel
- [ ] Dev server restarted
- [ ] Test email sent successfully
- [ ] Production deployment completed

---

## Option 1: Gmail (Recommended for Testing)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the setup process

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Other" as the device
4. Name it "All Pro Sports"
5. Click "Generate"
6. **Copy the 16-character password** (you won't see it again!)

### Step 3: Add to .env.local
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM=noreply@allprosportsnc.com
```

### Step 4: Test
```bash
# Restart dev server
npm run dev

# Run diagnostic
node check-email-config.js

# Send test email
node test-registration-email.js
```

---

## Option 2: SendGrid (Recommended for Production)

### Why SendGrid?
- ✅ 100 emails/day free
- ✅ Better deliverability
- ✅ Email analytics
- ✅ No daily sending limits
- ✅ Professional service

### Setup Steps:
1. Sign up at https://sendgrid.com
2. Verify your sender email
3. Create an API key
4. Add to environment variables:

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.your-api-key-here
EMAIL_FROM=noreply@allprosportsnc.com
```

---

## Option 3: AWS SES (Best for High Volume)

### Setup Steps:
1. Sign up for AWS
2. Go to Amazon SES
3. Verify your domain or email
4. Create SMTP credentials
5. Add to environment variables:

```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-smtp-username
EMAIL_PASS=your-smtp-password
EMAIL_FROM=noreply@allprosportsnc.com
```

---

## Vercel Production Setup

### Add Environment Variables:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - `EMAIL_HOST`
   - `EMAIL_PORT`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `EMAIL_FROM`
5. Select "Production", "Preview", and "Development"
6. Click "Save"

### Redeploy:
```bash
git add .
git commit -m "Add email configuration"
git push origin main
```

Or manually redeploy in Vercel dashboard.

---

## Testing Emails

### Test 1: Check Configuration
```bash
node check-email-config.js
```

Expected output:
```
✅ EMAIL_HOST: smtp.gmail.com
✅ EMAIL_PORT: 587
✅ EMAIL_USER: your-email@gmail.com
✅ EMAIL_PASS: ***hidden***
✅ EMAIL_FROM: noreply@allprosportsnc.com

✅ All email configuration variables are set!
✅ Email server connection successful!
📧 Ready to send emails!
```

### Test 2: Send Test Email
```bash
node test-registration-email.js
```

Expected output:
```
✅ SUCCESS! Email sent successfully!
Message ID: <message-id>
📬 Check your inbox at: brianstittsr@gmail.com
```

### Test 3: Test Payment Webhook
1. Make a test Stripe payment
2. Check Vercel logs for "Email sent successfully"
3. Check customer email inbox

---

## Troubleshooting

### Issue: "Authentication failed"
**Solution:** 
- Gmail: Use App Password, not regular password
- SendGrid: Use "apikey" as username, API key as password
- Check for typos in credentials

### Issue: "Connection timeout"
**Solution:**
- Check EMAIL_HOST and EMAIL_PORT are correct
- Verify firewall isn't blocking port 587
- Try port 465 with `secure: true`

### Issue: "Emails not arriving"
**Solution:**
- Check spam/junk folder
- Verify EMAIL_FROM is a valid email
- For Gmail: Verify sender email in Gmail settings
- For SendGrid: Verify sender identity

### Issue: "Environment variables not found"
**Solution:**
- Restart dev server after adding to `.env.local`
- Check `.env.local` is in project root (not in subdirectory)
- Verify `.env.local` is not in `.gitignore` (it should be!)
- For Vercel: Redeploy after adding variables

### Issue: "Module not found: nodemailer"
**Solution:**
```bash
npm install nodemailer
```

---

## Email Templates

### Current Templates:
1. **Payment Confirmation** - Sent after successful payment
2. **Registration Confirmation** - Sent after registration (can be same as payment)

### Template Location:
- Webhook: `app/api/payments/webhook/route.ts` (lines 107-146)
- Test: `test-registration-email.js`

### Customizing Templates:
Edit the HTML in the webhook file to match your branding.

---

## Production Checklist

Before going live:

- [ ] Email service configured (SendGrid recommended)
- [ ] Sender email verified
- [ ] Test emails sent successfully
- [ ] Spam score checked (use mail-tester.com)
- [ ] Unsubscribe link added (if required)
- [ ] Company branding applied
- [ ] Contact information correct
- [ ] Links tested and working
- [ ] Mobile responsive checked
- [ ] Vercel environment variables set
- [ ] Production deployment tested

---

## Support

**Email Issues:**
- Check Vercel logs for error messages
- Test with `check-email-config.js`
- Verify credentials are correct

**Need Help:**
- Gmail: https://support.google.com/accounts/answer/185833
- SendGrid: https://docs.sendgrid.com/
- AWS SES: https://docs.aws.amazon.com/ses/

---

## Quick Commands Reference

```bash
# Check email configuration
node check-email-config.js

# Send test email
node test-registration-email.js

# Check Vercel logs (production)
vercel logs

# Restart dev server
npm run dev
```

---

**Last Updated:** September 30, 2025
**System:** All Pro Sports Registration Platform
