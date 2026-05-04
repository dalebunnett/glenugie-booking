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
      
      // IMPORTANT: Clear any old tokens from previous auth system
      const oldToken = localStorage.getItem('admin_session');
      if (oldToken) {
        console.log('[AdminLoginWrapper] Found existing token, verifying...');
        
        try {
          const response = await fetch(`${baseUrl}/api/admin/auth`, {
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${oldToken}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.valid) {
              console.log('[AdminLoginWrapper] Token is valid');
              setIsAuthenticated(true);
              setIsChecking(false);
              return;
            }
          }
          
          console.log('[AdminLoginWrapper] Token is invalid, clearing...');
          localStorage.removeItem('admin_session');
          sessionStorage.removeItem('admin_authenticated');
          document.cookie = 'admin_session=; Path=/; Max-Age=0; SameSite=Lax; Secure';
        } catch (error) {
          console.error('[AdminLoginWrapper] Token verification failed:', error);
          localStorage.removeItem('admin_session');
          sessionStorage.removeItem('admin_authenticated');
        }
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
          
          // Store the new token
          if (data.token) {
            localStorage.setItem('admin_session', data.token);
            sessionStorage.setItem('admin_authenticated', 'true');
            console.log('[AdminLoginWrapper] Token stored:', data.token.substring(0, 20) + '...');
          }
          
          setIsAuthenticated(true);
        } else {
          console.error('[AdminLoginWrapper] Auto-login failed:', response.status);
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

