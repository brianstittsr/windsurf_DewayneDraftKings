import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { COLLECTIONS, MealPlan } from '@/lib/firestore-schema';

// GET - Fetch all meal plans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const isActive = searchParams.get('active');

    let q = query(
      collection(db, COLLECTIONS.MEAL_PLANS),
      orderBy('createdAt', 'desc')
    );

    // Apply filters
    if (status) {
      q = query(
        collection(db, COLLECTIONS.MEAL_PLANS),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    } else if (isActive === 'true') {
      q = query(
        collection(db, COLLECTIONS.MEAL_PLANS),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const mealPlans: MealPlan[] = [];

    querySnapshot.forEach((doc) => {
      mealPlans.push({
        id: doc.id,
        ...doc.data()
      } as MealPlan);
    });

    return NextResponse.json({
      success: true,
      data: mealPlans,
      count: mealPlans.length
    });

  } catch (error) {
    console.error('Error fetching meal plans:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch meal plans'
    }, { status: 500 });
  }
}

// POST - Create new meal plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'duration', 'mealsPerDay'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`
        }, { status: 400 });
      }
    }

    // Create meal plan data
    const mealPlanData: Omit<MealPlan, 'id'> = {
      // Basic Information
      name: body.name,
      description: body.description,
      shortDescription: body.shortDescription || '',
      
      // Pricing
      price: parseFloat(body.price),
      originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : undefined,
      currency: 'USD',
      
      // Plan Details
      duration: parseInt(body.duration),
      mealsPerDay: parseInt(body.mealsPerDay),
      totalMeals: parseInt(body.duration) * parseInt(body.mealsPerDay),
      
      // Meal Categories
      categories: {
        breakfast: body.categories?.breakfast || false,
        lunch: body.categories?.lunch || false,
        dinner: body.categories?.dinner || false,
        snacks: body.categories?.snacks || false,
      },
      
      // Dietary Options
      dietaryOptions: {
        vegetarian: body.dietaryOptions?.vegetarian || false,
        vegan: body.dietaryOptions?.vegan || false,
        glutenFree: body.dietaryOptions?.glutenFree || false,
        keto: body.dietaryOptions?.keto || false,
        lowCarb: body.dietaryOptions?.lowCarb || false,
        highProtein: body.dietaryOptions?.highProtein || false,
        dairyFree: body.dietaryOptions?.dairyFree || false,
        nutFree: body.dietaryOptions?.nutFree || false,
      },
      
      // Features and Benefits
      features: body.features || [],
      benefits: body.benefits || [],
      
      // Media
      imageUrl: body.imageUrl || undefined,
      galleryImages: body.galleryImages || [],
      
      // Availability
      isActive: body.isActive !== undefined ? body.isActive : true,
      isPopular: body.isPopular || false,
      isFeatured: body.isFeatured || false,
      maxOrders: body.maxOrders ? parseInt(body.maxOrders) : undefined,
      currentOrders: 0,
      
      // Nutritional Information
      nutrition: body.nutrition ? {
        caloriesPerDay: parseInt(body.nutrition.caloriesPerDay) || 0,
        proteinGrams: parseInt(body.nutrition.proteinGrams) || 0,
        carbsGrams: parseInt(body.nutrition.carbsGrams) || 0,
        fatGrams: parseInt(body.nutrition.fatGrams) || 0,
        fiberGrams: parseInt(body.nutrition.fiberGrams) || 0,
        sodiumMg: parseInt(body.nutrition.sodiumMg) || 0,
      } : undefined,
      
      // Sample Menu
      sampleMeals: body.sampleMeals || [],
      
      // Admin Information
      createdBy: body.createdBy || 'admin',
      lastModifiedBy: body.createdBy || 'admin',
      
      // Status
      status: body.status || 'active',
      
      // Sales Metrics
      salesStats: {
        totalSold: 0,
        revenue: 0,
        averageRating: undefined,
        reviewCount: 0,
      },
      
      // Timestamps
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.MEAL_PLANS), mealPlanData);

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...mealPlanData
      },
      message: 'Meal plan created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating meal plan:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create meal plan'
    }, { status: 500 });
  }
}
