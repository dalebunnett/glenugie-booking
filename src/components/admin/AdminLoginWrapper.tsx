import { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { baseUrl } from '../../lib/base-url';

export default function AdminLoginWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('admin_session');
        
        if (!token) {
          console.log('❌ No token found');
          setIsAuthenticated(false);
          setIsChecking(false);
          return;
        }

        console.log('🔍 Checking token validity...');
        const response = await fetch(`${baseUrl}/api/admin/auth`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        console.log('🔍 Auth check response:', data);

        if (response.ok && data.valid) {
          console.log('✅ Token is valid');
          setIsAuthenticated(true);
        } else {
          console.log('❌ Token is invalid');
          localStorage.removeItem('admin_session');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    console.log('✅ Login successful, updating state');
    setIsAuthenticated(true);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard />;
}
