import { NextRequest, NextResponse } from 'next/server';

// POST /api/seed-pricing - Add sample pricing plans
export async function POST() {
  try {
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    
    const samplePlans = [
      {
        title: 'Player Registration',
        subtitle: 'Individual Player',
        description: 'Complete player registration for the season',
        price: 150,
        serviceFee: 15,
        totalPrice: 165,
        features: [
          'Full season participation',
          'Team jersey included',
          'Professional coaching',
          'Statistics tracking',
          'End of season awards'
        ],
        itemType: 'season',
        category: 'player',
        popular: true,
        buttonText: 'Register Now',
        buttonClass: 'btn-primary',
        displayOrder: 1,
        isActive: true,
        isVisible: true,
        maxCapacity: 100,
        currentRegistrations: 0,
        tags: ['season', 'player', 'individual'],
        notes: 'Most popular option for individual players'
      },
      {
        title: 'Jamboree Entry',
        subtitle: 'Single Event',
        description: 'Entry for weekend jamboree tournament',
        price: 75,
        serviceFee: 7.50,
        totalPrice: 82.50,
        features: [
          'Weekend tournament entry',
          'Multiple games guaranteed',
          'Refreshments included',
          'Awards ceremony',
          'Photo opportunities'
        ],
        itemType: 'jamboree',
        category: 'player',
        popular: false,
        buttonText: 'Enter Tournament',
        buttonClass: 'btn-success',
        displayOrder: 2,
        isActive: true,
        isVisible: true,
        maxCapacity: 50,
        currentRegistrations: 0,
        tags: ['tournament', 'jamboree', 'weekend'],
        notes: 'Perfect for trying out the league'
      },
      {
        title: 'Season + Jamboree Bundle',
        subtitle: 'Best Value',
        description: 'Full season plus all jamboree events',
        price: 200,
        serviceFee: 20,
        totalPrice: 220,
        features: [
          'Full season participation',
          'All jamboree tournaments included',
          'Team jersey and gear',
          'Priority team placement',
          'Exclusive training sessions',
          'End of season banquet'
        ],
        itemType: 'bundle',
        category: 'player',
        popular: false,
        buttonText: 'Get Bundle',
        buttonClass: 'btn-warning',
        displayOrder: 3,
        isActive: true,
        isVisible: true,
        maxCapacity: 75,
        currentRegistrations: 0,
        tags: ['bundle', 'season', 'jamboree', 'value'],
        notes: 'Best value for committed players'
      },
      {
        title: 'Assistant Coach',
        subtitle: 'Coaching Staff',
        description: 'Assistant coach registration and certification',
        price: 100,
        serviceFee: 10,
        totalPrice: 110,
        features: [
          'Coaching certification',
          'Training materials',
          'Background check included',
          'Coach polo shirt',
          'Season-long commitment'
        ],
        itemType: 'assistant_coach',
        category: 'coach',
        popular: false,
        buttonText: 'Apply as Coach',
        buttonClass: 'btn-info',
        displayOrder: 4,
        isActive: true,
        isVisible: true,
        maxCapacity: 20,
        currentRegistrations: 0,
        tags: ['coach', 'assistant', 'staff'],
        notes: 'For volunteer assistant coaches'
      },
      {
        title: 'Head Coach',
        subtitle: 'Team Leadership',
        description: 'Head coach registration with full responsibilities',
        price: 150,
        serviceFee: 15,
        totalPrice: 165,
        features: [
          'Advanced coaching certification',
          'Complete training package',
          'Background check included',
          'Coach gear package',
          'Team management tools',
          'League leadership opportunities'
        ],
        itemType: 'head_coach',
        category: 'coach',
        popular: true,
        buttonText: 'Lead a Team',
        buttonClass: 'btn-primary',
        displayOrder: 5,
        isActive: true,
        isVisible: true,
        maxCapacity: 10,
        currentRegistrations: 0,
        tags: ['coach', 'head', 'leadership'],
        notes: 'For experienced head coaches'
      }
    ];

    const results = [];
    for (const plan of samplePlans) {
      const docRef = await addDoc(collection(db, 'products'), {
        ...plan,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      results.push({ id: docRef.id, title: plan.title });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Created ${results.length} sample pricing plans`,
      plans: results 
    });
  } catch (error) {
    console.error('Error seeding pricing plans:', error);
    return NextResponse.json({ error: 'Failed to seed pricing plans' }, { status: 500 });
  }
}
