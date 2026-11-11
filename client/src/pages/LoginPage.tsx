import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-70px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#031526] via-[#0b2a4a] to-[#061b30] overflow-hidden">
      {/* Subtle particle / grid background overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 16% 14%, rgba(48, 142, 184, .35), transparent 34%), radial-gradient(circle at 84% 82%, rgba(205, 127, 50, .25), transparent 30%), linear-gradient(rgba(138, 207, 237, .08) 1px, transparent 1px), linear-gradient(90deg, rgba(138, 207, 237, .08) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 100% 100%, 48px 48px, 48px 48px',
        }}
      />

      <div className="relative z-10 max-w-[420px] w-full bg-[#08233c]/95 border border-[#c4e8f7]/20 backdrop-blur-xl p-8 rounded-2xl shadow-2xl text-white space-y-5">
        {/* Brand */}
        <div className="text-center space-y-1">
          <div className="w-16 h-16 rounded-full bg-white p-1 flex items-center justify-center shadow-xl border-2 border-white/40 mx-auto mb-3 overflow-hidden">
            <img
              src="/kit-logo.png"
              alt="Khanpur Institute of Technology"
              className="w-full h-full object-contain"
            />
          </div>
          <h5 className="font-bold text-base text-white tracking-tight">
            {settings.institutionName || 'Khanpur Institute of Technology'}
          </h5>
          <small className="text-[#cd7f32] text-xs font-bold block">
            KIT Helping Hand
          </small>
        </div>

        <div className="text-center pt-1 border-t border-white/10">
          <h4 className="font-extrabold text-lg text-white">Student & Faculty Login</h4>
          <p className="text-white/70 text-xs mt-1 leading-normal">
            Sign in with your registered student, CR/GR, or administrative credentials
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kit.edu.pk or student email"
                className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#cd7f32] focus:border-[#cd7f32]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#cd7f32] focus:border-[#cd7f32]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-[#cd7f32] hover:bg-[#ba6a25] transition-colors shadow-md disabled:opacity-50 mt-2"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div className="pt-3 border-t border-white/10 text-center text-xs text-white/70 space-y-2">
          <div>
            <span>New student? </span>
            <Link to="/register" className="font-bold text-[#cd7f32] hover:text-[#dba175] underline underline-offset-2">
              Create an account
            </Link>
          </div>
          <p className="text-[11px] text-white/50">
            Make sure your account has appropriate role permissions to access the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};
