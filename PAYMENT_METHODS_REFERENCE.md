# Payment Methods Reference

## Available Payment Methods

All payment methods are implemented and should be visible in:
1. **Create Payment Modal** - Dropdown with emojis
2. **Payment Table** - Method column with Font Awesome icons

### Complete List

| Payment Method | Icon | Display Name | Code Value |
|---------------|------|--------------|------------|
| Credit/Debit Card | 💳 `fas fa-credit-card` | Credit/Debit Card | `card` |
| Klarna | 🛍️ `fab fa-klarna` | Klarna | `klarna` |
| Affirm | ✅ `fas fa-money-check-alt` | Affirm | `affirm` |
| Cash App | 💵 `fas fa-dollar-sign` | Cash App | `cashapp` |
| Google Pay | 🔵 `fab fa-google-pay` | Google Pay | `google_pay` |
| Apple Pay | 🍎 `fab fa-apple-pay` | Apple Pay | `apple_pay` |
| Amazon Pay | 📦 `fab fa-amazon-pay` | Amazon Pay | `amazon_pay` |
| Cash | 💰 `fas fa-money-bill` | Cash | `cash` |
| Check | 📝 `fas fa-money-check` | Check | `check` |
| Bank Transfer | 🏦 `fas fa-university` | Bank Transfer | `bank_transfer` |
| Free Registration | 🎁 `fas fa-gift` | Free Registration | `free_registration` |

## Where to Find Them

### 1. Create Payment Modal
- Click "New Payment" button (green button, top right)
- Look for "Payment Method" dropdown
- Should show all 10 options with emojis

### 2. Payment Table
- "Method" column (4th column)
- Shows icon + name for each payment
- Example: `💳 Credit/Debit Card`

### 3. Existing Payments
- If you have existing payments, they will show their payment method
- Stripe payments show as "Credit/Debit Card" by default
- Free registrations show as "Free Registration" with gift icon

## Testing

To test the new payment methods:
1. Click "New Payment" button
2. Fill in customer details
3. Select one of the new methods from dropdown:
   - Cash App
   - Google Pay
   - Apple Pay
   - Amazon Pay
4. Create the payment
5. Verify it appears in the table with correct icon

## Troubleshooting

If icons aren't showing:
- Check browser console for Font Awesome loading errors
- Verify Font Awesome 6.4.0 is loaded (check Network tab)
- Clear browser cache and refresh

If dropdown is empty:
- Check browser console for JavaScript errors
- Verify the modal is opening correctly
- Try refreshing the page
