# Product Database Population Scripts

This directory contains scripts and tools for populating the All Pro Sports database with comprehensive pricing plans and product data.

## 📦 Available Products

The population scripts create **9 comprehensive pricing plans**:

### 🏃 Player Plans (6 products)
1. **Player Registration** - $165 (Most Popular)
   - Full season participation with jersey and coaching
2. **Jamboree Tournament Entry** - $82.50
   - Single weekend tournament entry
3. **Season + Jamboree Bundle** - $220 (Best Value)
   - Complete package with premium benefits
4. **Youth Player Registration** - $137.50
   - Age-appropriate programming for ages 8-17
5. **Skills Development Camp** - $104.50
   - 3-day intensive training camp
6. **Family Package** - $308
   - Registration for up to 3 family members

### 👨‍🏫 Coach Plans (3 products)
1. **Head Coach Registration** - $165 (Most Popular)
   - Complete team leadership certification
2. **Assistant Coach Registration** - $110
   - Support staff certification and training
3. **Youth Coach Certification** - $132
   - Specialized youth development focus

## 🚀 How to Populate Products

### Method 1: Admin Panel (Recommended)
1. Go to **Admin Panel** → **Product Management**
2. Click **"Add Sample Data"** button
3. Confirm the population (adds all 9 products)

### Method 2: Direct API Call
```bash
curl -X POST http://localhost:3000/api/populate-products
```

### Method 3: Web Interface
1. Visit: `http://localhost:3000/populate-products.html`
2. Click **"Populate Database"** button
3. View detailed results and status

### Method 4: Node.js Script
```bash
cd scripts
node populate-products.js
```

## 📁 Files in this Directory

- **`populate-products.js`** - Standalone Node.js script
- **`README.md`** - This documentation file

## 🌐 API Endpoints

- **`/api/populate-products`** - Comprehensive population endpoint
- **`/api/products`** - Individual product CRUD operations
- **`/api/pricing`** - Legacy pricing endpoint (queries products)

## ✅ Verification

After populating products, verify success by:

1. **Admin Panel**: Check Product Management for all 9 products
2. **Pricing Page**: Visit `/pricing` to see player and coach plans
3. **API Test**: `GET /api/products` should return all products

## 🔧 Customization

To modify the product data:

1. Edit the `PRODUCTS_DATA` array in `populate-products.js`
2. Or update the data in `/api/populate-products/route.ts`
3. Re-run the population script

## 📊 Product Features

Each product includes:
- **Comprehensive details**: Title, subtitle, description
- **Pricing structure**: Base price + service fee = total
- **Feature lists**: 6-8 detailed benefits per product
- **Categorization**: Player vs Coach, item types
- **Capacity management**: Max registrations and current count
- **Visual elements**: Button styling and popularity indicators
- **SEO/Admin data**: Tags, notes, display order

## 🛡️ Safety

- All scripts use the same API endpoints as the admin panel
- Products are created with proper validation
- Existing products are not duplicated (each run creates new entries)
- Database operations are logged and can be monitored

## 📈 Success Metrics

The population script provides detailed feedback:
- **Success count** and **failure count**
- **Success rate percentage**
- **Individual product status**
- **Firebase document IDs** for successful creations

---

*For questions or issues, check the admin panel logs or Firebase console for detailed error information.*
