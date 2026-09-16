import { useAuth } from '../context/AuthContext';

const LeaderboardTable = ({ leaderboard = [], compact = false }) => {
  const { user } = useAuth();

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-10 text-[#A1A1A1]">
        <p className="text-sm font-semibold text-white">No scores recorded yet</p>
        <p className="text-xs text-[#71717A] mt-1 font-mono">Standings will update automatically once points are credited.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Compact / Participant View */}
      {compact ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {leaderboard.map((entry, i) => {
            const isCurrentUser = user?.id === entry.participantId;
            const isTop3 = entry.rank <= 3;
            const rankMedal = entry.rank === 1 ? '🥇 #1' : entry.rank === 2 ? '🥈 #2' : entry.rank === 3 ? '🥉 #3' : `#${entry.rank}`;

            return (
              <div
                key={entry.participantId || i}
                className={`rounded-xl border transition-all flex items-center justify-between ${
                  isCurrentUser
                    ? 'bg-[#E50914]/15 border-[#E50914]/60 shadow-[0_0_15px_rgba(229,9,20,0.25)] ring-1 ring-[#E50914]/40'
                    : 'bg-[#101016] border-[#1E1E2A] hover:border-[#2E2E3E]'
                }`}
                style={{ padding: '14px 16px' }}
              >
                <div className="flex items-center min-w-0" style={{ gap: '14px' }}>
                  <span className={`font-mono text-xs font-black shrink-0 ${
                    isTop3 ? 'text-white' : 'text-[#8E8E93]'
                  }`} style={{ width: '48px' }}>
                    {rankMedal}
                  </span>
                  <div className="truncate">
                    <p className="text-sm font-bold truncate text-white flex items-center gap-2">
                      {entry.name}
                      {isCurrentUser && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E50914] text-white tracking-wider">
                          YOU
                        </span>
                      )}
                    </p>
                    <p className="text-xs font-mono text-[#71717A]" style={{ marginTop: '3px' }}>{entry.rollNumber}</p>
                  </div>
                </div>

                <div className="text-right shrink-0" style={{ marginLeft: '12px' }}>
                  <span className="text-base font-black font-mono text-[#E50914]">
                    {entry.totalScore}
                  </span>
                  <span className="text-[10px] text-[#A1A1AA] ml-1 uppercase font-mono">pts</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Full Desktop Table Layout */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#242434] text-[11px] font-bold text-[#A1A1A1] uppercase tracking-wider bg-[#101018]">
                <th className="py-3.5 px-4 w-20 text-center">Rank</th>
                <th className="py-3.5 px-4">Participant</th>
                <th className="py-3.5 px-4 hidden sm:table-cell">Roll Number</th>
                <th className="py-3.5 px-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C28] text-sm">
              {leaderboard.map((entry, i) => {
                const isCurrentUser = user?.id === entry.participantId;
                return (
                  <tr
                    key={entry.participantId || i}
                    className={`transition-colors ${
                      isCurrentUser
                        ? 'bg-[#E50914]/15 border-l-4 border-l-[#E50914]'
                        : 'hover:bg-[#12121A]'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      <span className={entry.rank === 1 ? 'text-[#E50914]' : 'text-[#A1A1A1]'}>
                        #{entry.rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      <span className="flex items-center gap-2">
                        {entry.name}
                        {isCurrentUser && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#E50914] text-white">
                            You
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#8E8E93] hidden sm:table-cell text-xs">
                      {entry.rollNumber}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-white text-base">
                      {entry.totalScore}
                      <span className="text-[10px] text-[#A1A1A1] font-normal ml-1">pts</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaderboardTable;
