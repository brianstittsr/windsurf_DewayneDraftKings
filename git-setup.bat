@echo off
echo Setting up git repository for DraftKings League SMS System...

git init
git add .
git commit -m "Phase 1: Complete SMS automation system

- User registration with SMS opt-in
- Twilio SMS integration with delivery tracking  
- Automated journey workflows (Welcome, Reminders, Feedback)
- Real-time analytics dashboard
- Webhook handling for delivery status
- Complete API endpoints for SMS management

Phase 1 scope: SMS automation and tracking only
Future phases: League operations, payments, QR codes"

echo.
echo Repository initialized and committed!
echo.
echo Next steps:
echo 1. Create a new repository on GitHub
echo 2. Run: git remote add origin https://github.com/yourusername/draftkings-league.git
echo 3. Run: git branch -M main
echo 4. Run: git push -u origin main
echo.
pause
