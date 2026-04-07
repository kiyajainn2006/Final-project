import { Clock, PlayCircle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const PHASES = ['Opening', 'Examination', 'Cross', 'Closing', 'Verdict'];

export default function PhaseTimeline({ currentPhase, isJudge, stompClient, roomId }) {
  const { user } = useAuthStore();
  const currentIndex = PHASES.indexOf(currentPhase);

  const syncPhaseUpdate = (newPhase) => {
    if (stompClient?.connected && isJudge) {
      const msg = {
        content: newPhase,
        sender: user?.username || 'SYSTEM',
        role: 'ROLE_JUDGE',
        type: 'PHASE',
        roomId: roomId
      };
      stompClient.publish({
        destination: `/app/chat/${roomId}`,
        body: JSON.stringify(msg)
      });
    }
  };

  const syncEndTrial = () => {
    if (stompClient?.connected && isJudge) {
      stompClient.publish({
        destination: `/app/chat/${roomId}`,
        body: JSON.stringify({
          content: 'The Judge has concluded the trial.',
          sender: user?.username || 'SYSTEM',
          role: 'ROLE_JUDGE',
          type: 'END_TRIAL',
          roomId: roomId
        })
      });
    }
  };

  return (
    <div className="bg-brand-surface/80 border-2 border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center space-x-3 mb-6 border-b border-white/10 pb-4">
        <Clock className="w-6 h-6 text-primary" />
        <h3 className="font-extrabold text-lg text-white tracking-widest uppercase">Trial Phases</h3>
      </div>
      
      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px before:h-full before:w-1 before:bg-gradient-to-b before:from-primary before:via-white/20 before:to-transparent">
        {PHASES.map((phase, idx) => {
          const isActive = phase === currentPhase;
          const isPast = idx < currentIndex;
          
          return (
            <div key={phase} className="relative flex items-center group">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 transition-all z-10 
                ${isActive ? 'bg-primary border-primary shadow-[0_0_20px_rgba(168,85,247,0.8)]' : isPast ? 'bg-brand-surface border-primary text-primary' : 'bg-brand-surface border-gray-700 text-gray-500'}
              `}>
                {isActive ? (
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                ) : (
                  <span className="text-sm font-bold">{idx + 1}</span>
                )}
              </div>
              <div className="ml-6 flex-1 bg-black/20 p-4 rounded-xl border border-white/5 group-hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className={`text-lg font-bold tracking-wide ${isActive ? 'text-white' : isPast ? 'text-gray-300' : 'text-gray-600'}`}>
                    {phase}
                  </div>
                  {isJudge && !isActive && !isPast && (
                    <button 
                      onClick={() => syncPhaseUpdate(phase)}
                      className="flex items-center space-x-1 text-xs font-bold text-primary hover:text-white bg-primary/10 hover:bg-primary px-3 py-1.5 rounded-lg border border-primary/30 transition-all cursor-pointer shadow-sm"
                    >
                      <span>Proceed</span>
                      <PlayCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {isActive && (
                  <p className="text-sm text-primary mt-2 font-medium">Currently active phase.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* End Trial Button for Judge */}
      {isJudge && currentPhase === 'Verdict' && (
        <div className="mt-8 pt-6 border-t border-white/10 animate-fade-in-up">
          <button 
            onClick={syncEndTrial}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all transform hover:-translate-y-1"
          >
            <span>Conclude Trial & Dismiss</span>
          </button>
        </div>
      )}
    </div>
  );
}
