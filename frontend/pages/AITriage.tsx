import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  typing?: boolean;
}

const AITriage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am MedNexus AI Triage. Please describe your symptoms and I will help recommend the right specialist for you.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    // Mock AI response logic
    setTimeout(() => {
      let aiResponse = "Based on your symptoms, I recommend seeing a **General Physician**. They can run initial tests and guide you further.";
      const lower = input.toLowerCase();

      if (lower.includes('accident') || lower.includes('unconscious') || lower.includes('severe') || lower.includes('breath') || lower.includes('stroke') || lower.includes('icu') || lower.includes('emergency') || lower.includes('bleeding')) {
        aiResponse = "These are critical symptoms. Please head directly to **Emergency / ICU** for immediate medical attention.";
      } else if (lower.includes('heart') || lower.includes('chest') || lower.includes('palpitation') || lower.includes('cardiac') || lower.includes('bp') || lower.includes('blood pressure')) {
        aiResponse = "For heart or blood pressure related issues, I strongly recommend booking a token for **Cardiology**. If pain is severe, please use the Emergency redirect immediately.";
      } else if (lower.includes('cancer') || lower.includes('tumor') || lower.includes('oncology')) {
        aiResponse = "For comprehensive cancer care, I recommend booking a consultation with **Oncology**.";
      } else if (lower.includes('bone') || lower.includes('fracture') || lower.includes('back')) {
        aiResponse = "For bone and joint issues, you should book a token for **Orthopedics**.";
      } else if (lower.includes('eye') || lower.includes('vision') || lower.includes('blur')) {
        aiResponse = "I recommend booking a token for **Ophthalmology** for a comprehensive eye checkup.";
      } else if (lower.includes('stomach') || lower.includes('acid') || lower.includes('digestion')) {
        aiResponse = "These symptoms suggest a gastrointestinal issue. Please book a token for **Gastroenterology**.";
      } else if (lower.includes('vomiting') || lower.includes('fever') || lower.includes('cold') || lower.includes('flu') || lower.includes('headache') || lower.includes('general')) {
        aiResponse = "For common symptoms like fever or vomiting, seeing a **General Physician** is the best starting point for recovery.";
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-32 lg:pt-40 px-4 sm:px-12 xl:px-24 pb-24 bg-[#020617] text-white overflow-hidden relative">
      <div className="mesh-gradient opacity-30"></div>
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[30rem] h-[30rem] bg-indigo-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-[1000px] mx-auto relative z-10 flex flex-col h-[70vh] sm:h-[75vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter">AI <span className="text-blue-500">TRIAGE</span></h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Chat-based symptom checker.</p>
          </div>
          <button onClick={() => navigate('/patient/book')} className="px-6 py-2.5 bg-blue-600 hover:bg-white hover:text-black text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-blue-500/30">
             Book Now
          </button>
        </div>

        {/* Chat Window */}
        <div className="flex-1 glass-premium rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden relative">
          
          {/* Chat Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 flex flex-col scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] sm:max-w-[70%] rounded-2xl p-5 relative ${
                    m.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-sm shadow-[0_10px_20px_-10px_rgba(37,99,235,0.6)]' 
                      : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm backdrop-blur-md'
                  }`}>
                  
                  {m.sender === 'ai' && (
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#020617] border border-white/10 flex items-center justify-center text-blue-500">
                      <span className="material-icons-round text-sm">smart_toy</span>
                    </div>
                  )}

                  <p className="text-sm font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<span class="text-white font-black">$1</span>') }}></p>
                  <span className={`text-[9px] font-black uppercase tracking-widest mt-2 block ${m.sender === 'user' ? 'text-blue-200' : 'text-slate-500'}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-5 w-20 flex items-center justify-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 sm:p-6 border-t border-white/10 bg-[#020617]/50 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="I am having a headache and fever..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full py-4 px-6 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-14 h-14 rounded-full bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 text-white flex items-center justify-center hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 active:scale-95 disabled:active:scale-100"
              >
                <span className="material-icons-round">send</span>
              </button>
            </div>
          </div>

        </div>

        <div className="flex justify-center mt-8">
           <button onClick={() => navigate('/patient')} className="px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 hover:scale-105 active:scale-95">
             <span className="material-icons-round text-sm">arrow_back</span>
             Back to Dashboard
           </button>
        </div>

      </div>
    </div>
  );
};

export default AITriage;
