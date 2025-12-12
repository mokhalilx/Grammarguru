import React, { useState } from 'react';
import Onboarding from './components/Onboarding';
import GrammarTutor from './components/GrammarTutor';
import LiveConversation from './components/LiveConversation';
import { UserProfile } from './types';
import { MessageSquare, Mic, Menu } from 'lucide-react';

enum AppMode {
  TUTOR = 'TUTOR',
  LIVE = 'LIVE',
}

function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mode, setMode] = useState<AppMode>(AppMode.TUTOR);
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile responsiveness

  if (!profile) {
    return <Onboarding onComplete={setProfile} />;
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Sidebar Navigation - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-indigo-600">
             <span className="text-2xl">🎓</span>
             <span className="font-bold text-xl tracking-tight">GrammarGuru</span>
          </div>
          <div className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {profile.role} • Age {profile.age}
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setMode(AppMode.TUTOR)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
              mode === AppMode.TUTOR 
                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MessageSquare size={20} />
            <span>Grammar Chat</span>
          </button>
          
          <button
            onClick={() => setMode(AppMode.LIVE)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
              mode === AppMode.LIVE 
                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Mic size={20} />
            <span>Voice Practice</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 text-center">
          Powered by Gemini 2.5 & 3 Pro
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white z-20 shadow-sm flex items-center justify-between p-4">
         <span className="font-bold text-lg text-indigo-600">GrammarGuru</span>
         <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-600">
           <Menu size={24} />
         </button>
      </div>

      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)}>
           <div className="bg-white w-64 h-full p-4 flex flex-col space-y-2" onClick={e => e.stopPropagation()}>
              <div className="mb-6 font-bold text-xl text-indigo-600 p-2">Menu</div>
              <button
                onClick={() => { setMode(AppMode.TUTOR); setSidebarOpen(false); }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl ${mode === AppMode.TUTOR ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}
              >
                <MessageSquare size={20} /> <span>Grammar Chat</span>
              </button>
              <button
                onClick={() => { setMode(AppMode.LIVE); setSidebarOpen(false); }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl ${mode === AppMode.LIVE ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}
              >
                <Mic size={20} /> <span>Voice Practice</span>
              </button>
           </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 mt-16 md:mt-0 h-full overflow-hidden">
        <div className="h-full max-w-5xl mx-auto">
          {mode === AppMode.TUTOR ? (
            <GrammarTutor profile={profile} />
          ) : (
            <LiveConversation profile={profile} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
