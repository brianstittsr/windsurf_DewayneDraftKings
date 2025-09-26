'use client';

import { useState } from 'react';

export default function TestAdmin() {
  const [message, setMessage] = useState('Admin page is working!');

  return (
    <div className="container mt-4">
      <h1>Test Admin Page</h1>
      <p>{message}</p>
      <button 
        className="btn btn-primary"
        onClick={() => setMessage('Button clicked!')}
      >
        Test Button
      </button>
    </div>
  );
}
