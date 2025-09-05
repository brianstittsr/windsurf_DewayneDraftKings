import { NextRequest, NextResponse } from 'next/server';
import { StandingsService } from '@/lib/standings-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get('seasonId');
    const recalculate = searchParams.get('recalculate') === 'true';

    if (!seasonId) {
      return NextResponse.json(
        { error: 'Season ID is required' },
        { status: 400 }
      );
    }

    let standings;
    
    if (recalculate) {
      // Recalculate standings from game results
      const standingsData = await StandingsService.calculateStandings(seasonId);
      standings = standingsData.standings;
    } else {
      // Get current standings from team records
      standings = await StandingsService.getCurrentStandings(seasonId);
    }

    // Get league leaders and upcoming games
    const leagueLeaders = await StandingsService.getLeagueLeaders(seasonId);
    const upcomingGames = await StandingsService.getUpcomingGames(seasonId);

    return NextResponse.json({
      standings,
      leagueLeaders: leagueLeaders.topScorers,
      upcomingGames,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching standings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch standings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { seasonId } = body;

    if (!seasonId) {
      return NextResponse.json(
        { error: 'Season ID is required' },
        { status: 400 }
      );
    }

    // Force recalculation of standings
    const standingsData = await StandingsService.calculateStandings(seasonId);

    return NextResponse.json({
      message: 'Standings recalculated successfully',
      standings: standingsData.standings,
      totalGames: standingsData.totalGames,
      completedGames: standingsData.completedGames,
      lastUpdated: standingsData.lastUpdated
    });
  } catch (error) {
    console.error('Error recalculating standings:', error);
    return NextResponse.json(
      { error: 'Failed to recalculate standings' },
      { status: 500 }
    );
  }
}
