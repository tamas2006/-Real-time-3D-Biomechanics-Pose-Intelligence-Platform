'use client';

import React, { useState } from 'react';
import { ExerciseType } from '@/types/fitness';
import { sounds } from '@/lib/soundEffects';
import { playMarathiVoice } from '@/lib/marathiVoice';

interface NlpMentorStudioProps {
  exercise: ExerciseType;
  repCount: number;
  formScore: number;
  warnings: string[];
}

interface Message {
  sender: 'user' | 'coach';
  text: string;
  cue?: string;
  time: string;
}

export const NlpMentorStudio: React.FC<NlpMentorStudioProps> = ({
  exercise,
  repCount,
  formScore,
  warnings
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'coach',
      text: `राम राम शेठ! कसा आहेस? मी तुमचा AI जिमचा जिगरी मित्र आहे. तू ${exercise.replace('_', ' ')} करतोयस ना? तुमच्या प्रत्येक हालचालीवर ३D मध्ये लक्ष आहे. लावा ताकद शेठ! फॉर्म बद्दल काहीही विचारा!`,
      cue: "टिप: 'शेठ, श्वास घट्ट रोवून लावा ताकद!'",
      time: 'आत्ताच'
    }
  ]);
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
          cue: data.actionable_cue,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, coachMsg]);

        // Speak Native Marathi voice
        const textToSpeak = data.actionable_cue || data.response;
        playMarathiVoice(textToSpeak, true);
      }
    } catch (e) {
      const fallbackMsg: Message = {
        sender: 'coach',
        text: `लावा ताकद शेठ! ${exercise.replace('_', ' ')} मध्ये खाली जाताना ३ सेकंद सावकाश जा आणि वर येताना पूर्ण ताकदीने या. विषयच संपला!`,
        cue: "टिप: 'लावा ताकद शेठ, नादच खुळा!'",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'शेठ गुडघे दुखतायत काय करू?',
    'Squat मध्ये किती खाली जाऊ शेठ?',
    'Pushup मारताना कोपरं कशी ठेवू?',
    'लावा ताकद शेठ!'
  ];

  return (
    <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
      {/* Mac Terminal Window Container (Tamas-Ingle Style) */}
      <div className="rounded-[36px] bg-[#0B1120] border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.4)] overflow-hidden">
        {/* Top Mac Window Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-black/50 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
          <span className="text-xs font-mono text-slate-400 tracking-widest uppercase font-bold">
            MARATHI.MENTOR // लावा ताकद शेठ!
          </span>
          <div className="flex items-center gap-2 text-[11px] font-mono text-amber-200">
            <span className="w-2 h-2 rounded-full warm-glow-dot animate-pulse" />
            <span>शेठ ONLINE आहे</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 md:p-10 flex flex-col gap-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="text-amber-200 font-mono text-xs font-bold tracking-widest uppercase mb-1">
                <span>HIGH-ENERGY MARATHI GYM BUDDY</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-serif text-white">
                आपला AI <span className="italic text-amber-200">जिमचा मित्र (शेठ)</span>
              </h3>
            </div>

            {/* Quick Question Chips in Marathi */}
            <div className="flex flex-wrap items-center gap-2">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-sans font-medium text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Terminal Window */}
          <div className="flex flex-col gap-4 max-h-[380px] overflow-y-auto p-4 rounded-2xl bg-black/40 border border-white/10 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col gap-1.5 max-w-2xl ${
                  m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span className="font-bold uppercase tracking-wider text-amber-200">
                    {m.sender === 'user' ? 'तुम्ही (शेठ)' : 'जिमचा मित्र (AI Coach)'}
                  </span>
                  <span>•</span>
                  <span>{m.time}</span>
                </div>

                <div
                  className={`p-4 rounded-2xl leading-relaxed font-sans text-sm ${
                    m.sender === 'user'
                      ? 'bg-amber-400/20 text-amber-100 border border-amber-300/30'
                      : 'bg-white/[0.06] text-slate-200 border border-white/10'
                  }`}
                >
                  <p>{m.text}</p>
                  {m.cue && (
                    <div className="mt-2.5 pt-2 border-t border-white/10 text-amber-200 font-bold text-xs">
                      {m.cue}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="self-start flex items-center gap-2 text-slate-400 text-xs font-mono p-3 rounded-2xl bg-white/5">
                <span className="w-2 h-2 rounded-full warm-glow-dot animate-pulse" />
                <span>शेठ विचार करतोय...</span>
              </div>
            )}
          </div>

          {/* Interactive Chat Input */}
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-black/50 border border-white/15 shadow-inner">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="शेठला काहीही विचारा... (उदा. 'शेठ squat मध्ये कंबर दुखतेय')"
              className="flex-1 bg-transparent px-4 py-2 text-xs font-sans text-white placeholder-slate-500 outline-none"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputText.trim()}
              className="px-6 py-2.5 rounded-xl bg-white text-slate-950 font-sans font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all disabled:opacity-40 active:scale-95 shadow-md"
            >
              शेठला विचारा
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
