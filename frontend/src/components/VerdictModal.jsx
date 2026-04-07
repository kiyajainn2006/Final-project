import { Gavel } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

export default function VerdictModal({ currentPhase, stompClient, roomId }) {
  const { user } = useAuthStore();
  const isJudge = user?.role === 'ROLE_JUDGE';

  if (currentPhase !== 'Verdict') return null;

  const broadcastVerdict = (verdict) => {
    if (stompClient?.connected && isJudge) {
      stompClient.publish({
        destination: `/app/chat/${roomId}`,
        body: JSON.stringify({
          content: `VERDICT: ${verdict.toUpperCase()}`,
          sender: user?.username || 'SYSTEM',
          role: 'ROLE_JUDGE',
          type: 'CHAT',
          roomId: roomId
        })
      });
      // Optionally also send the END_TRIAL here if the workflow is immediate, 
      // but it's better to let them read it and use the actual "End Trial" button.
    }
  };

  return (
    <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 z-40 bg-brand-surface/95 backdrop-blur-3xl border-2 border-primary/50 shadow-[0_0_80px_rgba(168,85,247,0.4)] p-12 rounded-3xl animate-fade-in-up">
      <div className="flex flex-col items-center justify-center text-center">
        <Gavel className="w-16 h-16 text-primary mb-4 animate-bounce" />
        <h2 className="text-4xl font-extrabold text-white tracking-widest uppercase mb-2">The Verdict</h2>
        <p className="text-gray-300 text-lg mb-10 max-w-lg">
          {isJudge 
            ? "It is time to render your final decision. The court awaits your judgment."
            : "The trial has concluded. Please silence the court while the Honorable Judge renders the final verdict."}
        </p>

        {isJudge ? (
          <div className="flex space-x-6 w-full justify-center">
            <button 
              onClick={() => broadcastVerdict("Guilty")}
              className="bg-red-600/20 border-2 border-red-500 text-red-500 hover:bg-red-600 hover:text-white px-12 py-5 rounded-2xl text-2xl font-bold tracking-widest uppercase transition-all hover:scale-105 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
            >
              Guilty
            </button>
            <button 
              onClick={() => broadcastVerdict("Not Guilty")}
              className="bg-green-600/20 border-2 border-green-500 text-green-500 hover:bg-green-600 hover:text-white px-12 py-5 rounded-2xl text-2xl font-bold tracking-widest uppercase transition-all hover:scale-105 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
            >
              Not Guilty
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3 text-2xl font-bold text-primary animate-pulse">
            <span>Awaiting Judgment...</span>
          </div>
        )}
      </div>
    </div>
  );
}
