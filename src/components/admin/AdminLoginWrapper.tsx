import { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { baseUrl } from '../../lib/base-url';

export default function AdminLoginWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('[AdminLoginWrapper] Checking authentication...');
      
      // First check if we have a token in localStorage
      const storedToken = localStorage.getItem('admin_session');
      
      if (!storedToken) {
        console.log('[AdminLoginWrapper] No stored token, showing login form');
        setIsChecking(false);
        return;
      }
      
      try {
        // Verify the stored token is still valid
        const response = await fetch(`${baseUrl}/api/admin/auth`, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.valid) {
            console.log('[AdminLoginWrapper] Token is valid, authenticated');
            sessionStorage.setItem('admin_authenticated', 'true');
            setIsAuthenticated(true);
          } else {
            console.log('[AdminLoginWrapper] Token invalid, clearing and showing login');
            localStorage.removeItem('admin_session');
            sessionStorage.removeItem('admin_authenticated');
          }
        } else {
          console.log('[AdminLoginWrapper] Auth check failed, clearing and showing login');
          localStorage.removeItem('admin_session');
          sessionStorage.removeItem('admin_authenticated');
        }
      } catch (error) {
        console.error('[AdminLoginWrapper] Auth check error:', error);
        localStorage.removeItem('admin_session');
        sessionStorage.removeItem('admin_authenticated');
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (password: string) => {
    try {
      const response = await fetch(`${baseUrl}/api/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store the token
        if (data.token) {
          localStorage.setItem('admin_session', data.token);
          sessionStorage.setItem('admin_authenticated', 'true');
        }
        
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard />;
}





