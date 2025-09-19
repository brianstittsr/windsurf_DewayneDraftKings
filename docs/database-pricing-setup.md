# Database-Driven Pricing Setup

This document explains how to set up database-driven pricing for the All Pro Sports application.

## Overview

The pricing system has been updated to fetch pricing plans from a Firebase Firestore collection instead of using static data. This allows administrators to manage pricing plans directly from the admin panel.

## Firebase Collection Setup

1. Go to your Firebase Console
2. Navigate to Firestore Database
3. Create a new collection called "pricing"
4. Add each of the pricing plans as documents in the collection

## Pricing Plan Structure

Each pricing plan document should have the following fields:

- `title` (string): The name of the plan
- `subtitle` (string): A short description of the plan
- `price` (number): The base price of the plan (without service fee)
- `serviceFee` (number): The service fee amount (typically 3.00)
- `features` (array of strings): List of features included in the plan
- `popular` (boolean): Whether this is a popular plan (shows badge)
- `buttonText` (string): Text for the call-to-action button
- `buttonClass` (string): CSS class for the button styling
- `itemType` (string): Type of plan (jamboree, season, bundle, assistant_coach, head_coach)
- `category` (string): Category of plan (player, coach)
- `isActive` (boolean): Whether the plan is active
- `createdAt` (timestamp): When the plan was created
- `updatedAt` (timestamp): When the plan was last updated

## Initial Pricing Data

The following pricing plans should be added to the database:

```json
[
  {
    "title": "Jamboree Game",
    "subtitle": "Registration + Jersey",
    "price": 23.50,
    "serviceFee": 3.00,
    "features": [
      "Single game registration",
      "Official team jersey",
      "Game day participation",
      "Basic stats tracking",
      "Team photo inclusion"
    ],
    "popular": false,
    "buttonText": "Register Now",
    "buttonClass": "btn-outline-primary",
    "itemType": "jamboree",
    "category": "player",
    "isActive": true
  },
  {
    "title": "Jamboree + Season",
    "subtitle": "Complete package",
    "price": 85.50,
    "serviceFee": 3.00,
    "features": [
      "Jamboree game registration",
      "Complete season access",
      "Official team jersey",
      "Priority team placement",
      "All games & playoffs",
      "Premium stats package",
      "Exclusive team events",
      "Season highlight reel"
    ],
    "popular": true,
    "buttonText": "Get Started",
    "buttonClass": "btn-primary",
    "itemType": "bundle",
    "category": "player",
    "isActive": true
  },
  {
    "title": "Complete Season",
    "subtitle": "Full season access",
    "price": 56.00,
    "serviceFee": 3.00,
    "features": [
      "Complete season registration",
      "All regular season games",
      "Playoff eligibility",
      "Official team jersey",
      "Advanced stats tracking",
      "Team events access",
      "Season awards eligibility"
    ],
    "popular": false,
    "buttonText": "Join Season",
    "buttonClass": "btn-outline-primary",
    "itemType": "season",
    "category": "player",
    "isActive": true
  },
  {
    "title": "Assistant Coach",
    "subtitle": "Support role",
    "price": 42.00,
    "serviceFee": 3.00,
    "features": [
      "Assistant coaching role",
      "Team management access",
      "Player development training",
      "Game day sideline access",
      "Coach certification",
      "Equipment provided"
    ],
    "popular": false,
    "buttonText": "Apply Now",
    "buttonClass": "btn-outline-primary",
    "itemType": "assistant_coach",
    "category": "coach",
    "isActive": true
  },
  {
    "title": "Head Coach",
    "subtitle": "Leadership role",
    "price": 72.00,
    "serviceFee": 3.00,
    "features": [
      "Head coaching position",
      "Full team management",
      "Strategic planning authority",
      "Player recruitment rights",
      "Advanced coach training",
      "Leadership certification",
      "Premium equipment package"
    ],
    "popular": true,
    "buttonText": "Lead Team",
    "buttonClass": "btn-primary",
    "itemType": "head_coach",
    "category": "coach",
    "isActive": true
  }
]
```

## Admin Panel Management

Once the data is in the database, administrators can manage pricing plans through the admin panel:

1. Navigate to the admin panel
2. Click on "Pricing" in the sidebar
3. View, edit, or create new pricing plans

The admin panel provides a user-friendly interface for managing all aspects of pricing plans without requiring direct database access.

## API Endpoints

The following API endpoints are available for pricing management:

- `GET /api/pricing` - Get all active pricing plans
- `POST /api/pricing` - Create a new pricing plan
- `PUT /api/pricing/[id]` - Update an existing pricing plan
- `DELETE /api/pricing/[id]` - Soft delete a pricing plan (sets isActive to false)

## Components Updated

The following components have been updated to use database-driven pricing:

1. **Pricing Page** (`/pricing`) - Fetches plans from the database
2. **Checkout Page** (`/checkout`) - Uses plan data passed from pricing page
3. **Payment Checkout Component** - Uses plan data passed from checkout page
4. **Admin Panel** - Provides interface for managing pricing plans

All components now reference data from the Firebase database, ensuring consistency across the application.
