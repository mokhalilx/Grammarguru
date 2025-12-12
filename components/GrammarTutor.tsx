import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { UserProfile, ChatMessage } from '../types';
import { generateGrammarExplanation, generatePronunciation } from '../services/geminiService';
import { ArrowUp, Volume2 } from 'lucide-react';

interface GrammarTutorProps {
  profile: UserProfile;
}

const GrammarTutor: React.FC<GrammarTutorProps> = ({ profile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello! I see you're a ${profile.age}-year-old ${profile.role.toLowerCase()}. Ask me anything about English grammar!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Explanation now includes the image URL automatically if relevant
      const { text, image } = await generateGrammarExplanation(input, profile);
      const modelMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: text,
        image: image
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I had trouble thinking of an answer. Please try again!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePronounce = async (text: string) => {
    try {
      // Just read the first sentence or reasonable chunk to avoid long TTS waits
      const textToRead = text.split(/[.!?]/)[0].substring(0, 100); 
      const audioBuffer = await generatePronunciation(textToRead);
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = ctx.createBufferSource();
      source.buffer = await ctx.decodeAudioData(audioBuffer);
      source.connect(ctx.destination);
      source.start(0);
    } catch (error) {
      console.error("TTS Error", error);
    }
  };

  const isRtl = (text: string) => {
    // Basic check for Arabic characters
    return /[\u0600-\u06FF]/.test(text);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-white p-4 border-b border-slate-100 flex justify-between items-center z-10">
        <h2 className="font-semibold text-slate-800">Grammar Chat</h2>
        <div className="text-sm text-slate-500">
           AI Auto-Visualization Active
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {messages.map((msg) => {
           const dir = isRtl(msg.text) ? 'rtl' : 'ltr';
           return (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                dir={dir}
                className={`max-w-[85%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}
              >
                <div className={`prose prose-sm max-w-none break-words ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                  <Markdown
                    components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 mb-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 mb-2" {...props} />,
                        li: ({node, ...props}) => <li className="mb-0.5" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-1" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                        code: ({node, ...props}) => <code className="bg-black/10 rounded px-1 py-0.5 font-mono text-xs" {...props} />,
                    }}
                  >
                    {msg.text}
                  </Markdown>
                </div>
                
                {/* Media Attachments - Automatically displayed if present */}
                {msg.image && (
                  <div className="mt-3 relative group">
                    <img src={msg.image} alt="Visual Aid" className="rounded-xl max-w-full h-auto shadow-md" />
                  </div>
                )}

                {/* Action Buttons for Model Messages */}
                {msg.role === 'model' && (
                  <div className={`mt-3 flex gap-2 border-t border-black/5 pt-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <button 
                      onClick={() => handlePronounce(msg.text)}
                      className="flex items-center text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors bg-white/50 px-2 py-1 rounded"
                    >
                      <Volume2 size={14} className={dir === 'rtl' ? 'ml-1' : 'mr-1'} /> 
                      {dir === 'rtl' ? 'قراءة' : 'Read'}
                    </button>
                    {/* Visual Aid is now automatic, button removed */}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-tl-none p-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-center bg-slate-50 rounded-full border border-slate-200 px-2 py-2 focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about verbs, tenses, etc..."
            className="flex-1 bg-transparent border-none outline-none px-4 text-slate-700 placeholder-slate-400"
            dir="auto"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md"
          >
            <ArrowUp size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrammarTutor;
