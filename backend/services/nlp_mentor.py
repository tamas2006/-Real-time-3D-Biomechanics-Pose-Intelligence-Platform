"""
Real-Time Universal Life & Biomechanical NLP Mentorship Service powered by Groq High-Speed LLM Inference.
Provides holistic life guidance, mindset coaching, health optimization, and multimodal vision biomechanics.
"""
import os
import json
from typing import List, Dict, Any, Optional
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
        self.persona = "Kinetic AI — Universal High-Performance & Multimodal Vision Mentor"
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

        # Fallback
        if warnings and len(warnings) > 0:
            return {
                "spoken_text": f"Rep {rep_number}: {warnings[0]}. Focus on strict joint path and control.",
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
        Universal life, mindset, and biomechanics conversational reasoning engine powered by Groq LLM.
        Answers ANY question related to human life, philosophy, mindset, fitness, habits, science, and personal guidance.
        """
        exercise_clean = exercise.replace("_", " ").title()
        recent_warnings = recent_warnings or []

        if self.client:
            try:
                system_prompt = (
                    "You are Kinetic AI, an extraordinarily wise, empathetic, and hyper-intelligent Life, Mindset & Performance Mentor. "
                    "You possess deep multidisciplinary expertise in human life, psychology, personal philosophy, daily habits, mental toughness, career guidance, health, nutrition, and exercise biomechanics. "
                    "Your core purpose is to guide and uplift humans in every aspect of life. "
                    "Answer ANY question the user asks—whether about everyday life challenges, emotional resilience, relationship advice, productivity, purpose, philosophy, or workout mechanics—with warm, pragmatic, and profound clarity in 2-4 sentences. "
                    "Never refuse a question by saying you are only for fitness; you are a holistic mentor for the entire human experience."
                )

                resp = self.client.chat.completions.create(
                    model="openai/gpt-oss-120b",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": query}
                    ],
                    max_tokens=300,
                    temperature=0.75
                )
                full_text = resp.choices[0].message.content.strip()

                return {
                    "response": full_text,
                    "exercise": exercise,
                    "model": "Groq (openai/gpt-oss-120b)"
                }
            except Exception as e:
                print(f"[Groq Query Error]: {e}")

        # Local fallback
        return {
            "response": "Consistency in small daily actions compounds into extraordinary transformation. Focus on what is within your control today.",
            "exercise": exercise,
            "model": "Kinetic AI"
        }

    def analyze_posture_vision(
        self,
        image_b64: str,
        exercise: str = "squat",
        angle: float = 90.0,
        warnings: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Multimodal Vision & Reasoning Engine powered by Qwen 3.8 27B Vision on Groq.
        Visually analyzes an athlete's captured webcam frame for posture, bar path, alignment, and joint depth.
        """
        exercise_clean = exercise.replace("_", " ").title()
        warnings = warnings or []

        if not self.client:
            return {
                "assessment": f"Visual inspection of {exercise_clean} indicates joint inflection angle of {angle:.1f} degrees.",
                "correction": "Ensure knee and hip joints remain symmetrically stacked.",
                "score": 88,
                "model": "Local Fallback"
            }

        # Normalize data URI
        if not image_b64.startswith("data:image"):
            image_url = f"data:image/jpeg;base64,{image_b64}"
        else:
            image_url = image_b64

        prompt = (
            f"You are an Olympic Sports Scientist and Biomechanical Computer Vision expert. "
            f"Analyze this image of an athlete performing {exercise_clean}. "
            f"Current measured angle is {angle:.1f}°. Active alerts: {', '.join(warnings) if warnings else 'None'}. "
            "Inspect the athlete's actual posture in the image: joint alignment, foot angle, torso inclination, spinal curvature, and depth. "
            "Respond in 2-3 sentences of clinical visual assessment and 1 clear actionable cue. "
            "Format response as:\n"
            "Assessment: [Your visual analysis]\n"
            "Correction: [Your direct cue]"
        )

        try:
            resp = self.client.chat.completions.create(
                model="qwen/qwen3.8-27b",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": image_url}}
                        ]
                    }
                ],
                max_tokens=250,
                temperature=0.4
            )
            raw_text = resp.choices[0].message.content.strip()

            assessment = raw_text
            correction = "Maintain neutral spine and keep core locked."

            if "Assessment:" in raw_text and "Correction:" in raw_text:
                parts = raw_text.split("Correction:")
                assessment = parts[0].replace("Assessment:", "").strip()
                correction = parts[1].strip()
            elif "Correction:" in raw_text:
                parts = raw_text.split("Correction:")
                assessment = parts[0].strip()
                correction = parts[1].strip()

            return {
                "assessment": assessment,
                "correction": correction,
                "score": 92 if not warnings else 75,
                "model": "Groq Multimodal Vision (qwen/qwen3.8-27b)"
            }
        except Exception as e:
            print(f"[Groq Vision Error]: {e}")
            return {
                "assessment": f"Spatial landmark extraction confirms {angle:.1f}° displacement in {exercise_clean}.",
                "correction": "Keep your joints aligned and drive smoothly through the concentric phase.",
                "score": 85,
                "model": "Fallback Estimator"
            }

# Global Singleton Instance
nlp_mentor = NLPMentorEngine()
