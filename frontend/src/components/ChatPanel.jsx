import { useState, useEffect, useRef } from 'react';
import useAuthStore from '../store/useAuthStore';
import { Send, Hash, Lock } from 'lucide-react';

export default function ChatPanel({ messages, stompClient, roomId, currentPhase }) {
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const canSpeak = (() => {
    if (!currentPhase) return true;
    const role = user?.role || 'ROLE_OBSERVER';
    if (role === 'ROLE_JUDGE' && currentPhase !== 'Verdict') return true;

    switch(currentPhase) {
      case 'Opening':
      case 'Closing':
        return role === 'ROLE_PROSECUTOR' || role === 'ROLE_DEFENSE';
      case 'Examination':
        return role === 'ROLE_PROSECUTOR' || role === 'ROLE_WITNESS';
      case 'Cross':
        return role === 'ROLE_DEFENSE' || role === 'ROLE_WITNESS';
      case 'Verdict':
        return false;
      default:
        return false;
    }
  })();

  const sendMessage = (e) => {
    e.preventDefault();
    if (!stompClient?.connected) {
      alert("Real-time connection is establishing or backend is offline. Please wait or check your server!");
      return;
    }
    
    if (input.trim() && canSpeak) {
      const msg = {
        content: input,
        sender: user?.username || 'Guest',
        role: user?.role || 'ROLE_OBSERVER',
        type: 'CHAT',
        roomId: roomId
      };
      stompClient.publish({
        destination: `/app/chat/${roomId}`,
        body: JSON.stringify(msg)
      });
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="p-6 border-b border-white/20 bg-black/30 backdrop-blur-md">
        <div className="flex items-center space-x-3 mb-1">
          <Hash className="w-5 h-5 text-primary" />
          <h3 className="font-extrabold text-xl text-white tracking-wide">Court Record</h3>
        </div>
        <p className="text-sm font-semibold text-brand-text-muted">Live Official Transcript</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/10">
        {messages.map((msg, idx) => {
          const isMe = msg.sender === user?.username;
          return (
            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center space-x-2 mb-1.5 px-1">
                <span className="text-xs font-bold text-gray-300">{msg.sender}</span>
                <span className="text-[10px] font-bold tracking-wider uppercase text-primary bg-primary/20 px-2 py-0.5 rounded-sm">
                  {msg.role?.replace('ROLE_', '')}
                </span>
              </div>
              <div className={`px-5 py-3.5 rounded-2xl max-w-[85%] text-base shadow-lg ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-brand-surface border border-white/20 text-white rounded-tl-none'}`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-white/20 bg-black/30 backdrop-blur-md">
        <form onSubmit={sendMessage} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!canSpeak}
            placeholder={canSpeak ? "State your argument..." : "You do not have the floor..."}
            className={`w-full border-2 rounded-xl pl-5 pr-14 py-4 text-base font-medium shadow-inner transition-colors focus:outline-none ${!canSpeak ? 'bg-black/40 border-red-500/30 text-gray-500 placeholder-red-400/50 cursor-not-allowed' : 'bg-brand-surface border-brand-border text-white focus:border-primary placeholder-brand-text-muted'}`}
          />
          {!canSpeak ? (
             <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-red-500/50">
               <Lock className="w-5 h-5" />
             </div>
          ) : (
            <button 
              type="submit" 
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-primary hover:bg-primary-hover rounded-lg text-white transition-all hover:scale-105 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
