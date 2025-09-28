'use client';

import { useState, useEffect } from 'react';

interface PricingPlan {
  id?: string;
  title: string;
  subtitle: string;
  price: number;
  serviceFee: number;
  features: string[];
  popular: boolean;
  buttonText: string;
  buttonClass: string;
  itemType: 'jamboree' | 'season' | 'bundle' | 'assistant_coach' | 'head_coach';
  category: 'player' | 'coach';
  isActive: boolean;
}

export default function PricingManagement() {
  // DEPRECATED: This component has been merged into ProductManagement
  // Use ProductManagement for all product/pricing operations
  
  return (
    <div className="container-fluid">
      <div className="alert alert-warning border-left-warning shadow h-100 py-2">
        <div className="row no-gutters align-items-center">
          <div className="col mr-2">
            <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Component Deprecated
            </div>
            <div className="h5 mb-0 font-weight-bold text-gray-800">Pricing Management Merged</div>
            <div className="mt-2">
              <p className="mb-2">
                This component has been merged into <strong>Product Management</strong> for better functionality and to avoid duplication.
              </p>
              <p className="mb-2">
                <strong>Product Management</strong> now includes:
              </p>
              <ul className="mb-3">
                <li>✅ Card view for visual product display</li>
                <li>✅ Table view for detailed admin management</li>
                <li>✅ Enhanced product features and configuration</li>
                <li>✅ Sample data seeding capability</li>
                <li>✅ Better form validation and user experience</li>
              </ul>
              <div className="d-flex gap-2">
                <a href="/admin?tab=pricing" className="btn btn-primary">
                  <i className="fas fa-arrow-right me-2"></i>
                  Go to Product Management
                </a>
                <button className="btn btn-outline-info" onClick={() => window.location.reload()}>
                  <i className="fas fa-sync me-2"></i>
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
          <div className="col-auto">
            <i className="fas fa-box-open fa-2x text-gray-300"></i>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="card shadow">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">Migration Information</h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h6 className="text-danger">❌ Old: PricingManagement</h6>
                <ul className="text-muted small">
                  <li>Limited interface</li>
                  <li>Basic table view only</li>
                  <li>Fewer product fields</li>
                  <li>No sample data seeding</li>
                  <li>Separate from product management</li>
                </ul>
              </div>
              <div className="col-md-6">
                <h6 className="text-success">✅ New: ProductManagement</h6>
                <ul className="text-success small">
                  <li>Comprehensive product interface</li>
                  <li>Both card and table views</li>
                  <li>Extended product configuration</li>
                  <li>Built-in sample data seeding</li>
                  <li>Unified product and pricing management</li>
                </ul>
              </div>
            </div>
            <hr />
            <div className="text-center">
              <p className="mb-2"><strong>All pricing functionality is now available in Product Management</strong></p>
              <p className="text-muted small">This component will be removed in a future update.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
