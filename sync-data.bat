@echo off
echo.
echo ========================================
echo  All Pro Sports - Data Sync Tool
echo ========================================
echo.
echo This will copy all data from your local
echo development server to production.
echo.
echo Make sure your local server is running:
echo   npm run dev
echo.
pause

echo.
echo Starting sync...
echo.

powershell -ExecutionPolicy Bypass -File "scripts\sync-data.ps1"

echo.
echo Sync completed!
pause
