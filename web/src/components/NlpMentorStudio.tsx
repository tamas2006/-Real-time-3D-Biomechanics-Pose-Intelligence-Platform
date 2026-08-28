'use client';

import React, { useState } from 'react';
import { ExerciseType } from '@/types/fitness';
import { sounds } from '@/lib/soundEffects';

interface NlpMentorStudioProps {
  exercise: ExerciseType;
  repCount: number;
  formScore: number;
  warnings: string[];
}

interface Message {
  sender: 'user' | 'coach';
  text: string;
  time: string;
}

export const NlpMentorStudio: React.FC<NlpMentorStudioProps> = ({
  exercise,
  repCount,
  formScore,
  warnings
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || isLoading) return;

    sounds.playButtonClick();
    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          exercise: exercise,
          rep_count: repCount,
          avg_score: formScore,
          recent_warnings: warnings
        })
      });

      if (res.ok) {
        const data = await res.json();
        const coachMsg: Message = {
          sender: 'coach',
          text: data.response,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, coachMsg]);
      } else {
        const errMsg: Message = {
          sender: 'coach',
          text: 'Unable to reach Groq AI model at this moment. Please check connection.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } catch (e) {
      const errMsg: Message = {
        sender: 'coach',
        text: 'Network error connecting to Groq AI server.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'How do I fix knee cave-in?',
    'What is optimal squat depth?',
    'How should elbows be positioned in pushups?',
    'Give me a cue to isolate biceps'
  ];

  return (
    <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto w-full">
      <div className="rounded-3xl bg-[#0B1120] border border-white/15 shadow-2xl p-6 md:p-8 flex flex-col gap-6 text-white">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-sans font-bold text-white">
              AI Coach Guidance
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Powered by Groq High-Speed LLM. Ask any questions about technique, joint mechanics, or form fixes.
            </p>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap items-center gap-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-sans text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History */}
        <div className="flex flex-col gap-3 min-h-[160px] max-h-[360px] overflow-y-auto p-4 rounded-2xl bg-black/40 border border-white/10 text-xs font-sans">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center my-auto text-slate-500 py-8 text-center">
              <p className="text-sm font-sans font-medium text-slate-400">Ask your AI Coach anything</p>
              <p className="text-xs text-slate-500 mt-1">Click a suggestion above or type your question below for instant Groq responses.</p>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col gap-1 max-w-2xl ${
                  m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div className="text-[10px] text-slate-400 font-mono">
                  {m.sender === 'user' ? 'You' : 'Groq AI Coach'} • {m.time}
                </div>

                <div
                  className={`p-3.5 rounded-2xl leading-relaxed text-xs ${
                    m.sender === 'user'
                      ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30'
                      : 'bg-white/5 text-slate-200 border border-white/10'
                  }`}
                >
                  <p>{m.text}</p>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="self-start text-slate-400 text-xs p-3 rounded-2xl bg-white/5 font-mono">
              Groq is thinking...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-black/50 border border-white/15">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask your coach anything about exercise form or technique..."
            className="flex-1 bg-transparent px-4 py-2 text-xs text-white placeholder-slate-500 outline-none font-sans"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputText.trim()}
            className="px-5 py-2.5 rounded-xl bg-white text-black font-sans font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all disabled:opacity-40 cursor-pointer"
          >
            Ask
          </button>
        </div>
      </div>
    </section>
  );
};
