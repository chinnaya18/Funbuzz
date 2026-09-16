import { useState, useEffect } from 'react';
import { getParticipants } from '../../services/participantService';
import { quickAward, getParticipantScore } from '../../services/scoreService';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Search, Plus, Minus, RotateCcw, Flame, X } from 'lucide-react';

const TIERS = [
  { key: 'chill', label: 'Easy', points: 5, bg: 'bg-[#064e3b]', border: 'border-[#059669]' },
  { key: 'blaze', label: 'Medium', points: 10, bg: 'bg-[#78350f]', border: 'border-[#d97706]' },
  { key: 'savage', label: 'Hard', points: 15, bg: 'bg-[#7c2d12]', border: 'border-[#ea580c]' },
  { key: 'brutal', label: 'Hardest', points: 20, bg: 'bg-[#7f1d1d]', border: 'border-[#dc2626]' },
  { key: 'legendary', label: 'Supreme', points: 25, bg: 'bg-[#581c87]', border: 'border-[#9333ea]' }
];

const ScorerDashboard = () => {
  const [participants, setParticipants] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [awarding, setAwarding] = useState(false);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      const res = await getParticipants();
      setParticipants(res.data);
      if (res.data.length > 0 && !selectedParticipant) {
        selectParticipant(res.data[0]);
      }
    } catch (err) {
      toast.error('Failed to load contestants');
    } finally {
      setLoading(false);
    }
  };

  const selectParticipant = async (p) => {
    setSelectedParticipant(p);
    try {
      const res = await getParticipantScore(p._id);
      setCurrentScore(res.data?.totalScore ?? 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAward = async (tierKey, pts, label) => {
    if (!selectedParticipant) {
      toast.error('Please select a contestant first');
      return;
    }

    setAwarding(true);
    try {
      const res = await quickAward(selectedParticipant._id, tierKey, pts, `${pts >= 0 ? '+' : ''}${pts} pts on ${label}`);
      const updatedTotal = res.data.score.totalScore;
      setCurrentScore(updatedTotal);
      
      toast.success(
        <div className="text-xs">
          <span className="font-bold text-white">{selectedParticipant.name}</span> awarded{' '}
          <span className="font-bold text-[#FF3B47]">{pts >= 0 ? `+${pts}` : pts} pts</span>!
        </div>,
        { id: 'score-toast', duration: 2000 }
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to award score');
    } finally {
      setAwarding(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading contestants..." />;

  const filtered = participants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in" style={{ paddingBottom: '48px' }}>
      
      {/* Responsive grid: single column on mobile, two columns on desktop */}
      <div
        className="w-full"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: '24px'
        }}
      >
        {/* On lg+ screens, use two columns */}
        <style>{`
          @media (min-width: 1024px) {
            .scorer-grid { grid-template-columns: 380px minmax(0, 1fr) !important; }
          }
        `}</style>
        <div className="scorer-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '24px' }}>
          
          {/* LEFT: Contestant Search Panel */}
          <div
            className="bg-[#0E0E14] border border-[#222230] rounded-2xl shadow-xl"
            style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#A1A1AA] flex items-center gap-2">
                <Search size={14} className="text-[#E50914]" />
                Search Contestant
              </span>
              <span className="text-[10px] font-mono text-[#71717A]">
                {participants.length} Registered
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none" size={17} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type name or roll number..."
                style={{ paddingLeft: '2.6rem', paddingRight: search ? '2.5rem' : '1rem' }}
                className="input-primary text-sm h-12"
                autoFocus
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#71717A] hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Contestant List */}
            {participants.length === 0 ? (
              <p className="text-xs text-[#71717A] py-4 text-center font-mono">
                No contestants found. Add them via Admin → Participants.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                {filtered.length === 0 ? (
                  <p className="text-xs text-[#71717A] py-4 text-center">No matches found</p>
                ) : (
                  filtered.map(p => {
                    const isSelected = selectedParticipant?._id === p._id;
                    return (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => selectParticipant(p)}
                        className={`w-full rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#181826] border-[#E50914] text-white shadow-[0_0_12px_rgba(229,9,20,0.25)]'
                            : 'bg-[#12121A] border-[#22222E] text-[#A1A1AA] hover:border-[#333346] hover:text-white'
                        }`}
                        style={{ padding: '12px 14px' }}
                      >
                        <div className="truncate pr-2">
                          <p className="font-bold text-sm text-white truncate">{p.name}</p>
                          <p className="font-mono text-xs text-[#71717A]" style={{ marginTop: '2px' }}>{p.rollNumber}</p>
                        </div>
                        <span className={`text-xs font-mono font-bold shrink-0 ${isSelected ? 'text-[#E50914]' : 'text-[#666677]'}`}>
                          {isSelected ? '✓ Active' : 'Select'}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Scoring Panel */}
          {selectedParticipant ? (
            <div
              className="bg-[#0E0E14] border border-[#222230] rounded-2xl shadow-2xl"
              style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              
              {/* Active Contestant Banner */}
              <div className="flex items-center justify-between flex-wrap" style={{ paddingBottom: '18px', borderBottom: '1px solid #1E1E2A', gap: '16px' }}>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#E50914] font-bold block">
                    SCORING FOR
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight" style={{ marginTop: '4px' }}>
                    {selectedParticipant.name}
                  </h2>
                  <span className="text-xs font-mono text-[#A1A1AA]" style={{ marginTop: '2px', display: 'block' }}>
                    {selectedParticipant.rollNumber}
                  </span>
                </div>

                {/* Score Counter */}
                <div className="text-right bg-[#14141E] border border-[#E50914]/40 rounded-2xl shadow-[0_0_15px_rgba(229,9,20,0.2)]" style={{ padding: '12px 20px' }}>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] block">
                    Total Score
                  </span>
                  <span className="text-3xl sm:text-4xl font-black font-mono text-[#E50914] tracking-tight">
                    {currentScore} <span className="text-xs font-sans text-white/60">PTS</span>
                  </span>
                </div>
              </div>

              {/* Tier Award Buttons */}
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2" style={{ marginBottom: '14px', display: 'flex' }}>
                  <Flame size={15} className="text-[#E50914]" />
                  Award Points by Category
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {TIERS.map(tier => (
                    <button
                      key={tier.key}
                      type="button"
                      disabled={awarding}
                      onClick={() => handleAward(tier.key, tier.points, tier.label)}
                      className={`rounded-xl border flex items-center justify-between transition-all cursor-pointer active:scale-95 disabled:opacity-50 shadow-md ${tier.bg} ${tier.border} text-white hover:brightness-110`}
                      style={{ height: '60px', padding: '0 16px' }}
                    >
                      <div className="text-left">
                        <span className="font-black text-sm uppercase block tracking-wider">
                          {tier.label}
                        </span>
                      </div>
                      <span className="text-lg font-black font-mono bg-black/30 rounded-lg border border-white/10" style={{ padding: '4px 12px' }}>
                        +{tier.points}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Adjustments */}
              <div style={{ paddingTop: '8px', borderTop: '1px solid #1E1E2A', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                  Quick Adjustments
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  <button
                    type="button"
                    disabled={awarding}
                    onClick={() => handleAward('chill', 1, 'Bonus')}
                    className="rounded-xl bg-[#14141E] hover:bg-[#1E1E28] border border-[#272738] text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                    style={{ height: '44px' }}
                  >
                    <Plus size={13} className="text-[#E50914]" /> +1
                  </button>

                  <button
                    type="button"
                    disabled={awarding}
                    onClick={() => handleAward('chill', 2, 'Bonus')}
                    className="rounded-xl bg-[#14141E] hover:bg-[#1E1E28] border border-[#272738] text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                    style={{ height: '44px' }}
                  >
                    <Plus size={13} className="text-[#E50914]" /> +2
                  </button>

                  <button
                    type="button"
                    disabled={awarding}
                    onClick={() => handleAward('chill', -1, 'Deduction')}
                    className="rounded-xl bg-[#14141E] hover:bg-[#1E1E28] border border-[#272738] text-[#A1A1AA] hover:text-[#E50914] font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                    style={{ height: '44px' }}
                  >
                    <Minus size={13} /> −1
                  </button>

                  <button
                    type="button"
                    disabled={awarding}
                    onClick={() => handleAward('chill', -5, 'Undo')}
                    className="rounded-xl bg-[#14141E] hover:bg-[#1E1E28] border border-[#272738] text-[#A1A1AA] hover:text-[#E50914] font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                    style={{ height: '44px' }}
                  >
                    <RotateCcw size={13} /> −5
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-[#0E0E14] border border-[#222230] rounded-2xl text-center text-[#71717A] text-sm flex items-center justify-center" style={{ padding: '48px 24px', minHeight: '300px' }}>
              <div>
                <Search size={32} className="mx-auto text-[#333346]" style={{ marginBottom: '12px' }} />
                <p className="font-semibold text-white" style={{ marginBottom: '4px' }}>No Contestant Selected</p>
                <p className="text-xs text-[#71717A]">Search and select a contestant to start awarding points</p>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default ScorerDashboard;
