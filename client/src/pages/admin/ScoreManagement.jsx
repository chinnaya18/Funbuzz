import { useState, useEffect } from 'react';
import { getParticipants } from '../../services/participantService';
import { getParticipantScore, updateScore, getScoreHistory } from '../../services/scoreService';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Search, RotateCcw, Clock, Users, Plus, Minus, Check, Flame } from 'lucide-react';

const CATEGORIES = [
  { key: 'chill', label: 'EASY', defaultPoints: 5, color: '#10B981', bg: 'bg-[#064e3b]', border: 'border-[#059669]', text: 'text-emerald-300' },
  { key: 'blaze', label: 'MEDIUM', defaultPoints: 10, color: '#F59E0B', bg: 'bg-[#78350f]', border: 'border-[#d97706]', text: 'text-amber-300' },
  { key: 'savage', label: 'HARD', defaultPoints: 15, color: '#F97316', bg: 'bg-[#7c2d12]', border: 'border-[#ea580c]', text: 'text-orange-300' },
  { key: 'brutal', label: 'HARDEST', defaultPoints: 20, color: '#EF4444', bg: 'bg-[#7f1d1d]', border: 'border-[#dc2626]', text: 'text-red-300' },
  { key: 'legendary', label: 'SUPREME', defaultPoints: 25, color: '#A855F7', bg: 'bg-[#581c87]', border: 'border-[#9333ea]', text: 'text-purple-300' }
];

