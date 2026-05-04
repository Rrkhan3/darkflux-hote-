'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useNavStore } from '@/lib/stores/navStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Hotel,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  KeyRound,
  Sparkles,
  Shield,
} from 'lucide-react';

export default function LoginModal() {
  const { showLoginModal, closeLoginModal, login, register } = useAuthStore();
  const { setPage } = useNavStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setLoginEmail('');
    setLoginPassword('');
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setRegConfirmPassword('');
    setShowLoginPassword(false);
    setShowRegPassword(false);
    setMode('login');
  };

  const handleClose = () => {
    closeLoginModal();
    resetForm();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const result = await login(loginEmail, loginPassword);
      toast.success(`Welcome back, ${result.name}!`);

      // Auto-redirect based on role
      if (result.role === 'admin') {
        setPage('admin-dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (regPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await register(regName, regEmail, regPassword, 'customer');
      toast.success(`Account created! Welcome, ${result.name}!`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showLoginModal} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="bg-[#1a1a1a] border-[#2e2e2e] max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Hotel className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white">
                {mode === 'login' ? 'Welcome to DARKFLUX' : 'Create Account'}
              </DialogTitle>
              <p className="text-xs text-neutral-500">
                {mode === 'login' ? 'Sign in to continue' : 'Register to get started'}
              </p>
            </div>
          </div>
          <DialogHeader className="sr-only">
            <DialogTitle>{mode === 'login' ? 'Sign In' : 'Register'}</DialogTitle>
          </DialogHeader>
        </div>

        {/* Mode Toggle */}
        <div className="px-6">
          <div className="flex items-center gap-4 mb-5">
            <button
              onClick={() => setMode('login')}
              className={`text-sm font-medium transition-colors ${
                mode === 'login' ? 'text-amber-500' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" />
                Sign In
              </div>
              {mode === 'login' && <div className="h-0.5 bg-amber-500 rounded-full mt-1" />}
            </button>
            <button
              onClick={() => setMode('register')}
              className={`text-sm font-medium transition-colors ${
                mode === 'register' ? 'text-amber-500' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <UserPlus className="h-3.5 w-3.5" />
                Register
              </div>
              {mode === 'register' && <div className="h-0.5 bg-amber-500 rounded-full mt-1" />}
            </button>
          </div>
        </div>

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="px-6 pb-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-neutral-300 flex items-center gap-1.5 text-sm">
                <Mail className="h-3.5 w-3.5" />
                Email Address
              </Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="bg-[#252525] border-[#2e2e2e] text-white placeholder:text-neutral-600 focus:border-amber-500/50 focus:ring-amber-500/20"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-300 flex items-center gap-1.5 text-sm">
                <Lock className="h-3.5 w-3.5" />
                Password
              </Label>
              <div className="relative">
                <Input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="bg-[#252525] border-[#2e2e2e] text-white placeholder:text-neutral-600 pr-10 focus:border-amber-500/50 focus:ring-amber-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 text-black hover:bg-amber-400 font-semibold h-11 text-sm"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>

            <div className="p-3 rounded-lg bg-[#252525] border border-[#2e2e2e]">
              <p className="text-[11px] text-neutral-500 font-medium mb-1">Demo Credentials:</p>
              <p className="text-[11px] text-neutral-400">
                Customer: <span className="text-amber-400">guest@darkflux.com</span> / <span className="text-amber-400">guest123</span>
              </p>
              <p className="text-[11px] text-neutral-400">
                Admin: <span className="text-amber-400">admin@darkflux.com</span> / <span className="text-amber-400">admin123</span>
              </p>
            </div>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="px-6 pb-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-neutral-300 flex items-center gap-1.5 text-sm">
                <User className="h-3.5 w-3.5" />
                Full Name
              </Label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="bg-[#252525] border-[#2e2e2e] text-white placeholder:text-neutral-600 focus:border-amber-500/50 focus:ring-amber-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-300 flex items-center gap-1.5 text-sm">
                <Mail className="h-3.5 w-3.5" />
                Email Address
              </Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="bg-[#252525] border-[#2e2e2e] text-white placeholder:text-neutral-600 focus:border-amber-500/50 focus:ring-amber-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-300 flex items-center gap-1.5 text-sm">
                <Lock className="h-3.5 w-3.5" />
                Password
              </Label>
              <div className="relative">
                <Input
                  type={showRegPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="bg-[#252525] border-[#2e2e2e] text-white placeholder:text-neutral-600 pr-10 focus:border-amber-500/50 focus:ring-amber-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-300 flex items-center gap-1.5 text-sm">
                <Lock className="h-3.5 w-3.5" />
                Confirm Password
              </Label>
              <Input
                type="password"
                placeholder="Re-enter your password"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                className="bg-[#252525] border-[#2e2e2e] text-white placeholder:text-neutral-600 focus:border-amber-500/50 focus:ring-amber-500/20"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 text-black hover:bg-amber-400 font-semibold h-11 text-sm"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>

            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-400/80">
                  Admin access is automatic. If your credentials belong to an admin account, you&apos;ll be redirected to the admin panel upon sign-in.
                </p>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
