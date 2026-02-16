import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, XCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm NutriGuide AI. Ask me anything about nutrition, healthy eating, or lifestyle tips!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Pass the last few messages for context (keeping it light)
      const history = messages.slice(-4).map(m => ({ role: m.role, text: m.text }));
      const responseText = await sendMessageToGemini(userMessage.text, history);
      
      const botMessage: ChatMessage = { role: 'model', text: responseText };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { 
        role: 'model', 
        text: "I'm having trouble connecting right now. Please try again later.",
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <section id="ai-assistant" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-12">
          
          <div className="md:w-1/3 space-y-6">
            <div className="inline-flex items-center gap-2 text-leaf-600 font-semibold bg-leaf-50 px-3 py-1 rounded-full text-xs uppercase tracking-wider">
              <Sparkles size={14} />
              AI Powered
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">
              Your Pocket <br/> Nutritionist
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Have a quick question about calories? Need a healthy snack idea? 
              Our AI assistant is trained on general nutritional guidelines to give you instant support 24/7.
            </p>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="font-semibold text-slate-900 mb-3">Try asking:</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2 cursor-pointer hover:text-leaf-600 transition-colors" onClick={() => setInput("What are good sources of plant protein?")}>
                  <div className="w-1.5 h-1.5 bg-leaf-400 rounded-full"></div>
                  "What are good sources of plant protein?"
                </li>
                <li className="flex items-center gap-2 cursor-pointer hover:text-leaf-600 transition-colors" onClick={() => setInput("Suggest a low-carb breakfast.")}>
                  <div className="w-1.5 h-1.5 bg-leaf-400 rounded-full"></div>
                  "Suggest a low-carb breakfast."
                </li>
                <li className="flex items-center gap-2 cursor-pointer hover:text-leaf-600 transition-colors" onClick={() => setInput("Why is hydration important?")}>
                  <div className="w-1.5 h-1.5 bg-leaf-400 rounded-full"></div>
                  "Why is hydration important?"
                </li>
              </ul>
            </div>
          </div>

          <div className="md:w-2/3">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="bg-slate-900 p-4 flex items-center gap-3">
                <div className="bg-leaf-500 p-2 rounded-full">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                   <h3 className="text-white font-medium">NutriGuide AI</h3>
                   <p className="text-slate-400 text-xs flex items-center gap-1">
                     <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
                   </p>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-leaf-100 text-leaf-600'}`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-slate-800 text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
                    } ${msg.isError ? 'border-red-200 bg-red-50 text-red-600' : ''}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-leaf-100 text-leaf-600 flex items-center justify-center shrink-0">
                      <Bot size={16} />
                    </div>
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your diet..."
                    className="w-full pl-6 pr-14 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:bg-white transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2 top-2 p-2 bg-leaf-600 hover:bg-leaf-700 disabled:bg-slate-300 text-white rounded-lg transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <p className="text-center text-xs text-slate-400 mt-3">
                  AI suggestions are for informational purposes only. Consult a doctor for medical advice.
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AIAssistant;
