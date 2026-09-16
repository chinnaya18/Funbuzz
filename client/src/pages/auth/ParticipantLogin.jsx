import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { participantLogin, getDemoAccounts } from '../../services/authService';
import toast from 'react-hot-toast';
import { User, Hash, KeyRound, Shield, Award } from 'lucide-react';

const ParticipantLogin = () => {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [selectedDemo, setSelectedDemo] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getDemoAccounts()
      .then(res => {
        if (res.data?.participants) {
          setDemoAccounts(res.data.participants);
        }
      })
      .catch(() => {
        setDemoAccounts([]);
      });
  }, []);

  const handleSelectDemo = (p) => {
    setName(p.name);
    setRollNumber(p.rollNumber);
    setPasscode(p.passcode || 'pass101');
    setSelectedDemo(p.rollNumber);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rollNumber.trim()) {
      toast.error('Roll Number is required');
      return;
    }

    setLoading(true);
    try {
      const res = await participantLogin(name.trim(), rollNumber.trim(), passcode.trim());
      login(res.data.user, res.data.token);
      toast.success(`Welcome, ${res.data.user.name}`);
      navigate('/participant/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md my-6">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#E50914]/10 border border-[#E50914]/30 text-[#E50914] text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse" />
            Live Event Arena
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            FUN EVENT
          </h1>
          <p className="text-xs text-[#A1A1A1] mt-1 font-mono uppercase tracking-wide">
            Bonus Round & Tie-Breaker Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#161616] border border-[#292929] rounded-lg p-6 sm:p-7 shadow-xl">
          <div className="mb-5 pb-4 border-b border-[#222222] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">Participant Login</h2>
              <p className="text-xs text-[#A1A1A1] mt-0.5">Enter credentials to access live score</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-xs font-semibold text-[#A1A1A1] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-[#666666] pointer-events-none">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setSelectedDemo(null); }}
                  placeholder="Enter full name"
                  style={{ paddingLeft: '2.5rem' }}
                  className="w-full h-11 pr-3 bg-[#111111] border border-[#292929] rounded text-white text-sm placeholder-[#555555] focus:outline-none focus:border-[#E50914] transition-colors"
                />
              </div>
            </div>

            {/* Roll Number Input */}
            <div>
              <label className="block text-xs font-semibold text-[#A1A1A1] uppercase tracking-wider mb-1.5">
                Roll Number / ID <span className="text-[#E50914]">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-[#666666] pointer-events-none">
                  <Hash size={16} />
                </div>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => { setRollNumber(e.target.value.toUpperCase()); setSelectedDemo(null); }}
                  placeholder="e.g. 26MCA101"
                  required
                  style={{ paddingLeft: '2.5rem' }}
                  className="w-full h-11 pr-3 bg-[#111111] border border-[#292929] rounded text-white font-mono text-sm uppercase placeholder-[#555555] focus:outline-none focus:border-[#E50914] transition-colors"
                />
              </div>
            </div>

            {/* Passcode (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#A1A1A1] uppercase tracking-wider">
                  Event Passcode
                </label>
                <span className="text-[10px] text-[#666666] uppercase">Optional</span>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-[#666666] pointer-events-none">
                  <KeyRound size={16} />
                </div>
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="e.g. pass101"
                  style={{ paddingLeft: '2.5rem' }}
                  className="w-full h-11 pr-3 bg-[#111111] border border-[#292929] rounded text-white font-mono text-sm placeholder-[#555555] focus:outline-none focus:border-[#E50914] transition-colors"
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
                <span>Enter Arena</span>
              )}
            </button>
          </form>

          {/* Seed Quick-Fill Chips */}
          {demoAccounts.length > 0 && (
            <div className="mt-5 pt-4 border-t border-[#222222]">
              <span className="text-[11px] font-bold text-[#A1A1A1] uppercase tracking-wider block mb-2">
                Quick Test Accounts:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {demoAccounts.slice(0, 4).map(p => {
                  const isSelected = selectedDemo === p.rollNumber;
                  return (
                    <button
                      key={p.rollNumber}
                      type="button"
                      onClick={() => handleSelectDemo(p)}
                      className={`text-left p-2 rounded border text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#E50914]/15 border-[#E50914] text-white'
                          : 'bg-[#111111] border-[#292929] text-[#A1A1A1] hover:border-[#3A3A3A] hover:text-white'
                      }`}
                    >
                      <p className="font-semibold truncate">{p.name}</p>
                      <p className="font-mono text-[10px] text-[#666666]">{p.rollNumber}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Portal Navigation Links */}
          <div className="mt-5 pt-4 border-t border-[#222222] flex items-center justify-between text-xs text-[#A1A1A1]">
            <Link to="/scorer/login" className="hover:text-white flex items-center gap-1 transition-colors">
              <Award size={13} className="text-[#E50914]" /> Scorer Portal
            </Link>
            <Link to="/admin/login" className="hover:text-white flex items-center gap-1 transition-colors">
              <Shield size={13} className="text-[#E50914]" /> Admin Access
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ParticipantLogin;
