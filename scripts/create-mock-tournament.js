/**
 * Script to create a mock 16-team double elimination tournament
 * Run: node scripts/create-mock-tournament.js
 */

const mockTeams = [
  { id: 'team-1', name: 'Thunder Strikers', seed: 1 },
  { id: 'team-2', name: 'Lightning Bolts', seed: 2 },
  { id: 'team-3', name: 'Storm Chasers', seed: 3 },
  { id: 'team-4', name: 'Blaze Warriors', seed: 4 },
  { id: 'team-5', name: 'Phoenix Rising', seed: 5 },
  { id: 'team-6', name: 'Titan Force', seed: 6 },
  { id: 'team-7', name: 'Viper Squad', seed: 7 },
  { id: 'team-8', name: 'Dragon Fury', seed: 8 },
  { id: 'team-9', name: 'Eagle Knights', seed: 9 },
  { id: 'team-10', name: 'Wolf Pack', seed: 10 },
  { id: 'team-11', name: 'Falcon Elite', seed: 11 },
  { id: 'team-12', name: 'Panther Pride', seed: 12 },
  { id: 'team-13', name: 'Bear Claws', seed: 13 },
  { id: 'team-14', name: 'Shark Attack', seed: 14 },
  { id: 'team-15', name: 'Cobra Strike', seed: 15 },
  { id: 'team-16', name: 'Rhino Charge', seed: 16 }
];

const tournamentData = {
  name: 'Fall Championship 2024 - Double Elimination',
  description: 'Mock 16-team double elimination tournament for demonstration',
  leagueId: 'mock-league-001',
  seasonId: 'Fall 2024',
  type: 'double-elimination',
  startDate: '2024-11-01',
  endDate: '2024-11-30',
  teams: mockTeams
};

async function createMockTournament() {
  try {
    console.log('🏆 Creating mock tournament with 16 teams...');
    console.log('📋 Tournament:', tournamentData.name);
    console.log('🎯 Type:', tournamentData.type);
    console.log('👥 Teams:', mockTeams.length);
    console.log('');
    
    // Use production URL if available, otherwise localhost
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/tournaments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tournamentData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Tournament created successfully!');
      console.log('🆔 Tournament ID:', result.tournamentId);
      console.log('🎮 Total Matches:', result.matches);
      console.log('');
      console.log('🔗 View tournament at:');
      console.log(`   Local: http://localhost:3000/admin?tab=tournaments`);
      console.log(`   Production: https://www.allprosportsnc.com/admin?tab=tournaments`);
      console.log('');
      console.log('📥 To download PDF:');
      console.log('   1. Click on the tournament');
      console.log('   2. Click "Download PDF" button');
      console.log('   3. PDF will be saved to your Downloads folder');
    } else {
      console.error('❌ Error:', result.error);
      if (result.details) {
        console.error('Details:', result.details);
      }
    }
  } catch (error) {
    console.error('❌ Failed to create tournament:', error.message);
    console.log('');
    console.log('💡 Make sure the development server is running:');
    console.log('   npm run dev');
  }
}

// Run the script
createMockTournament();
