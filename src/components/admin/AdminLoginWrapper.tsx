import { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { baseUrl } from '../../lib/base-url';

export default function AdminLoginWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // First check if we have a token in localStorage
      const storedToken = localStorage.getItem('admin_session');
      
      if (!storedToken) {
        setIsChecking(false);
        setIsAuthenticated(false);
        return;
      }
      
      try {
        // Verify the stored token is still valid
        const response = await fetch(`${baseUrl}/api/admin/auth`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.valid) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('admin_session');
            setIsAuthenticated(false);
          }
        } else {
          localStorage.removeItem('admin_session');
          setIsAuthenticated(false);
        }
      } catch (error) {
        localStorage.removeItem('admin_session');
        setIsAuthenticated(false);
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, []); // Empty dependency array - only run once on mount

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
        }
        
        setIsAuthenticated(true);
        return true;
      } else {
        return false;
      }
    } catch (error) {
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

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    setIsAuthenticated(false);
  };

  return <AdminDashboard onLogout={handleLogout} />;
}



