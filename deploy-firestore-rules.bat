@echo off
echo Deploying Firestore rules for dewaynedraftkings project...

echo Setting Firebase project...
firebase use dewaynedraftkings

echo Deploying Firestore rules...
firebase deploy --only firestore:rules

echo Done! Firestore rules have been deployed.
pause
