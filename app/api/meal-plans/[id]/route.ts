import { NextRequest, NextResponse } from 'next/server';

// Mock data - in real implementation, this would come from Firebase
const mockMealPlans: any[] = [
  {
    id: '1',
    name: 'Athletic Performance Plan',
    description: 'High-protein meal plan designed for peak athletic performance',
    price: 89.99,
    duration: 7,
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
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const mealPlan = mockMealPlans.find(plan => plan.id === id);
    
    if (!mealPlan) {
      return NextResponse.json(
        { success: false, error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      mealPlan
    });
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch meal plan' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const mealPlanIndex = mockMealPlans.findIndex(plan => plan.id === id);
    
    if (mealPlanIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    // Update meal plan
    mockMealPlans[mealPlanIndex] = {
      ...mockMealPlans[mealPlanIndex],
      ...body,
      updatedAt: new Date()
    };

    return NextResponse.json({
      success: true,
      mealPlan: mockMealPlans[mealPlanIndex],
      message: 'Meal plan updated successfully'
    });
  } catch (error) {
    console.error('Error updating meal plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update meal plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const mealPlanIndex = mockMealPlans.findIndex(plan => plan.id === id);
    
    if (mealPlanIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    // Soft delete - mark as discontinued
    mockMealPlans[mealPlanIndex].status = 'discontinued';
    mockMealPlans[mealPlanIndex].updatedAt = new Date();

    return NextResponse.json({
      success: true,
      message: 'Meal plan discontinued successfully'
    });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete meal plan' },
      { status: 500 }
    );
  }
}
