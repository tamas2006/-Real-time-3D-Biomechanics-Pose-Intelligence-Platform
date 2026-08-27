"""
Pydantic Schemas for Live Telemetry, Form Analysis, and Session Metrics.
"""
from typing import List, Dict, Optional, Any, Literal
from pydantic import BaseModel, Field
from enum import Enum

class ExerciseType(str, Enum):
    SQUAT = "squat"
    PUSHUP = "pushup"
    BICEP_CURL = "bicep_curl"
    LUNGE = "lunge"
    SHOULDER_PRESS = "shoulder_press"
    PLANK = "plank"

class MovementPhase(str, Enum):
    IDLE = "idle"
    START = "start"
    ECCENTRIC = "eccentric"       # Lowering / elongation phase
    INFLECTION = "inflection"     # Bottom peak / max depth
    CONCENTRIC = "concentric"     # Pushing / contraction phase
    LOCKOUT = "lockout"           # Completion of repetition

class Landmark(BaseModel):
    id: int
    name: Optional[str] = None
    x: float
    y: float
    z: float = 0.0
    visibility: float = 1.0

class PoseFrame(BaseModel):
    timestamp: float = Field(..., description="Epoch timestamp in seconds")
    exercise: ExerciseType = ExerciseType.SQUAT
    landmarks: List[Landmark] = Field(..., description="List of 33 normalized landmarks")
    fps: Optional[float] = 30.0

class FormWarning(BaseModel):
    code: str
    message: str
    severity: Literal["info", "warning", "critical"] = "warning"
    joint_affected: Optional[str] = None

class RepMetric(BaseModel):
    rep_number: int
    duration_sec: float
    concentric_sec: float
    eccentric_sec: float
    min_primary_angle: float
    max_primary_angle: float
    form_score: float = Field(..., ge=0.0, le=100.0)
    warnings: List[FormWarning] = []
    tempo_ratio: Optional[float] = None # Eccentric / Concentric tempo

class LiveTelemetryUpdate(BaseModel):
    exercise: ExerciseType
    phase: MovementPhase
    rep_count: int
    primary_angle: float
    secondary_angle: Optional[float] = None
    depth_percentage: float = 0.0
    form_score: float = 100.0
    active_warnings: List[FormWarning] = []
    voice_cue: Optional[str] = None
    fps: float = 30.0

class SessionSummary(BaseModel):
    session_id: str
    exercise: ExerciseType
    total_reps: int
    valid_reps: int
    avg_form_score: float
    total_duration_sec: float
    rep_metrics: List[RepMetric] = []
    overall_feedback: List[str] = []
