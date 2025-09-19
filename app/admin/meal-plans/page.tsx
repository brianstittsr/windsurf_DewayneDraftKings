'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import MealPlanManagement from '@/components/MealPlanManagement';

export default function AdminMealPlansPage() {
  return (
    <AdminLayout>
      <MealPlanManagement />
    </AdminLayout>
  );
}
