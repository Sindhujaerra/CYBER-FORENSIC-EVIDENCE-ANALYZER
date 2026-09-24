import { useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

interface LoginProps {
  onLogin: (token: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const res = await axios.post(endpoint, { username, password });
      if (mode === 'login') {
        onLogin(res.data.token);
      } else {
        setSuccess('Registration successful! Please login with your credentials.');
        setMode('login');
        setUsername('');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-green-400 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-black to-blue-900/30"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,0,0.1)_0%,_transparent_70%)]"></div>
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-6xl font-bold text-green-400 mb-8 text-center drop-shadow-[0_0_10px_rgba(0,255,0,0.8)] animate-pulse">
          Cyber Forensics Analyzer
        </h1>
        <Card className="w-full max-w-md bg-gray-900/90 border-green-500 text-green-400 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-center space-x-4">
              <Button
                variant={mode === 'login' ? 'default' : 'outline'}
                onClick={() => setMode('login')}
                className={mode === 'login' ? 'bg-green-600 hover:bg-green-700 text-black font-bold' : 'border-green-500 text-green-400 hover:bg-green-500 hover:text-black'}
              >
                Login
              </Button>
              <Button
                variant={mode === 'register' ? 'default' : 'outline'}
                onClick={() => setMode('register')}
                className={mode === 'register' ? 'bg-green-600 hover:bg-green-700 text-black font-bold' : 'border-green-500 text-green-400 hover:bg-green-500 hover:text-black'}
              >
                Register
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-gray-800 border-green-500 text-green-400 placeholder-green-600 focus:border-green-400 focus:ring-green-400"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-800 border-green-500 text-green-400 placeholder-green-600 focus:border-green-400 focus:ring-green-400"
                />
              </div>
              {error && (
                <Alert variant="destructive" className="border-red-500 bg-red-900/20">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-green-500 bg-green-900/20">
                  <AlertDescription className="text-green-400">{success}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-black font-bold">
                {mode === 'register' ? 'Register' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}