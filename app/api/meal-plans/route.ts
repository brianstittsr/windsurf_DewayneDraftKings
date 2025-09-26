import { NextRequest, NextResponse } from 'next/server';
import { MealPlan } from '@/lib/firestore-schema';

// Mock data for development - replace with Firebase integration
const mockMealPlans: MealPlan[] = [
  {
    id: '1',
    name: 'Athletic Performance Plan',
    description: 'High-protein meal plan designed for peak athletic performance',
    price: 89.99,
    duration: 7, // days
    mealsPerDay: 3,
    dietaryOptions: ['high-protein', 'balanced'],
    features: ['Custom macros', 'Pre/Post workout meals', 'Nutritionist support'],
    nutritionInfo: {
      calories: 2500,
      protein: 150,
      carbs: 300,
      fat: 80,
      fiber: 35
    },
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Recovery & Wellness Plan',
    description: 'Anti-inflammatory focused meal plan for recovery and wellness',
    price: 79.99,
    duration: 7,
    mealsPerDay: 3,
    dietaryOptions: ['anti-inflammatory', 'organic'],
    features: ['Recovery focused', 'Anti-inflammatory foods', 'Hydration support'],
    nutritionInfo: {
      calories: 2200,
      protein: 120,
      carbs: 250,
      fat: 90,
      fiber: 40
    },
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const active = searchParams.get('active');

    let filteredPlans = mockMealPlans;

    // Filter by status
    if (status && status !== 'all') {
      filteredPlans = filteredPlans.filter(plan => plan.status === status);
    }

    // Filter by active status
    if (active === 'true') {
      filteredPlans = filteredPlans.filter(plan => plan.status === 'active');
    } else if (active === 'false') {
      filteredPlans = filteredPlans.filter(plan => plan.status !== 'active');
    }

    return NextResponse.json({
      success: true,
      mealPlans: filteredPlans,
      total: filteredPlans.length
    });
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch meal plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'duration', 'mealsPerDay'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create new meal plan
    const newMealPlan: MealPlan = {
      id: Date.now().toString(), // Simple ID generation for mock
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),
      duration: parseInt(body.duration),
      mealsPerDay: parseInt(body.mealsPerDay),
      dietaryOptions: body.dietaryOptions || [],
      features: body.features || [],
      nutritionInfo: body.nutritionInfo || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      },
      status: body.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // In a real implementation, save to Firebase here
    mockMealPlans.push(newMealPlan);

    return NextResponse.json({
      success: true,
      mealPlan: newMealPlan,
      message: 'Meal plan created successfully'
    });
  } catch (error) {
    console.error('Error creating meal plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create meal plan' },
      { status: 500 }
    );
  }
}
