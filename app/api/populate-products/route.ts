import { NextRequest, NextResponse } from 'next/server';

// POST /api/populate-products - Populate database with comprehensive product data
export async function POST() {
  try {
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not available' 
      }, { status: 503 });
    }

    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    
    const comprehensiveProducts = [
      // PLAYER REGISTRATION PLANS
      {
        title: 'Player Registration',
        subtitle: 'Individual Player',
        description: 'Complete player registration for the full season with all benefits included',
        price: 150.00,
        serviceFee: 15.00,
        totalPrice: 165.00,
        features: [
          'Full season participation (12+ games)',
          'Official team jersey included',
          'Professional coaching and training',
          'Individual statistics tracking',
          'End of season awards ceremony',
          'Team photos and media coverage',
          'Access to league facilities',
          'Insurance coverage during games'
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
        tags: ['season', 'player', 'individual', 'popular'],
        notes: 'Most popular option for individual players - includes everything needed for full season'
      },

      {
        title: 'Jamboree Tournament Entry',
        subtitle: 'Single Event',
        description: 'Entry for weekend jamboree tournament - perfect for trying out the league',
        price: 75.00,
        serviceFee: 7.50,
        totalPrice: 82.50,
        features: [
          'Weekend tournament entry',
          'Minimum 3 games guaranteed',
          'Refreshments and snacks included',
          'Awards ceremony participation',
          'Professional photo opportunities',
          'Team placement for future seasons',
          'Meet coaches and other players',
          'Equipment trial opportunities'
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
        tags: ['tournament', 'jamboree', 'weekend', 'trial'],
        notes: 'Perfect for trying out the league before committing to full season'
      },

      {
        title: 'Season + Jamboree Bundle',
        subtitle: 'Best Value Package',
        description: 'Complete package including full season plus all jamboree tournaments',
        price: 200.00,
        serviceFee: 20.00,
        totalPrice: 220.00,
        features: [
          'Full season participation',
          'All jamboree tournaments included',
          'Premium team jersey and gear package',
          'Priority team placement',
          'Exclusive training sessions',
          'End of season championship banquet',
          'Advanced statistics and video analysis',
          'Priority registration for next season'
        ],
        itemType: 'bundle',
        category: 'player',
        popular: false,
        buttonText: 'Get Best Value',
        buttonClass: 'btn-warning',
        displayOrder: 3,
        isActive: true,
        isVisible: true,
        maxCapacity: 75,
        currentRegistrations: 0,
        tags: ['bundle', 'season', 'jamboree', 'value', 'premium'],
        notes: 'Best value for committed players - saves $27.50 compared to separate purchases'
      },

      {
        title: 'Youth Player Registration',
        subtitle: 'Ages 8-17',
        description: 'Special registration for youth players with age-appropriate programming',
        price: 125.00,
        serviceFee: 12.50,
        totalPrice: 137.50,
        features: [
          'Age-appropriate skill development',
          'Youth-sized team jersey',
          'Specialized youth coaching',
          'Parent communication system',
          'Skill development tracking',
          'Youth awards and recognition',
          'Safety-first training approach',
          'Flexible scheduling for school'
        ],
        itemType: 'season',
        category: 'player',
        popular: false,
        buttonText: 'Register Youth Player',
        buttonClass: 'btn-info',
        displayOrder: 4,
        isActive: true,
        isVisible: true,
        maxCapacity: 60,
        currentRegistrations: 0,
        tags: ['youth', 'player', 'season', 'development'],
        notes: 'Designed specifically for youth development with safety and fun as priorities'
      },

      // COACH REGISTRATION PLANS
      {
        title: 'Head Coach Registration',
        subtitle: 'Team Leadership',
        description: 'Complete head coach registration with full team management responsibilities',
        price: 150.00,
        serviceFee: 15.00,
        totalPrice: 165.00,
        features: [
          'Advanced coaching certification',
          'Complete coaching materials package',
          'Background check processing',
          'Premium coach gear package',
          'Team management system access',
          'League leadership opportunities',
          'Coaching clinic attendance',
          'End of season coach recognition'
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
        tags: ['coach', 'head', 'leadership', 'certification'],
        notes: 'For experienced coaches ready to lead a team through the full season'
      },

      {
        title: 'Assistant Coach Registration',
        subtitle: 'Coaching Support Staff',
        description: 'Assistant coach registration and certification for supporting team operations',
        price: 100.00,
        serviceFee: 10.00,
        totalPrice: 110.00,
        features: [
          'Basic coaching certification',
          'Essential training materials',
          'Background check included',
          'Coach polo shirt and cap',
          'Season-long team commitment',
          'Coaching development workshops',
          'Team communication access',
          'Volunteer appreciation events'
        ],
        itemType: 'assistant_coach',
        category: 'coach',
        popular: false,
        buttonText: 'Support a Team',
        buttonClass: 'btn-info',
        displayOrder: 6,
        isActive: true,
        isVisible: true,
        maxCapacity: 20,
        currentRegistrations: 0,
        tags: ['coach', 'assistant', 'support', 'volunteer'],
        notes: 'Perfect for volunteer coaches who want to help but not lead a team'
      },

      {
        title: 'Youth Coach Certification',
        subtitle: 'Youth Development Specialist',
        description: 'Specialized certification for coaching youth players with development focus',
        price: 120.00,
        serviceFee: 12.00,
        totalPrice: 132.00,
        features: [
          'Youth development certification',
          'Age-appropriate coaching methods',
          'Child safety and protection training',
          'Youth coach gear package',
          'Parent communication training',
          'Positive reinforcement techniques',
          'Youth psychology workshop',
          'Special recognition program'
        ],
        itemType: 'head_coach',
        category: 'coach',
        popular: false,
        buttonText: 'Coach Youth',
        buttonClass: 'btn-success',
        displayOrder: 7,
        isActive: true,
        isVisible: true,
        maxCapacity: 8,
        currentRegistrations: 0,
        tags: ['coach', 'youth', 'development', 'certification'],
        notes: 'Specialized program for coaches focused on youth development and positive experiences'
      },

      // SPECIALTY PROGRAMS
      {
        title: 'Skills Development Camp',
        subtitle: '3-Day Intensive',
        description: 'Intensive 3-day skills development camp for players of all levels',
        price: 95.00,
        serviceFee: 9.50,
        totalPrice: 104.50,
        features: [
          '3 full days of intensive training',
          'Professional skill assessment',
          'Personalized development plan',
          'Camp t-shirt and materials',
          'Video analysis sessions',
          'Nutrition and fitness guidance',
          'Certificate of completion',
          'Follow-up coaching recommendations'
        ],
        itemType: 'jamboree',
        category: 'player',
        popular: false,
        buttonText: 'Join Skills Camp',
        buttonClass: 'btn-warning',
        displayOrder: 8,
        isActive: true,
        isVisible: true,
        maxCapacity: 30,
        currentRegistrations: 0,
        tags: ['skills', 'camp', 'development', 'intensive'],
        notes: 'Perfect for players wanting to improve specific skills before season starts'
      },

      {
        title: 'Family Package',
        subtitle: 'Multiple Family Members',
        description: 'Special pricing for families registering multiple players',
        price: 280.00,
        serviceFee: 28.00,
        totalPrice: 308.00,
        features: [
          'Registration for up to 3 family members',
          'Family team jersey set',
          'Coordinated practice schedules',
          'Family seating at games',
          'Bulk equipment discounts',
          'Family recognition events',
          'Sibling team placement priority',
          'Family photo package included'
        ],
        itemType: 'bundle',
        category: 'player',
        popular: false,
        buttonText: 'Register Family',
        buttonClass: 'btn-success',
        displayOrder: 9,
        isActive: true,
        isVisible: true,
        maxCapacity: 25,
        currentRegistrations: 0,
        tags: ['family', 'bundle', 'discount', 'multiple'],
        notes: 'Great value for families with multiple players - saves over $185 compared to individual registrations'
      }
    ];

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const product of comprehensiveProducts) {
      try {
        const docRef = await addDoc(collection(db, 'products'), {
          ...product,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        
        results.push({ 
          id: docRef.id, 
          title: product.title,
          category: product.category,
          status: 'success' 
        });
        successCount++;
      } catch (error) {
        results.push({ 
          title: product.title,
          category: product.category,
          status: 'error',
          error: error.message 
        });
        errorCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully populated ${successCount} products (${errorCount} errors)`,
      summary: {
        total: comprehensiveProducts.length,
        successful: successCount,
        failed: errorCount,
        successRate: `${((successCount / comprehensiveProducts.length) * 100).toFixed(1)}%`
      },
      products: results
    });
    
  } catch (error) {
    console.error('Error populating products:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to populate products',
      details: error.message 
    }, { status: 500 });
  }
}
