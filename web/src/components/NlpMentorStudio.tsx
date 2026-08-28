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
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

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
          text: 'Unable to reach Kinetic AI model at this moment. Please check connection.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } catch (e) {
      const errMsg: Message = {
        sender: 'coach',
        text: 'Network error connecting to Kinetic AI server.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    sounds.playButtonClick();
    setIsSubscribed(true);
  };

  const quickPrompts = [
    'How do I build unshakable discipline?',
    'How to handle stress & burnout?',
    'How do I optimize deep sleep & recovery?',
    'How to stay consistent with life goals?',
    'How do I fix knee cave-in on squats?'
  ];

  return (
    <section className="py-8 max-w-6xl mx-auto w-full font-mono text-white">
      {/* Elevated Matte Card Container */}
      <div className="rounded-[28px] bg-[#0c0c0d] border border-white/[0.08] shadow-2xl p-6 md:p-10 flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-neutral-500 font-bold">//</span>
              <h3 className="text-base font-bold tracking-tight text-white uppercase">
                Kinetic AI Mentor
              </h3>
            </div>
            <p className="text-xs text-neutral-400">
              Multimodal intelligence for mindset, health optimization, and clinical biomechanics.
            </p>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap items-center gap-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="px-3 py-1.5 rounded-lg bg-[#141416] hover:bg-neutral-800 border border-white/[0.08] text-[11px] text-neutral-300 hover:text-white transition-all active:scale-95 cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Stream History */}
        <div className="flex flex-col gap-3 min-h-[180px] max-h-[360px] overflow-y-auto p-4 rounded-xl bg-[#080808] border border-white/[0.06] text-xs">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center my-auto text-neutral-500 py-8 text-center">
              <p className="text-xs font-bold text-neutral-300 uppercase tracking-wider">// Ask anything</p>
              <p className="text-[11px] text-neutral-500 mt-1">Select a suggestion above or enter your question below for instant Kinetic AI responses.</p>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col gap-1 max-w-2xl ${
                  m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div className="text-[10px] text-neutral-500">
                  {m.sender === 'user' ? 'You' : 'Kinetic AI Mentor'} • {m.time}
                </div>

                <div
                  className={`p-3.5 rounded-xl leading-relaxed text-xs ${
                    m.sender === 'user'
                      ? 'bg-white/15 text-white border border-white/25'
                      : 'bg-[#141416] text-neutral-200 border border-white/[0.08]'
                  }`}
                >
                  <p>{m.text}</p>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="self-start flex items-center gap-1.5 p-3 rounded-xl bg-[#141416] border border-white/[0.08] w-max">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#080808] border border-white/[0.08]">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask your mentor anything about life, discipline, mindset, recovery, or workouts..."
            className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputText.trim()}
            className="px-5 py-2 rounded-lg bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all disabled:opacity-40 cursor-pointer shadow-sm"
          >
            Ask
          </button>
        </div>

      </div>
    </section>
  );
};

