import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, orderAmount, applicableItems } = await request.json();
    
    if (!code) {
      return NextResponse.json({
        success: false,
        error: 'Coupon code is required'
      }, { status: 400 });
    }

    // Dynamic import to avoid build issues
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database unavailable'
      }, { status: 503 });
    }

    const { collection, query, where, getDocs, Timestamp } = await import('firebase/firestore');
    
    // Find coupon by code
    const couponsRef = collection(db, 'coupons');
    const q = query(couponsRef, where('code', '==', code.toUpperCase()));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return NextResponse.json({
        success: false,
        error: 'Invalid coupon code'
      });
    }
    
    const couponDoc = snapshot.docs[0];
    const coupon = couponDoc.data();
    
    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json({
        success: false,
        error: 'This coupon is no longer active'
      });
    }
    
    // Check expiration date
    const now = new Date();
    let expirationDate;
    
    if (coupon.expirationDate) {
      if (typeof coupon.expirationDate.toDate === 'function') {
        // Firestore Timestamp
        expirationDate = coupon.expirationDate.toDate();
      } else {
        // String or Date
        expirationDate = new Date(coupon.expirationDate);
      }
      
      if (now > expirationDate) {
        return NextResponse.json({
          success: false,
          error: 'This coupon has expired'
        });
      }
    }
    
    // Check start date
    if (coupon.startDate) {
      let startDate;
      if (typeof coupon.startDate.toDate === 'function') {
        startDate = coupon.startDate.toDate();
      } else {
        startDate = new Date(coupon.startDate);
      }
      
      if (now < startDate) {
        return NextResponse.json({
          success: false,
          error: 'This coupon is not yet active'
        });
      }
    }
    
    // Check usage limits
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({
        success: false,
        error: 'This coupon has reached its usage limit'
      });
    }
    
    // Check minimum amount
    if (coupon.minimumAmount && orderAmount < coupon.minimumAmount) {
      return NextResponse.json({
        success: false,
        error: `Minimum order amount of $${coupon.minimumAmount} required`
      });
    }
    
    // Check applicable items
    if (coupon.applicableItems && applicableItems && applicableItems.length > 0) {
      const itemType = applicableItems[0]; // Assuming single item for now
      let isApplicable = false;
      
      switch (itemType) {
        case 'player':
        case 'player-registration':
          isApplicable = coupon.applicableItems.playerRegistration;
          break;
        case 'coach':
        case 'coach-registration':
          isApplicable = coupon.applicableItems.coachRegistration;
          break;
        case 'jamboree':
          isApplicable = coupon.applicableItems.jamboreeOnly;
          break;
        case 'season':
          isApplicable = coupon.applicableItems.completeSeason;
          break;
        case 'bundle':
        case 'jamboree-season':
          isApplicable = coupon.applicableItems.jamboreeAndSeason;
          break;
        default:
          // If no specific match, check if any registration type is applicable
          isApplicable = coupon.applicableItems.playerRegistration || 
                        coupon.applicableItems.coachRegistration ||
                        coupon.applicableItems.jamboreeOnly ||
                        coupon.applicableItems.completeSeason ||
                        coupon.applicableItems.jamboreeAndSeason;
      }
      
      if (!isApplicable) {
        return NextResponse.json({
          success: false,
          error: 'This coupon is not applicable to your selected items'
        });
      }
    }
    
    // Calculate discount
    let discount = 0;
    let finalAmount = orderAmount;
    
    switch (coupon.discountType) {
      case 'percentage':
        discount = (orderAmount * coupon.discountValue) / 100;
        finalAmount = orderAmount - discount;
        break;
      case 'fixed_amount':
        discount = Math.min(coupon.discountValue, orderAmount);
        finalAmount = orderAmount - discount;
        break;
      case 'set_price':
        discount = Math.max(0, orderAmount - coupon.discountValue);
        finalAmount = coupon.discountValue;
        break;
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid coupon discount type'
        });
    }
    
    // Ensure final amount is not negative
    finalAmount = Math.max(0, finalAmount);
    
    return NextResponse.json({
      success: true,
      coupon: {
        id: couponDoc.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      },
      discount: parseFloat(discount.toFixed(2)),
      finalAmount: parseFloat(finalAmount.toFixed(2)),
      originalAmount: orderAmount,
      message: `Coupon "${coupon.code}" applied successfully`
    });
    
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to validate coupon'
    }, { status: 500 });
  }
}
