import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Coupon, COLLECTIONS } from '../../../../lib/firestore-schema';

export interface CouponValidationResult {
  isValid: boolean;
  coupon?: Coupon;
  error?: string;
  discountAmount?: number;
  finalAmount?: number;
}

export interface CouponValidationRequest {
  code: string;
  originalAmount: number;
  customerId?: string;
  customerEmail?: string;
  itemType: 'jamboree' | 'complete_season' | 'jamboree_and_season' | 'coach_registration';
}

// POST /api/coupons/validate - Validate coupon code and calculate discount
export async function POST(request: NextRequest) {
  try {
    const { code, originalAmount, customerId, customerEmail, itemType }: CouponValidationRequest = await request.json();
    
    if (!code || originalAmount === undefined) {
      return NextResponse.json({
        isValid: false,
        error: 'Coupon code and original amount are required'
      } as CouponValidationResult);
    }

    // Find coupon by code
    const couponQuery = query(
      collection(db, COLLECTIONS.COUPONS),
      where('code', '==', code.toUpperCase())
    );
    const couponSnapshot = await getDocs(couponQuery);
    
    if (couponSnapshot.empty) {
      return NextResponse.json({
        isValid: false,
        error: 'Invalid coupon code'
      } as CouponValidationResult);
    }

    const couponDoc = couponSnapshot.docs[0];
    const coupon = { id: couponDoc.id, ...couponDoc.data() } as Coupon;
    
    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json({
        isValid: false,
        error: 'This coupon is no longer active'
      } as CouponValidationResult);
    }

    // Check if coupon is within valid date range
    const now = new Date();
    const startDate = coupon.startDate.toDate();
    const expirationDate = coupon.expirationDate.toDate();
    
    if (now < startDate) {
      return NextResponse.json({
        isValid: false,
        error: 'This coupon is not yet valid'
      } as CouponValidationResult);
    }
    
    if (now > expirationDate) {
      return NextResponse.json({
        isValid: false,
        error: 'This coupon has expired'
      } as CouponValidationResult);
    }

    // Check usage limits
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({
        isValid: false,
        error: 'This coupon has reached its usage limit'
      } as CouponValidationResult);
    }

    // Check per-customer usage limit
    if (coupon.maxUsesPerCustomer && (customerId || customerEmail)) {
      const customerUsageCount = coupon.usageHistory.filter(usage => 
        (customerId && usage.customerId === customerId) ||
        (customerEmail && usage.customerEmail === customerEmail)
      ).length;
      
      if (customerUsageCount >= coupon.maxUsesPerCustomer) {
        return NextResponse.json({
          isValid: false,
          error: 'You have already used this coupon the maximum number of times'
        } as CouponValidationResult);
      }
    }

    // Check if coupon applies to the item type
    const applicableItems = coupon.applicableItems;
    let isApplicable = false;
    
    switch (itemType) {
      case 'jamboree':
        isApplicable = applicableItems.jamboreeOnly || applicableItems.playerRegistration;
        break;
      case 'complete_season':
        isApplicable = applicableItems.completeSeason || applicableItems.playerRegistration;
        break;
      case 'jamboree_and_season':
        isApplicable = applicableItems.jamboreeAndSeason || applicableItems.playerRegistration;
        break;
      case 'coach_registration':
        isApplicable = applicableItems.coachRegistration;
        break;
      default:
        isApplicable = false;
    }
    
    if (!isApplicable) {
      return NextResponse.json({
        isValid: false,
        error: 'This coupon is not applicable to the selected item'
      } as CouponValidationResult);
    }

    // Check minimum amount requirement
    if (coupon.minimumAmount && originalAmount < coupon.minimumAmount) {
      return NextResponse.json({
        isValid: false,
        error: `Minimum order amount of $${coupon.minimumAmount.toFixed(2)} required for this coupon`
      } as CouponValidationResult);
    }

    // Calculate discount
    let discountAmount = 0;
    let finalAmount = originalAmount;
    
    switch (coupon.discountType) {
      case 'percentage':
        discountAmount = originalAmount * (coupon.discountValue / 100);
        finalAmount = originalAmount - discountAmount;
        break;
      case 'fixed_amount':
        discountAmount = Math.min(coupon.discountValue, originalAmount);
        finalAmount = originalAmount - discountAmount;
        break;
      case 'set_price':
        if (coupon.discountValue < originalAmount) {
          discountAmount = originalAmount - coupon.discountValue;
          finalAmount = coupon.discountValue;
        } else {
          // If set price is higher than original, no discount
          discountAmount = 0;
          finalAmount = originalAmount;
        }
        break;
    }

    // Ensure final amount is not negative
    finalAmount = Math.max(0, finalAmount);
    discountAmount = originalAmount - finalAmount;

    return NextResponse.json({
      isValid: true,
      coupon,
      discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
      finalAmount: Math.round(finalAmount * 100) / 100
    } as CouponValidationResult);

  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({
      isValid: false,
      error: 'Failed to validate coupon'
    } as CouponValidationResult);
  }
}
