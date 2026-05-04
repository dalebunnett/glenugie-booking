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

    try {
      console.log('🔐 Attempting login with password:', password);
      console.log('🔐 Request URL:', `${baseUrl}/api/admin/auth`);
      
      const response = await fetch(`${baseUrl}/api/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      console.log('🔐 Response status:', response.status);
      console.log('🔐 Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('🔐 Response data:', data);

      if (response.ok) {
        console.log('✅ Login successful!');
        // Store token in localStorage (using 'token' from response, not 'sessionId')
        if (data.token) {
          localStorage.setItem('admin_session', data.token);
          console.log('✅ Session stored in localStorage:', data.token);
          
          // Cookie is already set by the server via Set-Cookie header
          console.log('✅ Cookie set by server');
        }
        onLogin();
      } else {
        console.log('❌ Login failed:', data.error);
        setError('Invalid password');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Login failed. Please try again.');
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





