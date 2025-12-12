import React, { useEffect, useRef } from 'react';
import { useLiveSession } from '../hooks/useLiveSession';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface LiveConversationProps {
  profile: UserProfile;
}

const LiveConversation: React.FC<LiveConversationProps> = ({ profile }) => {
  const { isConnected, isSpeaking, volume, connect, disconnect, error } = useLiveSession({
    systemInstruction: `You are a friendly English conversation partner for a ${profile.age}-year-old ${profile.role}. Keep sentences short and encourage them to speak. Gently correct major grammar mistakes.`
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isConnected || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId: number;

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 40;
      // Animate radius based on volume
      const radius = baseRadius + (volume * 80);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = isSpeaking ? '#818cf8' : '#6366f1'; // Lighter if speaking
      ctx.globalAlpha = 0.6;
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#4f46e5';
      ctx.globalAlpha = 1;
      ctx.fill();

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [isConnected, volume, isSpeaking]);

  return (
    <div className="h-full bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-white relative overflow-hidden shadow-inner">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-500 rounded-full blur-3xl"></div>
         <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <h2 className="text-2xl font-bold mb-8 z-10">Conversation Practice</h2>

      <div className="relative w-64 h-64 flex items-center justify-center mb-12">
        {isConnected ? (
          <canvas ref={canvasRef} width={300} height={300} className="absolute inset-0 w-full h-full" />
        ) : (
           <div className="w-40 h-40 rounded-full bg-slate-700 flex items-center justify-center shadow-2xl border-4 border-slate-600">
             <MicOff size={48} className="text-slate-400" />
           </div>
        )}
        <div className="z-10 text-center pointer-events-none">
           {isConnected && (
             <span className="text-sm font-medium tracking-wider uppercase animate-pulse">
               {isSpeaking ? "AI Speaking..." : "Listening..."}
             </span>
           )}
        </div>
      </div>

      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-500/90 text-white p-3 rounded-xl flex items-center text-sm">
          <AlertCircle size={16} className="mr-2" />
          {error}
        </div>
      )}

      <button
        onClick={isConnected ? disconnect : connect}
        className={`z-10 px-8 py-4 rounded-full font-bold text-lg flex items-center transition-all transform hover:scale-105 shadow-xl ${
          isConnected 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-indigo-500 hover:bg-indigo-600'
        }`}
      >
        {isConnected ? (
          <>
            <MicOff className="mr-2" /> End Session
          </>
        ) : (
          <>
            <Mic className="mr-2" /> Start Talking
          </>
        )}
      </button>

      <p className="mt-6 text-slate-400 text-sm max-w-xs text-center z-10">
        {isConnected 
          ? "Speak naturally. The AI is listening to correct your grammar." 
          : "Connect to start a real-time voice conversation."}
      </p>
    </div>
  );
};

export default LiveConversation;
