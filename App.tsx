import React, { useState, useRef, useEffect } from 'react';
import { Message, ChatState, Role, AppView, NotebookEntry } from './types';
import { STARTER_PROMPTS } from './constants';
import { sendMessage } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import FieldNotebook from './components/FieldNotebook';
import { 
  Send, 
  Sparkles, 
  Mountain, 
  Image as ImageIcon, 
  RefreshCcw, 
  Compass, 
  ChevronRight,
  Info,
  X,
  MessageSquare,
  Book,
  Menu
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('chat');
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem('molasse_notebook');
    if (saved) {
      try {
        setNotebookEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load notebook", e);
      }
    }
  }, []);

  // Save persistence
  useEffect(() => {
    localStorage.setItem('molasse_notebook', JSON.stringify(notebookEntries));
  }, [notebookEntries]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatState.messages, view]);

  const handleSendMessage = async (text: string = inputValue, forcedImage?: string) => {
    const trimmedText = text.trim();
    const activeImage = forcedImage || selectedImage;
    if (!trimmedText && !activeImage) return;

    setView('chat');

    const userMessage: Message = {
      role: 'user',
      parts: [
        { text: trimmedText || "Analyze this sample." },
        ...(activeImage ? [{ inlineData: { mimeType: 'image/jpeg', data: activeImage } }] : [])
      ]
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null
    }));
    setInputValue('');
    setSelectedImage(null);

    try {
      const responseText = await sendMessage(chatState.messages, trimmedText, activeImage || undefined);
      
      const modelMessage: Message = {
        role: 'model',
        parts: [{ text: responseText }]
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, modelMessage],
        isLoading: false
      }));
    } catch (err: any) {
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message
      }));
    }
  };

  const handleConsultAIFromNotebook = (image: string, context: string) => {
    setView('chat');
    handleSendMessage(context, image);
  };

  const saveNotebookEntry = (entry: NotebookEntry) => {
    setNotebookEntries(prev => {
      const exists = prev.find(e => e.id === entry.id);
      if (exists) {
        return prev.map(e => e.id === entry.id ? entry : e);
      }
      return [entry, ...prev];
    });
  };

  const deleteNotebookEntry = (id: string) => {
    if (window.confirm("Are you sure you want to delete this observation?")) {
      setNotebookEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setSelectedImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearChat = () => {
    if (window.confirm("Clear current conversation?")) {
      setChatState({
        messages: [],
        isLoading: false,
        error: null
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden lg:flex-row">
      {/* Sidebar Navigation */}
      <aside 
        className={`fixed inset-0 z-40 lg:relative lg:flex flex-col w-80 bg-white border-r border-slate-200 p-6 flex-shrink-0 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        role="complementary"
        aria-label="Application sidebar"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-xl text-white" aria-hidden="true">
              <Mountain size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Molasse Mentor</h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
            aria-label="Close sidebar"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto no-scrollbar" aria-label="Main Navigation">
          <div className="space-y-1">
            <button 
              onClick={() => { setView('chat'); setSidebarOpen(false); }}
              aria-current={view === 'chat' ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${view === 'chat' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <MessageSquare size={18} aria-hidden="true" /> Chat Advisor
            </button>
            <button 
              onClick={() => { setView('notebook'); setSidebarOpen(false); }}
              aria-current={view === 'notebook' ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${view === 'notebook' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Book size={18} aria-hidden="true" /> Field Notebook
            </button>
          </div>

          {view === 'chat' && (
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mb-3">Starter Queries</h2>
              <div className="space-y-1" role="group" aria-label="Quick start questions">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => { handleSendMessage(prompt.text); setSidebarOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-500 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center group"
                  >
                    <ChevronRight size={14} className="mr-2 text-slate-300 group-hover:text-emerald-400" aria-hidden="true" />
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50" role="complementary" aria-label="Geology tip">
            <div className="flex items-center gap-2 mb-2 text-emerald-800 font-semibold text-xs">
              <Compass size={14} aria-hidden="true" />
              <span>GEOLOGY TIP</span>
            </div>
            <p className="text-[10px] text-emerald-700 leading-relaxed uppercase tracking-wider font-medium opacity-80">
              Crossed Polars (XPL) help reveal interference colors and extinction angles—critical for feldspar ID.
            </p>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 space-y-3" role="contentinfo">
          <button 
            onClick={clearChat}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors px-4"
            aria-label="Clear chat history"
          >
            <RefreshCcw size={12} aria-hidden="true" />
            <span>Reset Chat</span>
          </button>
          
          <div className="px-4 py-2 space-y-1">
            <div className="flex flex-col">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Expert App Architect</span>
               <span className="text-xs font-black text-slate-800 tracking-tight">Muhammad Yasin Khan</span>
            </div>
            <p className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.15em] pt-1">
              Powered by Google Gemini 3 Flash Preview
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full bg-[#fcfcfd]" role="main">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="p-1 text-slate-500 hover:text-slate-800"
              aria-label="Open sidebar"
              aria-expanded={sidebarOpen}
            >
              <Menu size={20} aria-hidden="true" />
            </button>
            <span className="font-bold text-slate-800 text-sm">Molasse Mentor</span>
          </div>
          <div className="flex gap-2" role="group" aria-label="View selection">
            <button 
              onClick={() => setView('chat')}
              aria-label="Switch to chat view"
              aria-pressed={view === 'chat'}
              className={`p-2 rounded-lg ${view === 'chat' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400'}`}
            >
              <MessageSquare size={18} aria-hidden="true" />
            </button>
            <button 
              onClick={() => setView('notebook')}
              aria-label="Switch to field notebook"
              aria-pressed={view === 'notebook'}
              className={`p-2 rounded-lg ${view === 'notebook' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400'}`}
            >
              <Book size={18} aria-hidden="true" />
            </button>
          </div>
        </header>

        {view === 'notebook' ? (
          <FieldNotebook 
            entries={notebookEntries} 
            onSave={saveNotebookEntry} 
            onDelete={deleteNotebookEntry} 
            onConsultAI={handleConsultAIFromNotebook}
          />
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Messages Container */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 scroll-smooth"
              role="log"
              aria-live="polite"
              aria-label="Chat messages"
            >
              {chatState.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-emerald-100 blur-2xl opacity-40 rounded-full" aria-hidden="true"></div>
                    <div className="relative bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl">
                      <Sparkles size={48} className="text-emerald-600 mx-auto mb-4" aria-hidden="true" />
                      <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Molasse Mentor AI</h2>
                      <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-8 max-w-sm mx-auto">
                        Your professional guide to petrology and basin analysis. Upload a sample image or ask about complex mineral reactions.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left" role="group" aria-label="Suggested topics">
                        {STARTER_PROMPTS.slice(0, 4).map((p, idx) => (
                          <button 
                            key={idx}
                            onClick={() => handleSendMessage(p.text)}
                            className="p-4 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-600 transition-all flex items-center justify-between group"
                          >
                            <span>{p.label}</span>
                            <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm uppercase tracking-widest">
                    <Info size={12} className="text-emerald-500" aria-hidden="true" />
                    <span>Observations are saved in your Field Notebook</span>
                  </div>
                </div>
              ) : (
                chatState.messages.map((m, idx) => (
                  <ChatMessage key={idx} message={m} />
                ))
              )}

              {chatState.isLoading && (
                <div className="flex justify-start mb-6" aria-busy="true">
                  <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex gap-3 items-center text-slate-400 shadow-sm animate-pulse">
                    <div className="flex gap-1" aria-hidden="true">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">Mentor Analyzing...</span>
                  </div>
                </div>
              )}

              {chatState.error && (
                <div 
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 mx-auto max-w-lg mb-4"
                  role="alert"
                >
                  <Info size={16} aria-hidden="true" />
                  <span>{chatState.error}</span>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-8 bg-transparent">
              <div className="max-w-4xl mx-auto">
                {selectedImage && (
                  <div className="mb-3 flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-emerald-100 shadow-xl w-fit animate-in fade-in zoom-in-95 slide-in-from-bottom-4">
                    <div className="relative">
                      <img 
                        src={`data:image/jpeg;base64,${selectedImage}`} 
                        className="w-14 h-14 rounded-xl object-cover border border-slate-100"
                        alt="Preview of image to be sent" 
                      />
                      <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                        aria-label="Remove attached image"
                      >
                        <X size={12} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="pr-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Attachment ready</p>
                      <p className="text-xs font-semibold text-emerald-800">Petrographic Sample</p>
                    </div>
                  </div>
                )}

                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-[24px] blur opacity-10 group-focus-within:opacity-20 transition duration-500" aria-hidden="true"></div>
                  <div className="relative bg-white border border-slate-200 rounded-[22px] flex items-end px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/10 focus-within:border-emerald-500/50 transition-all">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 text-slate-400 hover:text-emerald-600 transition-colors rounded-xl hover:bg-slate-50 shrink-0 mb-1"
                      aria-label="Upload rock sample or thin section image to analyze"
                    >
                      <ImageIcon size={22} aria-hidden="true" />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      aria-label="Chat input message"
                      placeholder="Discuss thin sections or mineral data..."
                      className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 text-sm md:text-base py-3 px-4 resize-none h-auto max-h-48 min-h-[48px] placeholder:text-slate-300"
                      rows={1}
                    />

                    <button
                      onClick={() => handleSendMessage()}
                      disabled={chatState.isLoading || (!inputValue.trim() && !selectedImage)}
                      className={`p-3 rounded-xl flex items-center justify-center transition-all shrink-0 mb-0.5 ${
                        chatState.isLoading || (!inputValue.trim() && !selectedImage)
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95'
                      }`}
                      aria-label="Send message"
                    >
                      <Send size={20} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex justify-center gap-6">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5" aria-hidden="true">
                    <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                    Professional Geologist Mode
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;