# Tournament Bracket Generation Guide

## Generate Mock 16-Team Double Elimination Tournament

### Quick Start

**Option 1: Run Script (Automated)**
```bash
# Make sure dev server is running
npm run dev

# In a new terminal, run:
node scripts/create-mock-tournament.js
```

**Option 2: Manual Creation (Via Admin Panel)**
1. Go to http://localhost:3000/admin?tab=tournaments
2. Click "Create Tournament"
3. Fill in the form with the data below
4. Click "Create Tournament"

### Mock Tournament Data

**Tournament Details:**
- **Name**: Fall Championship 2024 - Double Elimination
- **Type**: Double Elimination
- **Teams**: 16
- **Start Date**: November 1, 2024
- **End Date**: November 30, 2024

**16 Mock Teams:**
1. Thunder Strikers (Seed #1)
2. Lightning Bolts (Seed #2)
3. Storm Chasers (Seed #3)
4. Blaze Warriors (Seed #4)
5. Phoenix Rising (Seed #5)
6. Titan Force (Seed #6)
7. Viper Squad (Seed #7)
8. Dragon Fury (Seed #8)
9. Eagle Knights (Seed #9)
10. Wolf Pack (Seed #10)
11. Falcon Elite (Seed #11)
12. Panther Pride (Seed #12)
13. Bear Claws (Seed #13)
14. Shark Attack (Seed #14)
15. Cobra Strike (Seed #15)
16. Rhino Charge (Seed #16)

## Download Bracket as PDF

### From Admin Panel:
1. Navigate to **Admin → Tournaments**
2. Click on the tournament name
3. Click **"Download PDF"** button
4. PDF will be saved to your Downloads folder

### PDF Features:
- ✅ Landscape A4 format
- ✅ High-quality 2x scale rendering
- ✅ All rounds displayed (Round 1, Quarter-Finals, Semi-Finals, Finals)
- ✅ Team seedings shown
- ✅ Match numbers included
- ✅ Professional layout

## Email Bracket

1. Click on the tournament
2. Click **"Email Bracket"** button
3. Enter email address
4. Click "Send Email"
5. Bracket sent as PNG attachment

## Tournament Structure

### Double Elimination (16 Teams):

**Winners Bracket:**
- Round 1: 8 matches (16 teams → 8 winners)
- Round 2: 4 matches (8 teams → 4 winners)
- Semi-Finals: 2 matches (4 teams → 2 winners)
- Finals: 1 match

**Losers Bracket:**
- Losers Round 1: 4 matches (8 losers from R1)
- Losers Round 2: 4 matches (4 winners + 4 losers from R2)
- And so on...

**Total Matches**: ~30 matches for 16-team double elimination

### Single Elimination (16 Teams):
- Round 1: 8 matches
- Quarter-Finals: 4 matches
- Semi-Finals: 2 matches
- Finals: 1 match
- **Total**: 15 matches

## Bracket Features

### Visual Display:
- ✅ Professional bracket chart layout
- ✅ Team matchup cards
- ✅ Seed numbers displayed
- ✅ Winner highlighting (green)
- ✅ Score tracking
- ✅ Scheduled dates

### Export Options:
- ✅ **PDF Download**: One-click download
- ✅ **Email**: Send as attachment
- ✅ **Print**: Print-friendly layout

### Management:
- ✅ Create tournaments
- ✅ Edit tournament details
- ✅ Update match results
- ✅ Track winners
- ✅ Automatic advancement

## API Endpoint

**Create Tournament:**
```bash
POST /api/tournaments
Content-Type: application/json

{
  "name": "Fall Championship 2024",
  "description": "16-team double elimination",
  "type": "double-elimination",
  "startDate": "2024-11-01",
  "endDate": "2024-11-30",
  "teams": [
    { "id": "team-1", "name": "Thunder Strikers", "seed": 1 },
    { "id": "team-2", "name": "Lightning Bolts", "seed": 2 },
    ...
  ]
}
```

**Response:**
```json
{
  "success": true,
  "tournamentId": "abc123",
  "matches": 30
}
```

## Troubleshooting

### Tournament Not Appearing:
- Check Firebase connection
- Verify Firestore rules include `tournaments` collection
- Check browser console for errors

### PDF Download Not Working:
- Ensure `html2canvas` and `jspdf` are installed
- Check browser console for errors
- Try a different browser

### Email Not Sending:
- Verify email environment variables are set
- Check SMTP credentials
- Review server logs

## Production URLs

**Admin Panel:**
- Local: http://localhost:3000/admin?tab=tournaments
- Production: https://www.allprosportsnc.com/admin?tab=tournaments

**API Endpoint:**
- Local: http://localhost:3000/api/tournaments
- Production: https://www.allprosportsnc.com/api/tournaments

## Next Steps

1. **Run the script** to create mock tournament
2. **View the bracket** in admin panel
3. **Download PDF** for demonstration
4. **Customize teams** as needed
5. **Share with stakeholders**

## Notes

- Double elimination tournaments have ~2x matches of single elimination
- Bracket automatically handles byes for non-power-of-2 team counts
- PDF filename: `{tournament-name}-bracket.pdf`
- Email attachment: PNG format
- All data stored in Firebase `tournaments` collection
