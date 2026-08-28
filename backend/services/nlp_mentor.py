"""
Real-Time Biomechanical NLP Mentorship Service in Pure Professional English.
Provides clinical-grade movement cues, form correction, and interactive conversational reasoning.
"""
import random
from typing import List, Dict, Any

class NLPMentorEngine:
    def __init__(self):
        self.persona = "Lead Biomechanics Coach & Sports Scientist"

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
        Generates dynamic natural language coaching feedback for a completed repetition.
        """
        exercise_clean = exercise.replace("_", " ").title()

        # 1. Critical Biomechanical Form Corrections
        if warnings and len(warnings) > 0:
            primary_warn = warnings[0].lower()
            if "knee" in primary_warn or "cave" in primary_warn:
                cue = f"Rep {rep_number}: Knee valgus detected. Push your knees outward over your mid-toes to protect your ligaments."
                short_cue = "Push knees outward!"
            elif "torso" in primary_warn or "pitch" in primary_warn:
                cue = f"Rep {rep_number}: Excessive torso lean. Keep your chest proud and core braced."
                short_cue = "Keep chest proud!"
            elif "flare" in primary_warn or "elbow" in primary_warn:
                cue = f"Rep {rep_number}: Elbow flare detected. Tuck elbows to 45 degrees to protect the rotator cuff."
                short_cue = "Tuck elbows to 45 degrees!"
            elif "swing" in primary_warn:
                cue = f"Rep {rep_number}: Keep elbows pinned to your ribcage. Do not use momentum."
                short_cue = "Pin elbows to ribs!"
            else:
                cue = f"Rep {rep_number}: {warnings[0]}. Focus on strict joint path."
                short_cue = warnings[0]

            return {
                "spoken_text": cue,
                "short_cue": short_cue,
                "sentiment": "correction",
                "score": form_score
            }

        # 2. Perfect Form & High Velocity
        if form_score >= 90:
            praise_phrases = [
                f"Rep {rep_number} was textbook! Full range of motion with excellent control.",
                f"Flawless rep {rep_number}. Perfect joint lockout and cadence. Keep that rhythm!",
                f"Outstanding execution on rep {rep_number}. Kinetic chain was completely stacked.",
                f"Rep {rep_number} nailed full depth with clinical stability. Stay locked in!"
            ]
            cue = random.choice(praise_phrases)
            return {
                "spoken_text": cue,
                "short_cue": f"Rep {rep_number}! Perfect form.",
                "sentiment": "praise",
                "score": form_score
            }

        # 3. Tempo / Speed Adjustments
        if eccentric_sec < 0.6:
            cue = f"Rep {rep_number}: You rushed the descent. Control the 2 to 3 second negative to build tendon resilience."
            return {
                "spoken_text": cue,
                "short_cue": "Control the negative phase!",
                "sentiment": "tempo_advice",
                "score": form_score
            }

        # 4. General Solid Repetition
        solid_phrases = [
            f"Good work on rep {rep_number}. Drive strong through your mid-foot on the ascent.",
            f"Solid rep {rep_number}. Keep breathing steadily throughout the movement.",
            f"Rep {rep_number} completed with {rom:.0f} degrees of clean displacement."
        ]
        cue = random.choice(solid_phrases)
        return {
            "spoken_text": cue,
            "short_cue": f"Rep {rep_number} logged.",
            "sentiment": "positive",
            "score": form_score
        }

    def answer_mentorship_query(
        self,
        query: str,
        exercise: str = "squat",
        rep_count: int = 0,
        avg_score: int = 100,
        recent_warnings: List[str] = None
    ) -> Dict[str, str]:
        """
        Interactive conversational NLP assistant for exercise questions and biomechanics advice.
        """
        q = query.lower().strip()
        recent_warnings = recent_warnings or []
        ex_name = exercise.replace("_", " ").title()

        if any(w in q for w in ["depth", "low", "parallel"]):
            return {
                "response": f"For {ex_name}, optimal biomechanical depth requires the hip crease to descend level with or slightly below the top of the patella (femoral-tibial angle ≤ 110°). This maximizes gluteus maximus and quad stretch-shortening cycles while mitigating patellofemoral shearing pressure.",
                "actionable_cue": "Cue: 'Open your hips and drop between your knees, not on top of them.'"
            }

        elif any(w in q for w in ["knee", "pain", "cave", "valgus"]):
            return {
                "response": "Knee valgus collapse is commonly caused by underactive gluteus medius stabilizers or restricted ankle dorsiflexion. When knees collapse inward, shear force across the ACL increases by up to 300%.",
                "actionable_cue": "Cue: 'Screw your feet into the floor to pre-activate your external hip rotators.'"
            }

        elif any(w in q for w in ["tempo", "speed", "fast", "slow"]):
            return {
                "response": f"For maximum hypertrophy and joint longevity in {ex_name}, we recommend a 3-0-1-0 tempo: 3 seconds controlled eccentric descent, 0 pause at bottom, 1 second explosive concentric ascent, and 0 pause at top lockout.",
                "actionable_cue": "Cue: 'Count 3-2-1 on the way down, explode up in 1 second.'"
            }

        elif any(w in q for w in ["pushup", "elbow", "shoulder"]):
            return {
                "response": "In horizontal pressing (push-ups), flaring elbows at 90° pinches the supraspinatus tendon against the acromion. Tucking elbows to 45° creates an arrow shape that optimizes pectoralis major fiber recruitment.",
                "actionable_cue": "Cue: 'Make an arrow shape with your upper body, not a T.'"
            }

        elif any(w in q for w in ["curl", "bicep", "arm"]):
            return {
                "response": "To fully isolate the biceps brachii short and long heads, keep elbows pinned tightly to the mid-axillary ribline. Any forward elbow swing engages anterior deltoids and robs the biceps of peak tension at 70° flexion.",
                "actionable_cue": "Cue: 'Pin elbows to your ribs like they are welded in place.'"
            }

        elif any(w in q for w in ["score", "why", "form"]):
            if recent_warnings:
                return {
                    "response": f"Your recent reps flagged '{recent_warnings[0]}'. Your current set average is {avg_score}%. Addressing joint deviation on the eccentric transition will immediately elevate your score.",
                    "actionable_cue": "Cue: 'Focus on vertical spinal neutrality and symmetry on both limbs.'"
                }
            return {
                "response": f"You're currently averaging {avg_score}% form score across {rep_count} logged reps. Your joint paths and range-of-motion meet athletic clinical standards.",
                "actionable_cue": "Cue: 'Maintain consistent cadence to preserve this form through fatigue.'"
            }

        else:
            return {
                "response": f"As your AI Biomechanics Mentor, I am continuously tracking your 3D spatial joint vectors during {ex_name}. You have completed {rep_count} reps at {avg_score}% quality. Ask me about depth cues, tempo optimization, joint angles, or fatigue management!",
                "actionable_cue": "Cue: 'Stay braced through your abdominal cylinder on every repetition.'"
            }

nlp_mentor = NLPMentorEngine()
