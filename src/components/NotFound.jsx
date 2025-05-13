// Path: src/components/NotFound.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '5rem' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for does not exist or has been moved.</p>
      <button onClick={() => navigate('/')}>Return Home</button>
    </div>
  );
};

export default NotFound;
