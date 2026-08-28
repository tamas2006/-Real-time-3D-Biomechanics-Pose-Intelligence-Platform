'use client';

import React, { useState } from 'react';
import { ExerciseType } from '@/types/fitness';
import { sounds } from '@/lib/soundEffects';
import { playVoiceCue } from '@/lib/voiceCoach';

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
      text: `Hello! I am your AI Coach tracking your ${exercise.replace('_', ' ')}. Ask me about joint angles, tempo control, depth, or form fixes.`,
      cue: "Tip: 'Maintain abdominal bracing throughout every repetition.'",
      time: 'Just now'
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

        const textToSpeak = data.actionable_cue || data.response;
        playVoiceCue(textToSpeak, true);
      }
    } catch (e) {
      const fallbackMsg: Message = {
        sender: 'coach',
        text: `For ${exercise.replace('_', ' ')}, prioritize a controlled 3-second lowering phase to build joint stability.`,
        cue: "Tip: 'Control the descent, drive explosively through mid-foot.'",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      playVoiceCue("Control the descent, drive explosively through mid-foot.", true);
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
    <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto w-full">
      <div className="rounded-3xl bg-[#0B1120] border border-white/15 shadow-2xl p-6 md:p-8 flex flex-col gap-6 text-white">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-sans font-bold text-white">
              AI Coach Guidance
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Ask questions about exercise form, anatomy, and technique.
            </p>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap items-center gap-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-sans text-slate-300 hover:text-white transition-all active:scale-95"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History */}
        <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto p-4 rounded-2xl bg-black/40 border border-white/10 text-xs font-sans">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col gap-1 max-w-2xl ${
                m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div className="text-[10px] text-slate-400 font-mono">
                {m.sender === 'user' ? 'You' : 'AI Coach'} • {m.time}
              </div>

              <div
                className={`p-3.5 rounded-2xl leading-relaxed text-xs ${
                  m.sender === 'user'
                    ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30'
                    : 'bg-white/5 text-slate-200 border border-white/10'
                }`}
              >
                <p>{m.text}</p>
                {m.cue && (
                  <div className="mt-2 pt-2 border-t border-white/10 text-emerald-300 font-bold text-xs">
                    {m.cue}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="self-start text-slate-400 text-xs p-3 rounded-2xl bg-white/5 font-mono">
              AI Coach is thinking...
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
            className="px-5 py-2.5 rounded-xl bg-white text-black font-sans font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all disabled:opacity-40"
          >
            Ask
          </button>
        </div>
      </div>
    </section>
  );
};