const ScoreManagement = () => {
  const [participants, setParticipants] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [scores, setScores] = useState({ chill: 0, blaze: 0, savage: 0, brutal: 0, legendary: 0 });
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      const res = await getParticipants();
      setParticipants(res.data);
      if (res.data.length > 0) {
        handleSelectParticipant(res.data[0]);
      }
    } catch (err) {
      toast.error('Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectParticipant = async (p) => {
    setSelectedParticipant(p);
    try {
      const [scoreRes, histRes] = await Promise.all([
        getParticipantScore(p._id),
        getScoreHistory(p._id)
      ]);
      setScores(scoreRes.data.scores || { chill: 0, blaze: 0, savage: 0, brutal: 0, legendary: 0 });
      setHistory(histRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScoreChange = (diffKey, val) => {
    const num = Math.max(0, parseInt(val) || 0);
    setScores(prev => ({ ...prev, [diffKey]: num }));
  };

  const handleStepScore = (diffKey, delta) => {
    setScores(prev => {
      const current = prev[diffKey] || 0;
      return { ...prev, [diffKey]: Math.max(0, current + delta) };
    });
  };

  const handleSave = async () => {
    if (!selectedParticipant) return;
    setSaving(true);
    try {
      await updateScore(selectedParticipant._id, scores);
      const histRes = await getScoreHistory(selectedParticipant._id);
      setHistory(histRes.data);
      toast.success(`Score updated for ${selectedParticipant.name}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save score');
    } finally {
      setSaving(false);
    }
  };

  const totalScore = Object.values(scores).reduce((sum, val) => sum + (parseInt(val) || 0), 0);

  const filtered = participants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner text="Loading score management..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', paddingBottom: '40px' }} className="animate-fade-in">
      {/* Top Header with clean border */}
      <div style={{ paddingBottom: '20px', borderBottom: '1px solid #222230', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#E50914] uppercase">
              ADMINISTRATION
            </span>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            SCORE MANAGER &amp; EVALUATION
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Select a contestant to inspect, modify, or recalculate category scores
          </p>
        </div>
      </div>

      {/* Dual Column Layout: Participants list + Scoring form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Participant Roster */}
        <div
          className="lg:col-span-5"
          style={{
            backgroundColor: '#0E0E16',
            border: '1px solid #222232',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.45)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid #1C1C28' }}>
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Users size={16} className="text-[#E50914]" />
              Contestants ({participants.length})
            </span>
            <span className="text-[11px] text-[#71717A] font-mono">Click to evaluate</span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contestant..."
              style={{ paddingLeft: '2.6rem' }}
              className="input-primary"
            />
          </div>

          {/* Contestant Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '560px', overflowY: 'auto', paddingRight: '4px' }}>
            {filtered.map(p => {
              const isSelected = selectedParticipant?._id === p._id;
              return (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => handleSelectParticipant(p)}
                  style={{
                    backgroundColor: isSelected ? '#1A1218' : '#14141E',
                    borderColor: isSelected ? '#E50914' : '#232332',
                    boxShadow: isSelected ? '0 0 15px rgba(229,9,20,0.25)' : 'none'
                  }}
                  className="w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between hover:border-[#333348]"
                >
                  <div className="truncate pr-2">
                    <p className="font-bold text-sm text-white truncate">{p.name}</p>
                    <p className="font-mono text-xs text-[#71717A] mt-0.5">{p.rollNumber}</p>
                  </div>
                  <span className={`font-mono text-xs font-bold shrink-0 ${isSelected ? 'text-[#E50914]' : 'text-[#666677]'}`}>
                    {isSelected ? '● Selected' : 'Evaluate →'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Spacious Score Form */}
        {selectedParticipant ? (
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Form Card */}
            <div
              style={{
                backgroundColor: '#0E0E16',
                border: '1px solid #222232',
                borderRadius: '18px',
                padding: '28px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.45)',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}
            >
              
              {/* Selected Participant Header with Clean Spacing */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#1E1E2A]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">
                    Evaluating Contestant
                  </span>
                  <h2 className="text-2xl font-black text-white leading-tight mt-1">
                    {selectedParticipant.name}
                  </h2>
                  <span className="text-xs font-mono text-[#E50914] font-bold mt-0.5 block">
                    Roll: {selectedParticipant.rollNumber}
                  </span>
                </div>
                
                <div className="text-right bg-[#14141E] border border-[#E50914]/40 px-6 py-3 rounded-2xl shadow-[0_0_16px_rgba(229,9,20,0.2)]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] block">
                    Cumulative Points
                  </span>
                  <span className="text-3xl font-mono font-black text-[#E50914] tracking-tight">
                    {totalScore} <span className="text-xs font-sans text-white/60">PTS</span>
                  </span>
                </div>
              </div>

              {/* 5 Difficulty Category Inputs with Steppers & Dark Bold Tones */}
              <div className="flex flex-col gap-3.5">
                {CATEGORIES.map(cat => {
                  const val = scores[cat.key] || 0;
                  return (
                    <div
                      key={cat.key}
                      className="flex items-center justify-between p-4.5 rounded-xl bg-[#12121A] border border-[#222232] hover:border-[#333346] transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase font-mono border ${cat.bg} ${cat.border} ${cat.text} shadow-sm`}
                        >
                          {cat.label}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            +{cat.defaultPoints} Points / Step
                          </span>
                          <span className="text-[10px] font-mono text-[#71717A] mt-0.5 block">
                            Tier weight: {cat.defaultPoints} pts
                          </span>
                        </div>
                      </div>

                      {/* Stepper Controls (- / value / +) */}
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleStepScore(cat.key, -cat.defaultPoints)}
                          className="w-10 h-10 rounded-xl bg-[#181824] hover:bg-[#232332] border border-[#2D2D40] text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
                          title={`Decrease by ${cat.defaultPoints}`}
                        >
                          <Minus size={15} />
                        </button>

                        <input
                          type="number"
                          min="0"
                          value={val}
                          onChange={(e) => handleScoreChange(cat.key, e.target.value)}
                          className="w-20 h-10 rounded-xl bg-[#0A0A0E] border border-[#2E2E42] focus:border-[#E50914] text-center font-mono font-black text-base text-white outline-none transition-all shadow-inner"
                        />

                        <button
                          type="button"
                          onClick={() => handleStepScore(cat.key, cat.defaultPoints)}
                          className="w-10 h-10 rounded-xl bg-[#181824] hover:bg-[#232332] border border-[#2D2D40] text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
                          title={`Increase by ${cat.defaultPoints}`}
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Display Banner with Generous Space */}
              <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-[#1A0A0C] to-[#12121A] border border-[#E50914]/40 shadow-lg mt-2">
                <div className="flex items-center gap-2.5">
                  <Flame size={20} className="text-[#E50914] fill-current" />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-white block">
                      Grand Total Evaluation
                    </span>
                    <span className="text-[10px] text-[#71717A] font-mono block">
                      Recalculated sum of all tiers
                    </span>
                  </div>
                </div>
                <span className="font-mono text-3xl font-black text-[#E50914]">
                  {totalScore} <span className="text-xs font-sans text-white/70">PTS</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => handleSelectParticipant(selectedParticipant)}
                  className="btn-secondary flex-1 py-3.5"
                >
                  <RotateCcw size={15} />
                  <span>Reset Form</span>
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="btn-primary flex-2 py-3.5 text-sm"
                >
                  <Check size={17} className="stroke-[2.5]" />
                  <span>{saving ? 'UPDATING...' : 'UPDATE SCORE'}</span>
                </button>
              </div>
            </div>

            {/* Audit History Log */}
            <div
              style={{
                backgroundColor: '#0E0E16',
                border: '1px solid #222232',
                borderRadius: '18px',
                padding: '24px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.45)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <span className="text-xs font-black uppercase tracking-wider text-[#A1A1AA] block pb-3 border-b border-[#1E1E2A] flex items-center gap-2">
                <Clock size={15} className="text-[#E50914]" />
                Score Audit Trail ({history.length})
              </span>

              {history.length === 0 ? (
                <p className="text-xs text-[#71717A] py-3 text-center font-mono">No previous score changes recorded</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {history.map((h, idx) => (
                    <div key={idx} className="text-xs flex items-center justify-between p-3 rounded-lg bg-[#12121A] border border-[#1E1E28]">
                      <div>
                        <span className="font-bold text-white uppercase text-[11px]">{h.reason || 'Manual Update'}</span>
                        <span className="text-[10px] font-mono text-[#71717A] ml-2">
                          {new Date(h.timestamp || h.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">
                        Total: {h.totalScore ?? h.newScore ?? 0} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div
            className="lg:col-span-7"
            style={{
              backgroundColor: '#0E0E16',
              border: '1px solid #222232',
              borderRadius: '18px',
              padding: '64px 32px',
              textAlign: 'center',
              color: '#71717A',
              boxShadow: '0 8px 30px rgba(0,0,0,0.45)'
            }}
          >
            Select a contestant from the list to begin score evaluation.
          </div>
        )}

      </div>
    </div>
  );
};

export default ScoreManagement;
