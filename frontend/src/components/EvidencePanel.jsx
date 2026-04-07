import { useState } from 'react';
import { Paperclip, FileText, UploadCloud } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

export default function EvidencePanel({ evidenceList, stompClient, roomId }) {
  const { user } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);

  const simulateUpload = () => {
    if (!stompClient?.connected) return;
    setIsUploading(true);
    
    // Simulate short network delay for upload
    setTimeout(() => {
      const newEv = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Exhibit-${Math.floor(Math.random() * 1000)}.pdf`,
        submitter: user?.role?.replace('ROLE_', '') || 'Observer'
      };

      const msg = {
        content: JSON.stringify(newEv),
        sender: user?.username || 'SYSTEM',
        role: user?.role || 'ROLE_OBSERVER',
        type: 'EVIDENCE',
        roomId: roomId
      };

      stompClient.publish({
        destination: `/app/chat/${roomId}`,
        body: JSON.stringify(msg)
      });
      setIsUploading(false);
    }, 600);
  };

  return (
    <div className="bg-brand-surface/80 border-2 border-white/10 rounded-2xl p-6 flex flex-col h-80 shadow-xl backdrop-blur-md">
      <div className="flex items-center space-x-3 mb-6 border-b border-white/10 pb-4">
        <Paperclip className="w-6 h-6 text-blue-500" />
        <h3 className="font-extrabold text-lg text-white tracking-widest uppercase">Evidence Locker</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {evidenceList.length === 0 && (
          <p className="text-brand-text-muted text-sm text-center mt-10">No evidence submitted yet.</p>
        )}
        {evidenceList.map((item) => (
          <div key={item.id} className="flex flex-col p-3.5 rounded-xl bg-black/40 border-l-4 border-blue-500 hover:bg-white/10 transition-colors cursor-pointer group shadow-md shadow-black/20 animate-fade-in-up">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors shrink-0 mt-0.5" />
              <div className="truncate">
                <p className="text-base font-semibold text-gray-100 truncate">{item.name}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs font-medium text-gray-500 uppercase">Submitted By:</span>
                  <span className="text-xs font-bold tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                    {item.submitter}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={simulateUpload}
        disabled={isUploading}
        className="mt-5 w-full border-2 border-dashed border-white/20 hover:border-blue-500 text-gray-300 hover:text-white font-bold text-sm py-4 rounded-xl transition-all shadow-inner bg-black/20 hover:bg-blue-500/10 flex items-center justify-center space-x-2 group disabled:opacity-50"
      >
        <UploadCloud className={`w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors ${isUploading ? 'animate-bounce' : ''}`} />
        <span>{isUploading ? 'Uploading...' : 'Submit Document'}</span>
      </button>
    </div>
  );
}
