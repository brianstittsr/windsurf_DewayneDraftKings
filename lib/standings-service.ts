// Standings Service for Dynamic League Management
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS, Team, Game, Season } from './firestore-schema';

export interface TeamStanding {
  teamId: string;
  teamName: string;
  rank: number;
  wins: number;
  losses: number;
  ties: number;
  gamesPlayed: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDifferential: number;
  winPercentage: number;
  record: string;
}

export interface LeagueStandings {
  standings: TeamStanding[];
  lastUpdated: Date;
  seasonId: string;
  totalGames: number;
  completedGames: number;
}

export class StandingsService {
  /**
   * Calculate current standings for a season
   */
  static async calculateStandings(seasonId: string): Promise<LeagueStandings> {
    try {
      // Get all teams in the season
      const teamsQuery = query(
        collection(db, COLLECTIONS.TEAMS),
        where('seasonId', '==', seasonId)
      );
      const teamsSnapshot = await getDocs(teamsQuery);
      const teams = teamsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as (Team & { id: string })[];

      // Get all completed games for the season
      const gamesQuery = query(
        collection(db, COLLECTIONS.GAMES),
        where('seasonId', '==', seasonId),
        where('status', '==', 'completed'),
        orderBy('actualDate', 'desc')
      );
      const gamesSnapshot = await getDocs(gamesQuery);
      const games = gamesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as (Game & { id: string })[];

      // Initialize team stats
      const teamStats: { [teamId: string]: TeamStanding } = {};
      
      teams.forEach(team => {
        teamStats[team.id] = {
          teamId: team.id,
          teamName: team.name,
          rank: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          gamesPlayed: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          pointsDifferential: 0,
          winPercentage: 0,
          record: '0-0'
        };
      });

      // Process each completed game
      games.forEach(game => {
        const homeTeamId = game.homeTeamId;
        const awayTeamId = game.awayTeamId;
        const homeScore = game.score.home;
        const awayScore = game.score.away;

        if (teamStats[homeTeamId] && teamStats[awayTeamId]) {
          // Update games played
          teamStats[homeTeamId].gamesPlayed++;
          teamStats[awayTeamId].gamesPlayed++;

          // Update points
          teamStats[homeTeamId].pointsFor += homeScore;
          teamStats[homeTeamId].pointsAgainst += awayScore;
          teamStats[awayTeamId].pointsFor += awayScore;
          teamStats[awayTeamId].pointsAgainst += homeScore;

          // Determine winner and update records
          if (homeScore > awayScore) {
            // Home team wins
            teamStats[homeTeamId].wins++;
            teamStats[awayTeamId].losses++;
          } else if (awayScore > homeScore) {
            // Away team wins
            teamStats[awayTeamId].wins++;
            teamStats[homeTeamId].losses++;
          } else {
            // Tie game
            teamStats[homeTeamId].ties++;
            teamStats[awayTeamId].ties++;
          }
        }
      });

      // Calculate derived stats and sort standings
      const standings: TeamStanding[] = Object.values(teamStats).map(team => {
        const totalGames = team.wins + team.losses + team.ties;
        team.winPercentage = totalGames > 0 ? (team.wins + team.ties * 0.5) / totalGames : 0;
        team.pointsDifferential = team.pointsFor - team.pointsAgainst;
        team.record = team.ties > 0 ? `${team.wins}-${team.losses}-${team.ties}` : `${team.wins}-${team.losses}`;
        return team;
      });

      // Sort by win percentage, then by points differential
      standings.sort((a, b) => {
        if (a.winPercentage !== b.winPercentage) {
          return b.winPercentage - a.winPercentage;
        }
        return b.pointsDifferential - a.pointsDifferential;
      });

      // Assign ranks
      standings.forEach((team, index) => {
        team.rank = index + 1;
      });

      // Update team documents with current stats
      await Promise.all(standings.map(async (standing) => {
        const teamRef = doc(db, COLLECTIONS.TEAMS, standing.teamId);
        await updateDoc(teamRef, {
          'stats.wins': standing.wins,
          'stats.losses': standing.losses,
          'stats.ties': standing.ties,
          'stats.pointsFor': standing.pointsFor,
          'stats.pointsAgainst': standing.pointsAgainst,
          'stats.gamesPlayed': standing.gamesPlayed,
          'stats.winPercentage': standing.winPercentage,
          'stats.pointsDifferential': standing.pointsDifferential,
          updatedAt: new Date()
        });
      }));

      return {
        standings,
        lastUpdated: new Date(),
        seasonId,
        totalGames: games.length,
        completedGames: games.filter(g => g.status === 'completed').length
      };

    } catch (error) {
      console.error('Error calculating standings:', error);
      throw new Error('Failed to calculate standings');
    }
  }

