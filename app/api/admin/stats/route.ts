import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/admin/stats - Get admin dashboard statistics
export async function GET() {
  try {
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    const stats = {
      totalUsers: 0,
      activePlayers: 0,
      totalTeams: 0,
      pendingPayments: 0,
      totalRevenue: 0,
      activeLeagues: 0,
      totalCoaches: 0,
      upcomingGames: 0
    };

    if (!db) {
      return NextResponse.json({ success: true, stats });
    }

    const { collection, getDocs, query, where } = await import('firebase/firestore');

    // Get total players
    const playersRef = collection(db, 'players');
    const playersSnap = await getDocs(playersRef);
    stats.totalUsers += playersSnap.size;
    stats.activePlayers = playersSnap.docs.filter(doc => 
      doc.data().registrationStatus === 'active' || doc.data().registrationStatus === 'confirmed'
    ).length;

    // Get total coaches
    const coachesRef = collection(db, 'coaches');
    const coachesSnap = await getDocs(coachesRef);
    stats.totalUsers += coachesSnap.size;
    stats.totalCoaches = coachesSnap.size;

    // Get total teams
    const teamsRef = collection(db, 'teams');
    const teamsSnap = await getDocs(teamsRef);
    stats.totalTeams = teamsSnap.size;

    // Get active leagues
    const leaguesRef = collection(db, 'leagues');
    const activeLeaguesQuery = query(leaguesRef, where('isActive', '==', true));
    const activeLeaguesSnap = await getDocs(activeLeaguesQuery);
    stats.activeLeagues = activeLeaguesSnap.size;

    // Get payment stats
    const paymentsRef = collection(db, 'payments');
    const paymentsSnap = await getDocs(paymentsRef);
    
    let totalRevenue = 0;
    let pendingCount = 0;

    paymentsSnap.forEach(doc => {
      const payment = doc.data();
      if (payment.status === 'succeeded' || payment.status === 'completed') {
        totalRevenue += payment.amount || 0;
      }
      if (payment.status === 'pending') {
        pendingCount++;
      }
    });

    stats.totalRevenue = totalRevenue;
    stats.pendingPayments = pendingCount;

    // Get upcoming games (games in the future)
    const gamesRef = collection(db, 'games');
    const gamesSnap = await getDocs(gamesRef);
    const now = new Date();
    
    stats.upcomingGames = gamesSnap.docs.filter(doc => {
      const gameData = doc.data();
      if (gameData.scheduledDate) {
        const gameDate = gameData.scheduledDate.toDate ? gameData.scheduledDate.toDate() : new Date(gameData.scheduledDate);
        return gameDate > now;
      }
      return false;
    }).length;

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch statistics',
      stats: {
        totalUsers: 0,
        activePlayers: 0,
        totalTeams: 0,
        pendingPayments: 0,
        totalRevenue: 0,
        activeLeagues: 0,
        totalCoaches: 0,
        upcomingGames: 0
      }
    });
  }
}
