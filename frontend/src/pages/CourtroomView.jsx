import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import ChatPanel from '../components/ChatPanel';
import PhaseTimeline from '../components/PhaseTimeline';
import EvidencePanel from '../components/EvidencePanel';
import VerdictModal from '../components/VerdictModal';
import useAuthStore from '../store/useAuthStore';
import { Users, Gavel } from 'lucide-react';

export default function CourtroomView() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState('Opening');
  const [chatMessages, setChatMessages] = useState([]);
  const [evidenceList, setEvidenceList] = useState([]);
  const [trialEnded, setTrialEnded] = useState(false);
  
  const [lastSpeakerRole, setLastSpeakerRole] = useState(null);
  const speakerTimeout = useRef(null);

  const [stompClient, setStompClient] = useState(null);
  const roomId = 'ROOM-1';

  useEffect(() => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/room/${roomId}`, (message) => {
        const payload = JSON.parse(message.body);
        
        if (payload.type === 'CHAT') {
          setChatMessages((prev) => [...prev, payload]);
          
          // Track Active Speaker automatically
          setLastSpeakerRole(payload.role);
          clearTimeout(speakerTimeout.current);
          speakerTimeout.current = setTimeout(() => {
            setLastSpeakerRole(null);
          }, 4000);
          
        } else if (payload.type === 'PHASE') {
          setCurrentPhase(payload.content);
        } else if (payload.type === 'EVIDENCE') {
          setEvidenceList((prev) => [...prev, JSON.parse(payload.content)]);
        } else if (payload.type === 'END_TRIAL') {
          setTrialEnded(true);
          setTimeout(() => navigate('/dashboard'), 4000);
        }
      });
    };

    client.activate();
    setStompClient(client);

    return () => {
      if (client.active) {
        client.deactivate();
      }
      clearTimeout(speakerTimeout.current);
    };
  }, [roomId, navigate]);

  const determineName = (targetRole, fallback) => {
    if (user?.role === targetRole) return user.username;
    return fallback;
  };

  return (
    <div className="flex h-screen bg-brand-bg text-brand-text overflow-hidden">
      {/* Left Sidebar - Phases & Evidence */}
      <div className="w-[30%] max-w-[400px] border-r border-white/20 flex flex-col bg-brand-surface z-10 shadow-2xl relative">
        <div className="p-6 border-b border-white/20 flex items-center justify-between bg-black/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Gavel className="text-primary w-6 h-6" />
            </div>
            <h2 className="font-extrabold text-xl tracking-wider text-white">{roomId}</h2>
          </div>
          <div className="text-sm font-bold text-white bg-primary px-3 py-1.5 rounded-md shadow-md uppercase tracking-wider">
            {user?.role?.replace('ROLE_', '')}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <PhaseTimeline 
            currentPhase={currentPhase} 
            isJudge={user?.role === 'ROLE_JUDGE'} 
            stompClient={stompClient}
            roomId={roomId}
          />
          <EvidencePanel 
            evidenceList={evidenceList}
            stompClient={stompClient}
            roomId={roomId}
          />
        </div>
      </div>

      {/* Center - Main Stage */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-brand-bg">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none"></div>
        
        <div className="p-5 border-b border-white/20 flex justify-between items-center z-10 bg-brand-surface/80 backdrop-blur-md">
          <h1 className="text-2xl font-extrabold text-white tracking-widest pl-4">MAIN STAGE</h1>
          <div className="flex items-center space-x-2 text-white bg-white/10 px-4 py-2 rounded-lg border border-white/20 font-semibold">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Active Trial</span>
          </div>
        </div>

        {/* Verdict Feature */}
        <VerdictModal 
          currentPhase={currentPhase} 
          stompClient={stompClient} 
          roomId={roomId} 
        />

        {/* 4-Person Grid */}
        <div className="flex-1 p-8 grid grid-cols-2 gap-6 items-center justify-center auto-rows-min relative z-10 content-center">
          <ParticipantCard 
            name={determineName('ROLE_JUDGE', 'Hon. Judge')} 
            role="ROLE_JUDGE" 
            active={lastSpeakerRole === 'ROLE_JUDGE'} 
            isPrimary 
          />
          <ParticipantCard 
            name={determineName('ROLE_WITNESS', 'The Witness')} 
            role="ROLE_WITNESS" 
            active={lastSpeakerRole === 'ROLE_WITNESS'} 
          />
          <ParticipantCard 
            name={determineName('ROLE_PROSECUTOR', 'Prosecution')} 
            role="ROLE_PROSECUTOR" 
            active={lastSpeakerRole === 'ROLE_PROSECUTOR'} 
          />
          <ParticipantCard 
            name={determineName('ROLE_DEFENSE', 'Defense Team')} 
            role="ROLE_DEFENSE" 
            active={lastSpeakerRole === 'ROLE_DEFENSE'} 
          />
        </div>
      </div>

      {/* Right Sidebar - Chat */}
      <div className="w-[30%] max-w-[450px] border-l border-white/20 flex flex-col bg-brand-surface z-10 shadow-2xl relative">
        <ChatPanel 
          messages={chatMessages} 
          stompClient={stompClient} 
          roomId={roomId} 
          currentPhase={currentPhase}
        />
      </div>

      {/* Trial Ended Overlay */}
      {trialEnded && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in-up">
          <div className="bg-brand-surface p-12 rounded-3xl border-2 border-red-500 shadow-[0_0_100px_rgba(220,38,38,0.5)] text-center">
            <Gavel className="w-24 h-24 text-red-500 mx-auto mb-6" />
            <h1 className="text-5xl font-extrabold text-white mb-4 tracking-widest uppercase">Court Adjourned</h1>
            <p className="text-xl text-gray-300">The trial has been officially concluded by the Judge.</p>
            <p className="text-md text-red-400 mt-6 font-bold animate-pulse">Redirecting to Dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ParticipantCard({ name, role, active, isPrimary }) {
  const displayRole = role.replace('ROLE_', '');
  
  return (
    <div className={`relative flex flex-col items-center justify-center p-6 h-56 bg-brand-surface/90 border-2 rounded-3xl overflow-hidden transition-all duration-300 group backdrop-blur-sm
      ${active ? 'border-green-400 shadow-[0_0_40px_rgba(74,222,128,0.3)] scale-105 z-20' : isPrimary ? 'border-primary' : 'border-brand-border'}
    `}>
      <div className={`w-24 h-24 rounded-full mb-3 flex items-center justify-center text-3xl font-bold shadow-2xl text-white transition-all duration-300
        ${active ? 'ring-4 ring-green-400 ring-offset-4 ring-offset-brand-surface bg-gradient-to-br from-green-500 to-green-700' : isPrimary ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600'}
      `}>
        {name.charAt(0)}
      </div>
      <span className="text-lg font-bold text-white mb-1 truncate w-full text-center px-2">{name}</span>
      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest ${active ? 'bg-green-500/20 text-green-400' : isPrimary ? 'bg-primary text-white' : 'bg-white/10 text-brand-text-muted mt-1'}`}>
        {displayRole}
      </span>
      {active && (
        <div className="absolute top-4 right-4 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </div>
      )}
    </div>
  );
}
