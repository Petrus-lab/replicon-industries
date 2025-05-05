import React from 'react';
import AuthPage from './components/AuthPage';
import AdminRoute from './components/AdminRoute';

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const isAdminView = urlParams.get('admin') === 'true';

  return isAdminView ? <AdminRoute /> : <AuthPage />;
}

export default App;

