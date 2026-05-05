import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { baseUrl } from '../../lib/base-url';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔐 Attempting login with password:', password);
    console.log('🔐 Request URL:', `${baseUrl}/api/admin/auth`);

    try {
      const response = await fetch(`${baseUrl}/api/admin/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      console.log('🔐 Response status:', response.status);
      console.log('🔐 Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('🔐 Response data:', data);

      // Check for preview environment authentication error
      if (data.error?.code === 'AUTHENTICATION_REQUIRED' || 
          data.error?.message?.includes('Authentication required for preview')) {
        setError('⚠️ Preview Environment Detected: This appears to be a Webflow preview URL that requires authentication. Please use the production URL (e.g., https://www.glenugiekennels.co.uk/app/admin) or contact support to configure preview access.');
        setLoading(false);
        return;
      }

      if (response.ok && data.token) {
        console.log('✅ Login successful, token received');
        localStorage.setItem('adminPassword', password);
        localStorage.setItem('adminToken', data.token);
        onLogin();
      } else {
        console.log('❌ Login failed:', data);
        setError(data.error || 'Invalid password');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      
      // Check if it's a network error that might indicate preview auth
      if (err instanceof TypeError && (err as Error).message.includes('Failed to fetch')) {
        setError('⚠️ Connection Error: Unable to reach the authentication service. If you\'re using a preview URL, please use the production URL instead (e.g., https://www.glenugiekennels.co.uk/app/admin)');
      } else {
        setError('Failed to connect to server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Enter your admin password to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter admin password"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <div className="mt-4 p-3 bg-muted rounded text-sm">
              <p className="font-semibold mb-1">Password:</p>
              <p className="text-muted-foreground font-mono">Peterhead2026!</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}






