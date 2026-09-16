import { useState, useEffect } from 'react';
import { getEventStatus, updateEventStatus, resetEvent } from '../../services/eventService';
import { EVENT_STATUSES } from '../../utils/constants';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, Play, Pause, Square, RotateCcw, AlertTriangle } from 'lucide-react';

const Settings = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);
  const { socket } = useSocket();

  useEffect(() => { fetchEvent(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('event:statusChanged', (data) => {
      setEvent(prev => prev ? { ...prev, status: data.status } : prev);
    });
    return () => { socket.off('event:statusChanged'); };
  }, [socket]);

  const fetchEvent = async () => {
    try {
      const res = await getEventStatus();
      setEvent(res.data);
    } catch (err) {
      toast.error('Failed to load event status');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await updateEventStatus(status);
      setEvent(prev => ({ ...prev, status }));
      toast.success(`Event ${status}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleReset = async () => {
    try {
      await resetEvent();
      setEvent(prev => ({ ...prev, status: 'waiting' }));
      setConfirmAction(null);
      toast.success('Event reset successfully');
    } catch (err) {
      toast.error('Failed to reset event');
    }
  };

  if (loading) return <LoadingSpinner text="Loading settings..." />;

  const status = event?.status || 'waiting';
  const statusConfig = EVENT_STATUSES[status];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', paddingBottom: '40px' }} className="animate-fade-in">
      {/* Top Header with clean border */}
      <div style={{ paddingBottom: '20px', borderBottom: '1px solid #222230', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#E50914] uppercase">
              TOURNAMENT CONTROLLER
            </span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
            <span>EVENT CONTROLS &amp; SETTINGS</span>
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Manage global competition state, broadcast status, and session resets
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#71717A] uppercase">Active Mode:</span>
          <div className={`px-4 py-2 rounded-full ${statusConfig.bg} ${statusConfig.color} text-xs font-bold border border-current/20 flex items-center gap-2 shadow-lg`}>
            {status === 'running' && <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />}
            {status === 'running' && <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />}
            {status === 'paused' && <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />}
            {status === 'ended' && <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />}
            {status === 'waiting' && <span className="w-2.5 h-2.5 rounded-full bg-[#71717A]" />}
            {statusConfig.label}
          </div>
        </div>
      </div>

      {/* Action Controls Card with non-colliding borders */}
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
        <div style={{ paddingBottom: '16px', borderBottom: '1px solid #1C1C28' }}>
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <SettingsIcon size={16} className="text-[#E50914]" />
            Broadcast State Actions
          </h2>
          <p className="text-xs text-[#71717A] mt-1">
            Controls what participants and stage screens display in real-time
          </p>
        </div>

        {/* 4 Distinct Action Cards with ample gap */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {/* Start Event */}
          <button
            type="button"
            onClick={() => handleStatusChange('running')}
            disabled={status === 'running'}
            className={`p-6 rounded-2xl border flex flex-col items-start justify-between gap-5 transition-all text-left cursor-pointer ${
              status === 'running'
                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
                : 'bg-[#14141E] border-[#272738] hover:border-emerald-500/50 hover:bg-emerald-950/20 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Play size={22} className="fill-current" />
              </div>
              {status === 'running' && (
                <span className="px-3 py-1 text-[10px] font-black uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                  Active
                </span>
              )}
            </div>
            <div>
              <span className="text-base font-black uppercase tracking-wider block text-white">
                Start Event
              </span>
              <span className="text-xs text-[#A1A1AA] mt-1.5 block leading-relaxed">
                Broadcast live questions &amp; leaderboards
              </span>
            </div>
          </button>

          {/* Pause Event */}
          <button
            type="button"
            onClick={() => handleStatusChange('paused')}
            disabled={status !== 'running'}
            className={`p-6 rounded-2xl border flex flex-col items-start justify-between gap-5 transition-all text-left cursor-pointer ${
              status === 'paused'
                ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
                : 'bg-[#14141E] border-[#272738] hover:border-amber-500/50 hover:bg-amber-950/20 text-white'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Pause size={22} />
              </div>
              {status === 'paused' && (
                <span className="px-3 py-1 text-[10px] font-black uppercase rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                  Paused
                </span>
              )}
            </div>
            <div>
              <span className="text-base font-black uppercase tracking-wider block text-white">
                Pause Event
              </span>
              <span className="text-xs text-[#A1A1AA] mt-1.5 block leading-relaxed">
                Freeze stage for breaks or instructions
              </span>
            </div>
          </button>

          {/* End Event */}
          <button
            type="button"
            onClick={() => setConfirmAction('end')}
            disabled={status === 'ended' || status === 'waiting'}
            className={`p-6 rounded-2xl border flex flex-col items-start justify-between gap-5 transition-all text-left cursor-pointer ${
              status === 'ended'
                ? 'bg-red-950/40 border-red-500/60 text-red-300 shadow-[0_0_25px_rgba(239,68,68,0.25)]'
                : 'bg-[#14141E] border-[#272738] hover:border-[#E50914] hover:bg-red-950/20 text-white'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-11 h-11 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-[#E50914]">
                <Square size={20} />
              </div>
              {status === 'ended' && (
                <span className="px-3 py-1 text-[10px] font-black uppercase rounded-full bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm">
                  Ended
                </span>
              )}
            </div>
            <div>
              <span className="text-base font-black uppercase tracking-wider block text-white">
                End Event
              </span>
              <span className="text-xs text-[#A1A1AA] mt-1.5 block leading-relaxed">
                Finalize scores and lock podium
              </span>
            </div>
          </button>

          {/* Reset Event */}
          <button
            type="button"
            onClick={() => setConfirmAction('reset')}
            className="p-6 rounded-2xl border bg-[#14141E] border-[#272738] hover:border-purple-500/50 hover:bg-purple-950/20 flex flex-col items-start justify-between gap-5 transition-all text-left cursor-pointer text-white"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <RotateCcw size={20} />
              </div>
              <span className="px-3 py-1 text-[10px] font-mono text-[#71717A] uppercase rounded-full bg-black/40 border border-white/5">
                Danger
              </span>
            </div>
            <div>
              <span className="text-base font-black uppercase tracking-wider block text-white">
                Reset Event
              </span>
              <span className="text-xs text-[#A1A1AA] mt-1.5 block leading-relaxed">
                Reset scores to 0 &amp; unlock all 50 questions
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Control Guide & Safety Notes Grid */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #1C1C28' }}>
          <div className="w-9 h-9 rounded-xl bg-[#E50914]/15 border border-[#E50914]/35 flex items-center justify-center text-[#E50914]">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Event State Guidance &amp; Operations
            </h3>
            <p className="text-xs text-[#71717A] mt-0.5">
              Standard operating procedures during live tournament execution
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#14141E', border: '1px solid #222232', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0" />
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wide block">
                1. Start Event
              </span>
              <p className="text-xs text-[#A1A1AA] mt-1.5 leading-relaxed">
                Broadcasts the live state. All participant screens and stage projector receive real-time question selections and instant scoreboard rank transitions.
              </p>
            </div>
          </div>

          <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#14141E', border: '1px solid #222232', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div className="w-3 h-3 rounded-full bg-amber-500 mt-1 shrink-0" />
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wide block">
                2. Pause Event
              </span>
              <p className="text-xs text-[#A1A1AA] mt-1.5 leading-relaxed">
                Freezes the current projector view with a paused banner. Great for breaks, audience announcements, or resolving scoring disputes without revealing questions.
              </p>
            </div>
          </div>

          <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#14141E', border: '1px solid #222232', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div className="w-3 h-3 rounded-full bg-red-500 mt-1 shrink-0" />
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wide block">
                3. End Event
              </span>
              <p className="text-xs text-[#A1A1AA] mt-1.5 leading-relaxed">
                Concludes the round, freezes all cumulative points, and switches projector to the final winner celebration podium.
              </p>
            </div>
          </div>

          <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#14141E', border: '1px solid #222232', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div className="w-3 h-3 rounded-full bg-purple-500 mt-1 shrink-0" />
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wide block">
                4. Reset Event
              </span>
              <p className="text-xs text-[#A1A1AA] mt-1.5 leading-relaxed">
                Safely clears all scores back to 0 and restores all 50 questions to available status. Registered contestants and their roll numbers are preserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm End */}
      <ConfirmDialog
        isOpen={confirmAction === 'end'}
        title="End Event"
        message="This will conclude the competition session and freeze final standings for all participants. You can still inspect scores afterwards."
        confirmText="End Event"
        onConfirm={() => { handleStatusChange('ended'); setConfirmAction(null); }}
        onCancel={() => setConfirmAction(null)}
        danger
      />

      {/* Confirm Reset */}
      <ConfirmDialog
        isOpen={confirmAction === 'reset'}
        title="Reset Event"
        message="This will reset ALL scores to 0, mark all 50 questions as available, and reset the status to waiting. Registered participants will not be deleted."
        confirmText="Reset Everything"
        onConfirm={handleReset}
        onCancel={() => setConfirmAction(null)}
        danger
      />
    </div>
  );
};

export default Settings;
