import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { scorerLogin } from '../../services/authService';
import toast from 'react-hot-toast';
import { Award, User, Lock, Shield, Zap } from 'lucide-react';

const ScorerLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSelectDemo = (u, p) => {
    setUsername(u);
    setPassword(p);
    setSelectedDemo(u);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Username and password are required');
      return;
    }

    setLoading(true);
    try {
      const res = await scorerLogin(username.trim(), password.trim());
      login(res.data.user, res.data.token);
      toast.success('Authenticated as Mark Evaluator');
      navigate('/scorer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid evaluator credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md my-6">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#E50914]/10 border border-[#E50914]/30 text-[#E50914] text-xs font-bold uppercase tracking-wider mb-3">
            <Award size={13} />
            Official Evaluation Module
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            SCOREMASTER
          </h1>
          <p className="text-xs text-[#A1A1A1] mt-1 font-mono uppercase tracking-wide">
            Rapid Point Arbiter & Evaluation Console
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#161616] border border-[#292929] rounded-lg p-6 sm:p-7 shadow-xl">
          <div className="mb-5 pb-4 border-b border-[#222222]">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Evaluator Login</h2>
            <p className="text-xs text-[#A1A1A1] mt-0.5">Authorize to credit contestant points</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-[#A1A1A1] uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-[#666666] pointer-events-none">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setSelectedDemo(null); }}
                  placeholder="scorer"
                  required
                  style={{ paddingLeft: '2.5rem' }}
                  className="w-full h-11 pr-3 bg-[#111111] border border-[#292929] rounded text-white text-sm placeholder-[#555555] focus:outline-none focus:border-[#E50914] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#A1A1A1] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-[#666666] pointer-events-none">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setSelectedDemo(null); }}
                  placeholder="••••••••"
                  required
                  style={{ paddingLeft: '2.5rem' }}
                  className="w-full h-11 pr-3 bg-[#111111] border border-[#292929] rounded text-white text-sm placeholder-[#555555] focus:outline-none focus:border-[#E50914] transition-colors"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded bg-[#E50914] hover:bg-[#B20710] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Launch Scoring Console</span>
              )}
            </button>
          </form>

          {/* Navigation Links */}
          <div className="mt-5 pt-4 border-t border-[#222222] flex items-center justify-between text-xs text-[#A1A1A1]">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <Zap size={13} className="text-[#E50914]" /> Participant Portal
            </Link>
            <Link to="/?tab=admin" className="hover:text-white flex items-center gap-1 transition-colors">
              <Shield size={13} className="text-[#E50914]" /> Admin Access
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScorerLogin;
