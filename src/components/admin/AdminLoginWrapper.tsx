import { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { baseUrl } from '../../lib/base-url';

export default function AdminLoginWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔐 Checking authentication...');
      
      // First check if we have a token in localStorage
      const storedToken = localStorage.getItem('admin_session');
      
      if (!storedToken) {
        console.log('🔐 No stored token found');
        setIsChecking(false);
        setIsAuthenticated(false);
        return;
      }
      
      console.log('🔐 Found stored token, verifying...');
      
      try {
        // Verify the stored token is still valid
        const response = await fetch(`${baseUrl}/api/admin/auth`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        
        console.log('🔐 Verification response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('🔐 Verification response:', data);
          
          if (data.valid) {
            console.log('✅ Token is valid, user authenticated');
            setIsAuthenticated(true);
          } else {
            console.log('❌ Token is invalid, clearing session');
            localStorage.removeItem('admin_session');
            setIsAuthenticated(false);
          }
        } else {
          console.log('❌ Verification failed, clearing session');
          localStorage.removeItem('admin_session');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
        localStorage.removeItem('admin_session');
        setIsAuthenticated(false);
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, []); // Empty dependency array - only run once on mount

  const handleLogin = async (password: string) => {
    console.log('🔐 Attempting login...');
    
    try {
      const response = await fetch(`${baseUrl}/api/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password })
      });

      console.log('🔐 Login response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔐 Login response:', data);
        
        // Store the token
        if (data.token) {
          console.log('✅ Storing token in localStorage');
          localStorage.setItem('admin_session', data.token);
        }
        
        console.log('✅ Login successful, setting authenticated state');
        setIsAuthenticated(true);
        return true;
      } else {
        console.log('❌ Login failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Login error:', error);
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
