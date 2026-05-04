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
        // First, check if we have a valid session cookie
        const response = await fetch(`${baseUrl}/api/admin/auth`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.valid) {
            console.log('[AdminLoginWrapper] Already authenticated via cookie');
            setIsAuthenticated(true);
            setIsChecking(false);
            return;
          }
        }
      } catch (error) {
        console.error('[AdminLoginWrapper] Auth check failed:', error);
      }
      
      // Auto-login with hardcoded password
      console.log('[AdminLoginWrapper] Attempting auto-login...');
      try {
        const response = await fetch(`${baseUrl}/api/admin/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ password: 'Peterhead2026!' })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[AdminLoginWrapper] Auto-login successful');
          console.log('[AdminLoginWrapper] Auth response:', data);
          
          setIsAuthenticated(true);
        } else {
          console.error('[AdminLoginWrapper] Auto-login failed:', response.status);
          const errorText = await response.text();
          console.error('[AdminLoginWrapper] Error response:', errorText);
        }
      } catch (error) {
        console.error('[AdminLoginWrapper] Auto-login error:', error);
      } finally {
        setIsChecking(false);
      }
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


