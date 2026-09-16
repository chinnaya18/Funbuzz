import { useState } from 'react';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { DIFFICULTIES } from '../../utils/constants';
import { getRankEmoji, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Trophy, Search } from 'lucide-react';

const AdminLeaderboard = () => {
  const { leaderboard, loading } = useLeaderboard();
  const [search, setSearch] = useState('');

  if (loading) return <LoadingSpinner text="Loading leaderboard..." />;

  const filtered = search
    ? leaderboard.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.rollNumber.toLowerCase().includes(search.toLowerCase())
      )
    : leaderboard;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', paddingBottom: '40px' }} className="animate-fade-in">
      {/* Top Header with clean border */}
      <div style={{ paddingBottom: '20px', borderBottom: '1px solid #222230', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#E50914] uppercase">
              LIVE RANKINGS
            </span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
            <span>TOURNAMENT LEADERBOARD</span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#13131A] text-[#A1A1AA] border border-[#272736]">
              {leaderboard.length} Standing
            </span>
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1">Live standings and score breakdowns across all difficulty tiers</p>
        </div>
      </div>

      {/* Search Bar Card */}
      <div
        style={{
          backgroundColor: '#0E0E16',
          border: '1px solid #222232',
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}
      >
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none" size={17} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name or roll number..."
            style={{ paddingLeft: '2.6rem' }}
            className="input-primary"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            backgroundColor: '#0E0E16',
            border: '1px solid #222232',
            borderRadius: '18px',
            padding: '48px 24px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.45)'
          }}
        >
          <EmptyState icon={Trophy} title="No scores yet" message="Update participant scores to see the leaderboard" />
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#0E0E16',
            border: '1px solid #222232',
            borderRadius: '18px',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(0,0,0,0.45)'
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#14141E', borderBottom: '1px solid #222232' }}>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider hidden md:table-cell">Roll No</th>
                  {DIFFICULTIES.map(d => (
                    <th key={d.key} className="px-3 py-3 text-center text-xs font-semibold text-[#A1A1A1] uppercase hidden lg:table-cell">
                      <span>{d.label}</span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#A1A1A1] uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#A1A1A1] uppercase tracking-wider hidden xl:table-cell">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292929]">
                {filtered.map((entry) => (
                  <tr key={entry.participantId} className="hover:bg-[#161616] transition-colors">
                    <td className="px-4 py-3.5">
                      <span className={`text-sm font-bold ${entry.rank === 1 ? 'text-[#E50914]' : entry.rank <= 3 ? 'text-white' : 'text-[#A1A1A1]'}`}>
                        {getRankEmoji(entry.rank)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-white">{entry.name}</td>
                    <td className="px-4 py-3.5 text-xs text-[#A1A1A1] font-mono hidden md:table-cell">{entry.rollNumber}</td>
                    {DIFFICULTIES.map(d => (
                      <td key={d.key} className="px-3 py-3.5 text-center text-sm font-mono text-[#A1A1A1] hidden lg:table-cell">
                        {entry.scores?.[d.key] || 0}
                      </td>
                    ))}
                    <td className="px-4 py-3.5 text-right">
                      <span className={`text-base font-black font-mono ${
                        entry.rank === 1 ? 'text-[#E50914]' : 'text-white'
                      }`}>
                        {entry.totalScore}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs text-[#A1A1A1] font-mono hidden xl:table-cell">
                      {formatDate(entry.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaderboard;
