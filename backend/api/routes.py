"""
FastAPI REST Routes for Exercise Catalog, Direct Evaluation, and Session Analytics.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
import uuid
import time
from backend.schemas.telemetry import (
    ExerciseType, PoseFrame, LiveTelemetryUpdate, SessionSummary, RepMetric, FormWarning
)
from backend.engine.form_evaluator import FormEvaluator
from backend.engine.state_machine import RepStateMachine

router = APIRouter(prefix="/api", tags=["Fitness Core"])

# In-memory session store for active and completed sessions
session_store: Dict[str, Dict[str, Any]] = {}
evaluator = FormEvaluator()

@router.get("/exercises", summary="Get supported exercises and metadata")
async def get_supported_exercises():
    return {
        "exercises": [
            {
                "id": ExerciseType.SQUAT.value,
                "name": "Barbell / Bodyweight Squat",
                "primary_joint": "Knees & Hips",
                "target_depth_angle": "≤ 90°",
                "description": "Lower until thighs are parallel or below parallel while keeping chest proud and knees tracking over toes.",
                "common_mistakes": ["Knee Valgus (buckling)", "Chest collapsing forward", "Incomplete depth"]
            },
            {
                "id": ExerciseType.PUSHUP.value,
                "name": "Standard Push-Up",
                "primary_joint": "Elbows & Core",
                "target_depth_angle": "≤ 90°",
                "description": "Maintain a rigid plank line from shoulders to heels, lowering chest to near floor level.",
                "common_mistakes": ["Sagging hips", "Piking hips", "Incomplete range of motion"]
            },
            {
                "id": ExerciseType.BICEP_CURL.value,
                "name": "Standing Bicep Curl",
                "primary_joint": "Elbows",
                "target_depth_angle": "≤ 55°",
                "description": "Keep elbows pinned to your sides, curling weight upwards through full range of motion.",
                "common_mistakes": ["Elbow swinging/drift", "Using torso momentum", "Partial extension"]
            },
            {
                "id": ExerciseType.LUNGE.value,
                "name": "Forward / Reverse Lunge",
                "primary_joint": "Lead Knee",
                "target_depth_angle": "≤ 95°",
                "description": "Step into a deep lunge until lead thigh is parallel to ground and back knee approaches floor.",
                "common_mistakes": ["Excessive torso forward lean", "Front knee caving in"]
            },
            {
                "id": ExerciseType.SHOULDER_PRESS.value,
                "name": "Overhead Shoulder Press",
                "primary_joint": "Shoulders & Elbows",
                "target_depth_angle": "≥ 160° (Lockout)",
                "description": "Press overhead from shoulder height to full vertical arm lockout without excessive lower-back arching.",
                "common_mistakes": ["Asymmetric pressing", "Incomplete lockout", "Hyperextending lower back"]
            },
            {
                "id": ExerciseType.PLANK.value,
                "name": "Core Isometric Plank",
                "primary_joint": "Core & Spine",
                "target_depth_angle": "170° - 180°",
                "description": "Maintain neutral spine alignment with abdominal brace.",
                "common_mistakes": ["Sagging hips", "Piked hips"]
            }
        ]
    }

@router.post("/session/start", summary="Start a new tracked workout session")
async def start_session(exercise: ExerciseType):
    session_id = str(uuid.uuid4())
    sm = RepStateMachine(exercise)
    session_store[session_id] = {
        "session_id": session_id,
        "exercise": exercise,
        "start_time": time.time(),
        "state_machine": sm,
        "evaluator": FormEvaluator()
    }
    return {
        "session_id": session_id,
        "exercise": exercise,
        "status": "active",
        "message": f"Session initialized for {exercise.value}"
    }

@router.post("/evaluate-frame", response_model=LiveTelemetryUpdate, summary="Stateless Single Frame Evaluation")
async def evaluate_frame(frame: PoseFrame):
    primary_angle, secondary_angle, form_score, warnings, voice_cue = evaluator.evaluate(
        frame.exercise, frame.landmarks, frame.timestamp
    )
    return LiveTelemetryUpdate(
        exercise=frame.exercise,
        phase=None or "idle", # type: ignore
        rep_count=0,
        primary_angle=round(primary_angle, 1),
        secondary_angle=round(secondary_angle, 1) if secondary_angle is not None else None,
        depth_percentage=0.0,
        form_score=round(form_score, 1),
        active_warnings=warnings,
        voice_cue=voice_cue,
        fps=frame.fps or 30.0
    )

@router.post("/session/{session_id}/end", response_model=SessionSummary, summary="End session and retrieve analytical summary")
async def end_session(session_id: str):
    if session_id not in session_store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    session = session_store[session_id]
    sm: RepStateMachine = session["state_machine"]
    total_duration = time.time() - session["start_time"]
    
    avg_score = 100.0
    if sm.rep_history:
        avg_score = sum(r.form_score for r in sm.rep_history) / len(sm.rep_history)

    # Generate heuristic feedback
    feedback_notes = []
    if sm.rep_count == 0:
        feedback_notes.append("No completed repetitions detected. Ensure full range of motion.")
    else:
        feedback_notes.append(f"Completed {sm.rep_count} total reps ({sm.valid_reps} with good form).")
        if avg_score >= 85:
            feedback_notes.append("Excellent biomechanical alignment and consistent tempo!")
        elif avg_score >= 70:
            feedback_notes.append("Solid set! Watch the form cues on later reps to prevent fatigue breakdown.")
        else:
            feedback_notes.append("Noticeable form breakdown detected. Focus on controlled eccentric tempo.")

    summary = SessionSummary(
        session_id=session_id,
        exercise=session["exercise"],
        total_reps=sm.rep_count,
        valid_reps=sm.valid_reps,
        avg_form_score=round(avg_score, 1),
        total_duration_sec=round(total_duration, 1),
        rep_metrics=sm.rep_history,
        overall_feedback=feedback_notes
    )

    del session_store[session_id]
    return summary

# -------------------------------------------------------------
# REAL-TIME NLP MENTORSHIP ENDPOINTS
# -------------------------------------------------------------
from backend.services.nlp_mentor import nlp_mentor
from pydantic import BaseModel

class RepCoachingRequest(BaseModel):
    exercise: str
    rep_number: int
    rom: float
    duration: float
    eccentric_sec: float
    concentric_sec: float
    form_score: int
    warnings: List[str] = []

class MentorChatRequest(BaseModel):
    query: str
    exercise: str = "squat"
    rep_count: int = 0
    avg_score: int = 100
    recent_warnings: List[str] = []

@router.post("/mentor/rep-cue", summary="Generate real-time NLP coaching cue for a completed rep")
async def generate_rep_cue(req: RepCoachingRequest):
    cue = nlp_mentor.generate_rep_coaching(
        exercise=req.exercise,
        rep_number=req.rep_number,
        rom=req.rom,
        duration=req.duration,
        eccentric_sec=req.eccentric_sec,
        concentric_sec=req.concentric_sec,
        form_score=req.form_score,
        warnings=req.warnings
    )
    return cue

@router.post("/mentor/chat", summary="Conversational NLP AI Mentor Q&A and form guidance")
async def mentor_chat(req: MentorChatRequest):
    ans = nlp_mentor.answer_mentorship_query(
        query=req.query,
        exercise=req.exercise,
        rep_count=req.rep_count,
        avg_score=req.avg_score,
        recent_warnings=req.recent_warnings
    )
    return ans

# -------------------------------------------------------------
# HIGH-FIDELITY ENGLISH AUDIO STREAMING (gTTS)
# -------------------------------------------------------------
import io
from fastapi.responses import StreamingResponse
from gtts import gTTS

@router.get("/mentor/tts", summary="Generate streaming spoken audio MP3")
async def generate_speech_tts(text: str, lang: str = "en"):
    try:
        clean_text = text.strip() or "Good repetition. Keep driving!"
        tts = gTTS(text=clean_text, lang=lang, slow=False)
        mp3_fp = io.BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        return StreamingResponse(mp3_fp, media_type="audio/mpeg")
    except Exception as e:
        tts = gTTS(text=text or "Keep your core braced.", lang="en", slow=False)
        mp3_fp = io.BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        return StreamingResponse(mp3_fp, media_type="audio/mpeg")



