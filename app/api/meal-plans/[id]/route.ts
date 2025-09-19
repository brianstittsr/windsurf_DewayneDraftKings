import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { COLLECTIONS, MealPlan } from '@/lib/firestore-schema';

// GET - Fetch single meal plan
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = doc(db, COLLECTIONS.MEAL_PLANS, params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Meal plan not found'
      }, { status: 404 });
    }

    const mealPlan: MealPlan = {
      id: docSnap.id,
      ...docSnap.data()
    } as MealPlan;

    return NextResponse.json({
      success: true,
      data: mealPlan
    });

  } catch (error) {
    console.error('Error fetching meal plan:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch meal plan'
    }, { status: 500 });
  }
}

// PUT - Update meal plan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const docRef = doc(db, COLLECTIONS.MEAL_PLANS, params.id);

    // Check if meal plan exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Meal plan not found'
      }, { status: 404 });
    }

    // Prepare update data
    const updateData: Partial<MealPlan> = {
      updatedAt: Timestamp.now(),
      lastModifiedBy: body.modifiedBy || 'admin'
    };

    // Update fields if provided
    if (body.name) updateData.name = body.name;
    if (body.description) updateData.description = body.description;
    if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription;
    if (body.price) updateData.price = parseFloat(body.price);
    if (body.originalPrice) updateData.originalPrice = parseFloat(body.originalPrice);
    if (body.duration) {
      updateData.duration = parseInt(body.duration);
      updateData.totalMeals = parseInt(body.duration) * (body.mealsPerDay || docSnap.data().mealsPerDay);
    }
    if (body.mealsPerDay) {
      updateData.mealsPerDay = parseInt(body.mealsPerDay);
      updateData.totalMeals = (body.duration || docSnap.data().duration) * parseInt(body.mealsPerDay);
    }
    if (body.categories) updateData.categories = body.categories;
    if (body.dietaryOptions) updateData.dietaryOptions = body.dietaryOptions;
    if (body.features) updateData.features = body.features;
    if (body.benefits) updateData.benefits = body.benefits;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.galleryImages) updateData.galleryImages = body.galleryImages;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isPopular !== undefined) updateData.isPopular = body.isPopular;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.maxOrders) updateData.maxOrders = parseInt(body.maxOrders);
    if (body.nutrition) updateData.nutrition = body.nutrition;
    if (body.sampleMeals) updateData.sampleMeals = body.sampleMeals;
    if (body.status) updateData.status = body.status;

    await updateDoc(docRef, updateData);

    // Fetch updated document
    const updatedDoc = await getDoc(docRef);
    const updatedMealPlan: MealPlan = {
      id: updatedDoc.id,
      ...updatedDoc.data()
    } as MealPlan;

    return NextResponse.json({
      success: true,
      data: updatedMealPlan,
      message: 'Meal plan updated successfully'
    });

  } catch (error) {
    console.error('Error updating meal plan:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update meal plan'
    }, { status: 500 });
  }
}

// DELETE - Delete meal plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = doc(db, COLLECTIONS.MEAL_PLANS, params.id);

    // Check if meal plan exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Meal plan not found'
      }, { status: 404 });
    }

    // Instead of hard delete, mark as discontinued
    await updateDoc(docRef, {
      status: 'discontinued',
      isActive: false,
      updatedAt: Timestamp.now(),
      lastModifiedBy: 'admin'
    });

    return NextResponse.json({
      success: true,
      message: 'Meal plan discontinued successfully'
    });

  } catch (error) {
    console.error('Error deleting meal plan:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete meal plan'
    }, { status: 500 });
  }
}
