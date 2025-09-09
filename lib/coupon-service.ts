import { db } from './firebase';
import { collection, doc, updateDoc, arrayUnion, increment, Timestamp } from 'firebase/firestore';
import { Coupon, COLLECTIONS } from './firestore-schema';
import { CouponValidationResult, CouponValidationRequest } from '../app/api/coupons/validate/route';

export class CouponService {
  // Validate coupon code
  static async validateCoupon(
    code: string,
    originalAmount: number,
    customerId?: string,
    customerEmail?: string,
    itemType?: 'jamboree' | 'complete_season' | 'jamboree_and_season' | 'coach_registration'
  ): Promise<CouponValidationResult> {
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          originalAmount,
          customerId,
          customerEmail,
          itemType: itemType || 'jamboree'
        } as CouponValidationRequest),
      });

      const result: CouponValidationResult = await response.json();
      return result;
    } catch (error) {
      console.error('Error validating coupon:', error);
      return {
        isValid: false,
        error: 'Failed to validate coupon'
      };
    }
  }

  // Apply coupon (record usage)
  static async applyCoupon(
    couponId: string,
    customerId: string,
    customerEmail: string,
    originalAmount: number,
    discountAmount: number,
    finalAmount: number
  ): Promise<boolean> {
    try {
      const couponRef = doc(db, COLLECTIONS.COUPONS, couponId);
      
      // Update coupon with usage information
      await updateDoc(couponRef, {
        usedCount: increment(1),
        usageHistory: arrayUnion({
          customerId,
          customerEmail,
          usedAt: Timestamp.now(),
          originalAmount,
          discountAmount,
          finalAmount
        }),
        updatedAt: Timestamp.now()
      });

      return true;
    } catch (error) {
      console.error('Error applying coupon:', error);
      return false;
    }
  }

  // Calculate discount display text
  static getDiscountDisplay(coupon: Coupon): string {
    switch (coupon.discountType) {
      case 'percentage':
        return `${coupon.discountValue}% off`;
      case 'fixed_amount':
        return `$${coupon.discountValue.toFixed(2)} off`;
      case 'set_price':
        return `Set to $${coupon.discountValue.toFixed(2)}`;
      default:
        return '';
    }
  }

  // Check if coupon is expired
  static isExpired(coupon: Coupon): boolean {
    return new Date() > coupon.expirationDate.toDate();
  }

  // Check if coupon is currently valid (active and within date range)
  static isCurrentlyValid(coupon: Coupon): boolean {
    const now = new Date();
    const startDate = coupon.startDate.toDate();
    const expirationDate = coupon.expirationDate.toDate();
    
    return coupon.isActive && now >= startDate && now <= expirationDate;
  }

  // Get coupon usage percentage
  static getUsagePercentage(coupon: Coupon): number {
    if (!coupon.maxUses) return 0;
    return Math.round((coupon.usedCount / coupon.maxUses) * 100);
  }

  // Format coupon code for display
  static formatCouponCode(code: string): string {
    return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  // Generate random coupon code
  static generateCouponCode(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Calculate final price with coupon applied
  static calculateFinalPrice(
    originalPrice: number,
    serviceFee: number,
    coupon?: Coupon
  ): { subtotal: number; discount: number; serviceFee: number; total: number } {
    const subtotal = originalPrice;
    let discount = 0;
    
    if (coupon && this.isCurrentlyValid(coupon)) {
      switch (coupon.discountType) {
        case 'percentage':
          discount = subtotal * (coupon.discountValue / 100);
          break;
        case 'fixed_amount':
          discount = Math.min(coupon.discountValue, subtotal);
          break;
        case 'set_price':
          if (coupon.discountValue < subtotal) {
            discount = subtotal - coupon.discountValue;
          }
          break;
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const total = discountedSubtotal + serviceFee;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      serviceFee: Math.round(serviceFee * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }
}
