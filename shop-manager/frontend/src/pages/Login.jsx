import { useState } from 'react';
import { EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername]       = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState(null);
  const [loading, setLoading]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }
    try {
      setLoading(true);
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 px-4">
      
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-teal-500 rounded-full blur-[120px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-500 rounded-full blur-[120px] opacity-10 pointer-events-none" />

      <div className="relative w-full max-w-sm">
        
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          
          {/* Logo / Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg shadow-teal-500/30 mb-4">
              <LockClosedIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Shop Manager Pro</h1>
            <p className="text-sm text-slate-400 mt-1">Sign in to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            {/* Dummy hidden inputs to trick browser autofill */}
            <input type="text" name="fake-username" style={{ display: 'none' }} />
            <input type="password" name="fake-password" style={{ display: 'none' }} />


            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center rounded-xl px-4 py-3 font-medium">
                {error}
              </div>
            )}

            {/* Username */}
            <div>
              {/* Label removed to hide hint */}
              <div className="relative">
                {/* Icon removed */}
                <input
                  type="text"
                  required
                  autoComplete="new-password"
                  placeholder="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:border-teal-500 focus:bg-white/10 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              {/* Label removed to hide hint */}
              <div className="relative">
                {/* Icon removed */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:border-teal-500 focus:bg-white/10 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm tracking-wide"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LockClosedIcon className="w-5 h-5" />
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
