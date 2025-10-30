# Email Recipients Management Guide

This guide explains how to manage email recipients for registration confirmation emails in All Pro Sports.

## Overview

The system now supports sending registration confirmation emails to multiple recipients. When a user completes registration, the primary email (the registrant's email) will receive the confirmation email, and additional recipients (administrators, coaches, etc.) will be CC'd on the same email.

## Default Configuration

By default, the system is configured to send registration confirmation emails to:

- The registrant (primary recipient)
- `dewayne.thomas2011@gmail.com` (CC recipient)

## Managing Email Recipients

### Admin Panel

Administrators can manage email recipients through the admin panel:

1. Log in to the admin panel
2. Navigate to **Communication** → **Email Recipients** in the sidebar
3. The Email Recipients page displays all current recipients
4. Add new recipients using the form at the top of the page
5. Remove recipients by clicking the delete button next to their entry

### Registration Success Page

If you have admin privileges, you can also manage email recipients directly from the registration success page:

1. Complete a registration (or navigate to `/registration-success`)
2. If you have admin privileges, you'll see an "Email Notification Settings" section
3. Use this section to add or remove email recipients

## Technical Implementation

### Database Structure

Email recipients are stored in the Firebase Firestore database in the `configuration` collection:

```
/configuration/registration_notifications
```

The document contains:

- `registrationNotifications`: Array of recipient objects
  - `email`: Recipient email address
  - `name`: Optional recipient name
  - `active`: Boolean indicating if the recipient is active
  - `addedAt`: Timestamp when the recipient was added

### API Endpoints

The following API endpoints are available for managing email recipients:

- `GET /api/email/recipients` - Get all email recipients
- `POST /api/email/recipients` - Add a new email recipient
- `DELETE /api/email/recipients` - Remove an email recipient

### Email Sending Process

When a registration confirmation email is sent:

1. The system retrieves all active email recipients from the database
2. The email is sent to the primary recipient (the registrant)
3. All active email recipients are added as CC recipients
4. The email includes all attachments (PDF registration form, etc.)

## Testing

You can test the email recipients functionality using the provided test script:

```bash
node scripts/test-email-recipients.js
```

This script will:
1. Retrieve current email recipients
2. Add a test recipient
3. Send a test email with CC recipients

## Troubleshooting

If registration confirmation emails are not being sent to additional recipients:

1. Check that the email service is properly configured with the required environment variables
2. Verify that there are active recipients in the database
3. Ensure the `isRegistrationEmail` flag is set to `true` when sending the email
4. Check the server logs for any errors related to email sending

For more information about email configuration, see the [Email Setup Guide](./email-setup-guide.md).
