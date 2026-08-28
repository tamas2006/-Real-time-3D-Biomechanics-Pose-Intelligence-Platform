"""
Real-Time Biomechanical NLP Mentorship Service powered by Groq High-Speed LLM Inference.
Provides clinical-grade movement cues, form correction, and interactive conversational reasoning.
"""
import os
import random
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load .env file automatically
load_dotenv()

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

class NLPMentorEngine:
    def __init__(self):
        self.persona = "Olympic Biomechanics Head Coach & Sports Scientist"
        self.client = None
        if GROQ_AVAILABLE and GROQ_API_KEY:
            try:
                self.client = Groq(api_key=GROQ_API_KEY)
            except Exception as e:
                print(f"[NLPMentorEngine] Groq init warning: {e}")

    def generate_rep_coaching(
        self,
        exercise: str,
        rep_number: int,
        rom: float,
        duration: float,
        eccentric_sec: float,
        concentric_sec: float,
        form_score: int,
        warnings: List[str]
    ) -> Dict[str, Any]:
        """
        Generates dynamic natural language coaching feedback for a completed repetition using Groq.
        """
        exercise_clean = exercise.replace("_", " ").title()

        # If Groq client is active, generate ultra-dynamic high precision cue
        if self.client:
            try:
                system_prompt = (
                    f"You are {self.persona}. You are monitoring an athlete doing {exercise_clean}. "
                    "Provide a concise, 1-2 sentence real-time vocal feedback cue for their repetition. "
                    "Be encouraging, scientifically accurate, and focused on immediate anatomical correction or positive reinforcement. "
                    "Do not use markdown formatting or emojis, output pure clean speakable text."
                )
                user_content = (
                    f"Rep #{rep_number} completed. "
                    f"Range of Motion: {rom:.1f} degrees. "
                    f"Duration: {duration:.1f}s (Eccentric: {eccentric_sec:.1f}s, Concentric: {concentric_sec:.1f}s). "
                    f"Form Score: {form_score}/100. "
                    f"Violations detected: {', '.join(warnings) if warnings else 'None (Clean Rep)'}."
                )

                resp = self.client.chat.completions.create(
                    model="openai/gpt-oss-120b",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_content}
                    ],
                    max_tokens=80,
                    temperature=0.6
                )
                spoken = resp.choices[0].message.content.strip()
                short_cue = warnings[0] if warnings else f"Rep {rep_number} verified"

                return {
                    "spoken_text": spoken,
                    "short_cue": short_cue,
                    "sentiment": "correction" if warnings else "praise",
                    "score": form_score
                }
            except Exception as e:
                print(f"[Groq Rep Coaching Error]: {e}")

        # Fallback procedural coaching
        if warnings and len(warnings) > 0:
            cue = f"Rep {rep_number}: {warnings[0]}. Focus on strict joint path and control."
            return {
                "spoken_text": cue,
                "short_cue": warnings[0],
                "sentiment": "correction",
                "score": form_score
            }

        return {
            "spoken_text": f"Solid execution on rep {rep_number}. Keep driving through mid-foot!",
            "short_cue": f"Rep {rep_number} logged",
            "sentiment": "praise",
            "score": form_score
        }

    def answer_mentorship_query(
        self,
        query: str,
        exercise: str = "squat",
        rep_count: int = 0,
        avg_score: int = 100,
        recent_warnings: List[str] = None
    ) -> Dict[str, Any]:
        """
        Conversational reasoning engine powered by Groq LLM.
        """
        exercise_clean = exercise.replace("_", " ").title()
        recent_warnings = recent_warnings or []

        if self.client:
            try:
                system_prompt = (
                    f"You are the world's top {self.persona}. The athlete is currently training {exercise_clean} "
                    f"and has completed {rep_count} repetitions with an average form score of {avg_score}%. "
                    f"Recent telemetry alerts: {', '.join(recent_warnings) if recent_warnings else 'Optimal form'}. "
                    "Provide a clear, practical, sports-science backed answer in 2-3 sentences max. "
                    "Always end with a single short, punchy vocal cue enclosed in brackets like: [Actionable Cue: Push knees over pinky toes]."
                )

                resp = self.client.chat.completions.create(
                    model="openai/gpt-oss-120b",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": query}
                    ],
                    max_tokens=250,
                    temperature=0.7
                )
                full_text = resp.choices[0].message.content.strip()

                # Extract actionable cue if present
                actionable_cue = None
                if "[Actionable Cue:" in full_text:
                    parts = full_text.split("[Actionable Cue:")
                    clean_response = parts[0].strip()
                    actionable_cue = parts[1].replace("]", "").strip()
                else:
                    clean_response = full_text

                return {
                    "response": clean_response,
                    "actionable_cue": actionable_cue or "Maintain core stability throughout range of motion.",
                    "exercise": exercise,
                    "model": "Groq (openai/gpt-oss-120b)"
                }
            except Exception as e:
                print(f"[Groq Query Error]: {e}")

        # Local fallback
        return {
            "response": f"For {exercise_clean}, prioritize joint stack alignment and control the eccentric descent to maximize muscle tension.",
            "actionable_cue": "Control the descent, drive explosively through mid-foot.",
            "exercise": exercise,
            "model": "Local Biomechanics Rulebook"
        }

# Global Singleton Instance
nlp_mentor = NLPMentorEngine()
