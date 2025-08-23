import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentReference,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';
import {
  User,
  PlayerProfile,
  Team,
  TeamMember,
  Match,
  Workout,
  PlayerMetric,
  Notification,
  Subscription,
  LeaderboardEntry,
  COLLECTIONS,
  UserRole,
  PlayerTag,
  SportType
} from './firestore-schema';

// Generic CRUD operations
export class FirebaseService<T> {
  constructor(private collectionName: string) {}

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docData = {
      ...data,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, this.collectionName), docData);
    return docRef.id;
  }

  async getById(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  }

  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async getAll(constraints: QueryConstraint[] = []): Promise<T[]> {
    const q = query(collection(db, this.collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  }
}

// Specific service instances
export const userService = new FirebaseService<User>(COLLECTIONS.USERS);
export const playerProfileService = new FirebaseService<PlayerProfile>(COLLECTIONS.PLAYER_PROFILES);
export const teamService = new FirebaseService<Team>(COLLECTIONS.TEAMS);
export const teamMemberService = new FirebaseService<TeamMember>(COLLECTIONS.TEAM_MEMBERS);
export const matchService = new FirebaseService<Match>(COLLECTIONS.MATCHES);
export const workoutService = new FirebaseService<Workout>(COLLECTIONS.WORKOUTS);
export const playerMetricService = new FirebaseService<PlayerMetric>(COLLECTIONS.PLAYER_METRICS);
export const notificationService = new FirebaseService<Notification>(COLLECTIONS.NOTIFICATIONS);
export const subscriptionService = new FirebaseService<Subscription>(COLLECTIONS.SUBSCRIPTIONS);
export const leaderboardService = new FirebaseService<LeaderboardEntry>(COLLECTIONS.LEADERBOARD_ENTRIES);

// Specialized service methods
export class UserService extends FirebaseService<User> {
  constructor() {
    super(COLLECTIONS.USERS);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getAll([where('email', '==', email)]);
    return users.length > 0 ? users[0] : null;
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    return this.getAll([where('role', '==', role)]);
  }

  async getPlayersByTag(tag: PlayerTag): Promise<User[]> {
    return this.getAll([
      where('role', '==', UserRole.PLAYER),
      where('playerTag', '==', tag)
    ]);
  }

  async getTrainerPlayers(trainerId: string): Promise<User[]> {
    return this.getAll([where('trainerId', '==', trainerId)]);
  }
}

export class TeamService extends FirebaseService<Team> {
  constructor() {
    super(COLLECTIONS.TEAMS);
  }

  async getTeamsBySport(sport: SportType): Promise<Team[]> {
    return this.getAll([where('sport', '==', sport)]);
  }

  async getTeamsByCoach(coachId: string): Promise<Team[]> {
    return this.getAll([where('coachId', '==', coachId)]);
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return teamMemberService.getAll([where('teamId', '==', teamId)]);
  }
}

export class WorkoutService extends FirebaseService<Workout> {
  constructor() {
    super(COLLECTIONS.WORKOUTS);
  }

  async getUserWorkouts(userId: string, limitCount: number = 10): Promise<Workout[]> {
    return this.getAll([
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    ]);
  }

  async getWorkoutsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Workout[]> {
    return this.getAll([
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    ]);
  }
}

export class LeaderboardService extends FirebaseService<LeaderboardEntry> {
  constructor() {
    super(COLLECTIONS.LEADERBOARD_ENTRIES);
  }

  async getLeaderboard(sport: SportType, category: string, period: string, limitCount: number = 10): Promise<LeaderboardEntry[]> {
    return this.getAll([
      where('sport', '==', sport),
      where('category', '==', category),
      where('period', '==', period),
      orderBy('value', 'desc'),
      limit(limitCount)
    ]);
  }

  async updateLeaderboardEntry(userId: string, sport: SportType, category: string, period: string, value: number): Promise<void> {
    const existing = await this.getAll([
      where('userId', '==', userId),
      where('sport', '==', sport),
      where('category', '==', category),
      where('period', '==', period)
    ]);

    if (existing.length > 0) {
      await this.update(existing[0].id, { value });
    } else {
      await this.create({
        userId,
        sport,
        category,
        period,
        value
      });
    }
  }
}

// Export enhanced service instances
export const enhancedUserService = new UserService();
export const enhancedTeamService = new TeamService();
export const enhancedWorkoutService = new WorkoutService();
export const enhancedLeaderboardService = new LeaderboardService();
