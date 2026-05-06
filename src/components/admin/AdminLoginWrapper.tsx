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
      
      try {
        // Check if we have a valid session cookie
        const response = await fetch(`${baseUrl}/api/admin/auth`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.valid) {
            console.log('[AdminLoginWrapper] Already authenticated via cookie');
            
            // Store token in localStorage for API calls
            if (data.token) {
              localStorage.setItem('admin_session', data.token);
              sessionStorage.setItem('admin_authenticated', 'true');
            }
            
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('[AdminLoginWrapper] Auth check failed:', error);
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