  /**
   * Get current standings without recalculation
   */
  static async getCurrentStandings(seasonId: string): Promise<TeamStanding[]> {
    try {
      const teamsQuery = query(
        collection(db, COLLECTIONS.TEAMS),
        where('seasonId', '==', seasonId)
      );
      const teamsSnapshot = await getDocs(teamsQuery);
      
      const standings: TeamStanding[] = teamsSnapshot.docs.map(doc => {
        const team = { id: doc.id, ...doc.data() } as Team & { id: string };
        return {
          teamId: team.id,
          teamName: team.name,
          rank: 0,
          wins: team.stats.wins,
          losses: team.stats.losses,
          ties: team.stats.ties,
          gamesPlayed: team.stats.gamesPlayed,
          pointsFor: team.stats.pointsFor,
          pointsAgainst: team.stats.pointsAgainst,
          pointsDifferential: team.stats.pointsDifferential,
          winPercentage: team.stats.winPercentage,
          record: team.stats.ties > 0 ? 
            `${team.stats.wins}-${team.stats.losses}-${team.stats.ties}` : 
            `${team.stats.wins}-${team.stats.losses}`
        };
      });

      // Sort and assign ranks
      standings.sort((a, b) => {
        if (a.winPercentage !== b.winPercentage) {
          return b.winPercentage - a.winPercentage;
        }
        return b.pointsDifferential - a.pointsDifferential;
      });

      standings.forEach((team, index) => {
        team.rank = index + 1;
      });

      return standings;
    } catch (error) {
      console.error('Error getting current standings:', error);
      throw new Error('Failed to get current standings');
    }
  }

  /**
   * Get top performers across all teams
   */
  static async getLeagueLeaders(seasonId: string): Promise<{
    topScorers: Array<{ playerId: string; playerName: string; teamName: string; stat: string; category: string }>;
  }> {
    try {
      // Get all teams in the season
      const teamsQuery = query(
        collection(db, COLLECTIONS.TEAMS),
        where('seasonId', '==', seasonId)
      );
      const teamsSnapshot = await getDocs(teamsQuery);
      const teams = teamsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as (Team & { id: string })[];

      // Get all players from these teams
      const allPlayers = [];
      for (const team of teams) {
        if (team.players && team.players.length > 0) {
          const playersQuery = query(
            collection(db, COLLECTIONS.PLAYERS),
            where('teamId', '==', team.id)
          );
          const playersSnapshot = await getDocs(playersQuery);
          const teamPlayers = playersSnapshot.docs.map(doc => ({
            id: doc.id,
            teamName: team.name,
            ...doc.data()
          }));
          allPlayers.push(...teamPlayers);
        }
      }

      // Sort players by different categories
      const topScorers = allPlayers
        .sort((a, b) => (b.stats?.touchdowns || 0) - (a.stats?.touchdowns || 0))
        .slice(0, 4)
        .map(player => ({
          playerId: player.id,
          playerName: `${player.firstName} ${player.lastName}`,
          teamName: player.teamName,
          stat: `${player.stats?.touchdowns || 0} TDs`,
          category: 'Touchdowns'
        }));

      return { topScorers };
    } catch (error) {
      console.error('Error getting league leaders:', error);
      return { topScorers: [] };
    }
  }

  /**
   * Get upcoming games for a season
   */
  static async getUpcomingGames(seasonId: string, limit: number = 5): Promise<Array<{
    date: string;
    teams: string;
    time: string;
    venue: string;
  }>> {
    try {
      const gamesQuery = query(
        collection(db, COLLECTIONS.GAMES),
        where('seasonId', '==', seasonId),
        where('status', '==', 'scheduled'),
        orderBy('scheduledDate', 'asc')
      );
      
      const gamesSnapshot = await getDocs(gamesQuery);
      const games = gamesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as (Game & { id: string })[];

      return games.slice(0, limit).map(game => {
        const gameDate = game.scheduledDate.toDate();
        return {
          date: gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          teams: `${game.homeTeamName} vs ${game.awayTeamName}`,
          time: gameDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          venue: game.venue
        };
      });
    } catch (error) {
      console.error('Error getting upcoming games:', error);
      return [];
    }
  }
}
