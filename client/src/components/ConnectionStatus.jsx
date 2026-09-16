import { useSocket } from '../context/SocketContext';

const ConnectionStatus = () => {
  const { connected } = useSocket();

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold tracking-wider transition-all ${
      connected
        ? 'bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/40'
        : 'bg-[#161616] text-[#A1A1A1] border border-[#292929]'
    }`}>
      <span className={`w-2 h-2 rounded-full ${connected ? 'bg-[#E50914] animate-pulse' : 'bg-[#666666]'}`} />
      <span>{connected ? 'LIVE' : 'CONNECTING'}</span>
    </div>
  );
};

export default ConnectionStatus;
