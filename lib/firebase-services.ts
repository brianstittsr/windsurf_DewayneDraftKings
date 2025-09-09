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
import { Timestamp as FirebaseTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import {
  Player,
  Coach,
  Payment,
  CheckoutSession,
  PlanSelection,
  Coupon,
  SMSOptIn,
  COLLECTIONS,
  getActiveCheckoutSessions,
  getCheckoutSessionByStripeId,
  getPlanSelectionsByEmail,
  getPendingPayments
} from './firestore-schema';

// Generic CRUD operations
export class FirebaseService<T> {
  constructor(protected collectionName: string) {}

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
export const playerService = new FirebaseService<Player>(COLLECTIONS.PLAYERS);
export const coachService = new FirebaseService<Coach>(COLLECTIONS.COACHES);
export const paymentService = new FirebaseService<Payment>(COLLECTIONS.PAYMENTS);
export const checkoutSessionService = new FirebaseService<CheckoutSession>(COLLECTIONS.CHECKOUT_SESSIONS);
export const planSelectionService = new FirebaseService<PlanSelection>(COLLECTIONS.PLAN_SELECTIONS);
export const couponService = new FirebaseService<Coupon>(COLLECTIONS.COUPONS);

// Specialized service methods
export class CheckoutSessionService extends FirebaseService<CheckoutSession> {
  constructor() {
    super(COLLECTIONS.CHECKOUT_SESSIONS);
  }

  async getByStripeSessionId(sessionId: string): Promise<CheckoutSession | null> {
    const sessions = await this.getAll([where('sessionId', '==', sessionId)]);
    return sessions.length > 0 ? sessions[0] : null;
  }

  async getActiveSessionsByEmail(email: string): Promise<CheckoutSession[]> {
    return this.getAll([
      where('customerEmail', '==', email),
      where('status', 'in', ['created', 'active'])
    ]);
  }

  async expireOldSessions(): Promise<void> {
    const now = Timestamp.now();
    const expiredSessions = await this.getAll([
      where('expiresAt', '<=', now),
      where('status', 'in', ['created', 'active'])
    ]);

    for (const session of expiredSessions) {
      await this.update(session.id, { status: 'expired' });
    }
  }

  async completeSession(sessionId: string, paymentId: string): Promise<void> {
    const session = await this.getByStripeSessionId(sessionId);
    if (session) {
      await this.update(session.id, {
        status: 'completed',
        paymentId,
        completedAt: Timestamp.now()
      });
    }
  }
}

export class PlanSelectionService extends FirebaseService<PlanSelection> {
  constructor() {
    super(COLLECTIONS.PLAN_SELECTIONS);
  }

  async getByEmail(email: string): Promise<PlanSelection[]> {
    return this.getAll([where('customerEmail', '==', email)]);
  }

  async getActivePlansByEmail(email: string): Promise<PlanSelection[]> {
    return this.getAll([
      where('customerEmail', '==', email),
      where('status', 'in', ['selected', 'in_checkout'])
    ]);
  }

  async expireOldPlans(): Promise<void> {
    const now = Timestamp.now();
    const expiredPlans = await this.getAll([
      where('expiresAt', '<=', now),
      where('status', 'in', ['selected', 'in_checkout'])
    ]);

    for (const plan of expiredPlans) {
      await this.update(plan.id, { status: 'expired' });
    }
  }

  async markAsPaid(planId: string, paymentId: string, checkoutSessionId: string): Promise<void> {
    await this.update(planId, {
      status: 'paid',
      convertedToPayment: true,
      paymentId,
      checkoutSessionId
    });
  }
}

export class PaymentService extends FirebaseService<Payment> {
  constructor() {
    super(COLLECTIONS.PAYMENTS);
  }

  async getByCustomerEmail(email: string): Promise<Payment[]> {
    return this.getAll([where('customerEmail', '==', email)]);
  }

  async getByPlayerId(playerId: string): Promise<Payment[]> {
    return this.getAll([where('playerId', '==', playerId)]);
  }

  async getByCoachId(coachId: string): Promise<Payment[]> {
    return this.getAll([where('coachId', '==', coachId)]);
  }

  async getPendingPayments(): Promise<Payment[]> {
    return this.getAll([where('status', '==', 'pending')]);
  }

  async getByStripeSessionId(sessionId: string): Promise<Payment | null> {
    const payments = await this.getAll([where('stripeSessionId', '==', sessionId)]);
    return payments.length > 0 ? payments[0] : null;
  }

  async updatePaymentStatus(paymentId: string, status: Payment['status'], metadata?: any): Promise<void> {
    const updateData: any = { status };
    
    if (status === 'succeeded') {
      updateData.paidAt = Timestamp.now();
    }
    
    if (metadata) {
      updateData.metadata = metadata;
    }
    
    await this.update(paymentId, updateData);
  }
}

export class PlayerService extends FirebaseService<Player> {
  constructor() {
    super(COLLECTIONS.PLAYERS);
  }

  async getByEmail(email: string): Promise<Player | null> {
    const players = await this.getAll([where('email', '==', email)]);
    return players.length > 0 ? players[0] : null;
  }

  async getByPaymentStatus(status: Player['paymentStatus']): Promise<Player[]> {
    return this.getAll([where('paymentStatus', '==', status)]);
  }

  async updatePaymentStatus(playerId: string, status: Player['paymentStatus']): Promise<void> {
    await this.update(playerId, { paymentStatus: status });
  }
}

export class CoachService extends FirebaseService<Coach> {
  constructor() {
    super(COLLECTIONS.COACHES);
  }

  async getByEmail(email: string): Promise<Coach | null> {
    const coaches = await this.getAll([where('email', '==', email)]);
    return coaches.length > 0 ? coaches[0] : null;
  }

  async getByCoachingLevel(level: Coach['coachingLevel']): Promise<Coach[]> {
    return this.getAll([where('coachingLevel', '==', level)]);
  }
}

// Export enhanced service instances
export const enhancedCheckoutSessionService = new CheckoutSessionService();
export const enhancedPlanSelectionService = new PlanSelectionService();
export const enhancedPaymentService = new PaymentService();
export const enhancedPlayerService = new PlayerService();
export const enhancedCoachService = new CoachService();

// Utility functions for checkout process
// SMS Opt-in Service
export class SMSOptInService extends FirebaseService<SMSOptIn> {
  constructor() {
    super(COLLECTIONS.SMS_OPT_INS);
  }

  async createOptIn(
    optInData: Omit<SMSOptIn, 'id' | 'createdAt' | 'updatedAt'>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    const now = Timestamp.now();
    
    // Check if phone number already exists
    const existing = await this.getByPhoneNumber(optInData.phoneNumber);
    if (existing && existing.status === 'active') {
      throw new Error('Phone number is already opted in');
    }

    const fullOptInData: Omit<SMSOptIn, 'id'> = {
      ...optInData,
      optInDate: now,
      status: 'active',
      source: 'web_form',
      messagesSent: 0,
      tcpaCompliant: true,
      consentText: 'I agree to receive text messages from All Pro Sports NC. I understand that message and data rates may apply, and I can opt out at any time by replying STOP.',
      createdAt: now,
      updatedAt: now,
      ipAddress,
      userAgent
    };

    return this.create(fullOptInData);
  }

  async getByPhoneNumber(phoneNumber: string): Promise<SMSOptIn | null> {
    const q = query(
      collection(db, this.collectionName),
      where('phoneNumber', '==', phoneNumber),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as SMSOptIn;
  }

  async optOut(phoneNumber: string, method: 'reply_stop' | 'web_form' | 'manual' | 'complaint'): Promise<void> {
    const optIn = await this.getByPhoneNumber(phoneNumber);
    if (!optIn) {
      throw new Error('Phone number not found in opt-in records');
    }

    await this.update(optIn.id, {
      status: 'opted_out',
      optOutDate: Timestamp.now(),
      optOutMethod: method,
      updatedAt: Timestamp.now()
    });
  }

  async incrementMessageCount(phoneNumber: string): Promise<void> {
    const optIn = await this.getByPhoneNumber(phoneNumber);
    if (!optIn) return;

    await this.update(optIn.id, {
      messagesSent: optIn.messagesSent + 1,
      lastMessageSent: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  }

  async getActiveOptIns(): Promise<SMSOptIn[]> {
    const q = query(
      collection(db, this.collectionName),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SMSOptIn));
  }
}

export const smsOptInService = new SMSOptInService();

export const checkoutUtils = {
  async createPlanSelection(planData: Omit<PlanSelection, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return planSelectionService.create(planData);
  },

  async createCheckoutSession(sessionData: Omit<CheckoutSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return checkoutSessionService.create(sessionData);
  },

  async linkPaymentToSession(paymentId: string, sessionId: string): Promise<void> {
    const session = await enhancedCheckoutSessionService.getByStripeSessionId(sessionId);
    if (session) {
      await enhancedCheckoutSessionService.completeSession(sessionId, paymentId);
      await paymentService.update(paymentId, { stripeSessionId: sessionId });
    }
  },

  async cleanupExpiredSessions(): Promise<void> {
    await enhancedCheckoutSessionService.expireOldSessions();
    await enhancedPlanSelectionService.expireOldPlans();
  }
};
