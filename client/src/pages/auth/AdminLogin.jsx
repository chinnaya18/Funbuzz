import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminLogin } from '../../services/authService';
import toast from 'react-hot-toast';
import { Shield, User, Lock, Award, Zap } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSelectAdmin = (u, p) => {
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
      const res = await adminLogin(username.trim(), password.trim());
      login(res.data.user, res.data.token);
      toast.success('Admin authenticated');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid admin credentials');
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
            <Shield size={12} />
            Event Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ADMINISTRATOR ACCESS
          </h1>
          <p className="text-xs text-[#A1A1A1] mt-1 font-mono uppercase tracking-wide">
            Coordinator & Technical Director Control Surface
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#161616] border border-[#292929] rounded-lg p-6 sm:p-7 shadow-xl">
          <div className="mb-5 pb-4 border-b border-[#222222]">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Admin Login</h2>
            <p className="text-xs text-[#A1A1A1] mt-0.5">Enter coordinator credentials to manage event</p>
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
                  placeholder="admin"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded bg-[#E50914] hover:bg-[#B20710] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Authenticate</span>
              )}
            </button>
          </form>

          {/* Seed Admin Buttons */}
          <div className="mt-5 pt-4 border-t border-[#222222]">
            <span className="text-[11px] font-bold text-[#A1A1A1] uppercase tracking-wider block mb-2">
              Seeded Admin Credentials:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectAdmin('admin', 'Admin2026#')}
                className={`p-2 rounded border text-xs text-left transition-colors cursor-pointer ${
                  selectedDemo === 'admin'
                    ? 'bg-[#E50914]/15 border-[#E50914] text-white'
                    : 'bg-[#111111] border-[#292929] text-[#A1A1A1] hover:border-[#3A3A3A] hover:text-white'
                }`}
              >
                <p className="font-semibold text-white">Primary Admin</p>
                <p className="font-mono text-[10px] text-[#666666]">admin / Admin2026#</p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAdmin('superadmin', 'superadmin123')}
                className={`p-2 rounded border text-xs text-left transition-colors cursor-pointer ${
                  selectedDemo === 'superadmin'
                    ? 'bg-[#E50914]/15 border-[#E50914] text-white'
                    : 'bg-[#111111] border-[#292929] text-[#A1A1A1] hover:border-[#3A3A3A] hover:text-white'
                }`}
              >
                <p className="font-semibold text-white">Super Admin</p>
                <p className="font-mono text-[10px] text-[#666666]">superadmin / superadmin123</p>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-5 pt-4 border-t border-[#222222] flex items-center justify-between text-xs text-[#A1A1A1]">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <Zap size={13} className="text-[#E50914]" /> Participant Portal
            </Link>
            <Link to="/scorer/login" className="hover:text-white flex items-center gap-1 transition-colors">
              <Award size={13} className="text-[#E50914]" /> Scorer Portal
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
