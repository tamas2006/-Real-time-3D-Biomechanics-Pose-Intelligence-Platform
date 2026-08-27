"""
Biomechanical Finite State Machine (FSM) with Range-of-Motion (ROM) and Anti-Noise Guards.
Prevents false rep counting during casual body shifts, walking, or partial fidgeting.
"""
from typing import Optional, Tuple, List, Dict
import time
from backend.schemas.telemetry import ExerciseType, MovementPhase, RepMetric, FormWarning

class RepStateMachine:
    def __init__(self, exercise: ExerciseType):
        self.exercise = exercise
        self.phase: MovementPhase = MovementPhase.IDLE
        self.rep_count: int = 0
        self.valid_reps: int = 0
        
        self.rep_start_time: float = 0.0
        self.eccentric_start_time: float = 0.0
        self.inflection_time: float = 0.0
        self.concentric_start_time: float = 0.0
        
        self.min_angle: float = 360.0
        self.max_angle: float = 0.0
        self.rep_history: List[RepMetric] = []
        self.current_rep_warnings: List[FormWarning] = []
        
        # Biomechanically strict parameters
        self.configs = {
            ExerciseType.SQUAT: {
                "start_thresh": 150.0,       # Standing straight
                "inflection_thresh": 98.0,   # Parallel or deep squat
                "lockout_thresh": 145.0,     # Return to standing
                "min_rom": 45.0,             # Must travel at least 45 degrees
                "min_duration": 1.0,         # Minimum 1.0 second per rep
                "min_ecc_duration": 0.35,
                "min_con_duration": 0.35
            },
            ExerciseType.PUSHUP: {
                "start_thresh": 150.0,
                "inflection_thresh": 92.0,   # Deep chest
                "lockout_thresh": 145.0,
                "min_rom": 45.0,
                "min_duration": 0.9,
                "min_ecc_duration": 0.3,
                "min_con_duration": 0.3
            },
            ExerciseType.BICEP_CURL: {
                "start_thresh": 140.0,       # Full arm extension
                "inflection_thresh": 60.0,   # Deep curl contraction
                "lockout_thresh": 135.0,     # Full return
                "min_rom": 65.0,             # Large elbow travel required
                "min_duration": 0.9,
                "min_ecc_duration": 0.3,
                "min_con_duration": 0.3
            },
            ExerciseType.LUNGE: {
                "start_thresh": 150.0,
                "inflection_thresh": 100.0,
                "lockout_thresh": 145.0,
                "min_rom": 45.0,
                "min_duration": 1.0,
                "min_ecc_duration": 0.35,
                "min_con_duration": 0.35
            },
            ExerciseType.SHOULDER_PRESS: {
                "start_thresh": 85.0,        # Dumbbells at shoulders
                "inflection_thresh": 155.0,  # Full overhead lockout
                "lockout_thresh": 95.0,      # Return to shoulders
                "min_rom": 55.0,             # Full overhead press travel
                "min_duration": 1.0,
                "min_ecc_duration": 0.35,
                "min_con_duration": 0.35
            },
            ExerciseType.PLANK: {
                "start_thresh": 155.0,
                "inflection_thresh": 155.0,
                "lockout_thresh": 155.0,
                "min_rom": 0.0,
                "min_duration": 1.0,
                "min_ecc_duration": 0.0,
                "min_con_duration": 0.0
            }
        }

    def reset(self, exercise: Optional[ExerciseType] = None):
        if exercise:
            self.exercise = exercise
        self.phase = MovementPhase.IDLE
        self.rep_count = 0
        self.valid_reps = 0
        self.rep_history.clear()
        self.current_rep_warnings.clear()
        self.min_angle = 360.0
        self.max_angle = 0.0

    def update(self, primary_angle: float, timestamp: float, current_form_score: float = 100.0) -> Tuple[MovementPhase, bool, Optional[RepMetric]]:
        cfg = self.configs.get(self.exercise, self.configs[ExerciseType.SQUAT])
        is_inverted = self.exercise == ExerciseType.SHOULDER_PRESS
        rep_completed = False
        completed_metric = None

        if primary_angle <= 0.0 or primary_angle > 200.0:
            return self.phase, False, None

        self.min_angle = min(self.min_angle, primary_angle)
        self.max_angle = max(self.max_angle, primary_angle)

        if not is_inverted:
            # High angle (start) -> Low angle (inflection) -> High angle (lockout)
            if self.phase == MovementPhase.IDLE:
                if primary_angle >= cfg["start_thresh"]:
                    self.phase = MovementPhase.START
                    self.rep_start_time = timestamp
                    self.min_angle = primary_angle
                    self.max_angle = primary_angle

            elif self.phase == MovementPhase.START:
                if primary_angle <= (cfg["start_thresh"] - 12.0):
                    self.phase = MovementPhase.ECCENTRIC
                    self.eccentric_start_time = timestamp

            elif self.phase == MovementPhase.ECCENTRIC:
                if primary_angle <= cfg["inflection_thresh"]:
                    self.phase = MovementPhase.INFLECTION
                    self.inflection_time = timestamp
                elif primary_angle >= cfg["start_thresh"] and (timestamp - self.eccentric_start_time > 2.5):
                    # Aborted movement
                    self.phase = MovementPhase.START
                    self.min_angle = primary_angle

            elif self.phase == MovementPhase.INFLECTION:
                if primary_angle >= (cfg["inflection_thresh"] + 15.0):
                    self.phase = MovementPhase.CONCENTRIC
                    self.concentric_start_time = timestamp

            elif self.phase == MovementPhase.CONCENTRIC:
                if primary_angle >= cfg["lockout_thresh"]:
                    rep_duration = timestamp - self.rep_start_time
                    rom = self.max_angle - self.min_angle
                    ecc_sec = self.inflection_time - self.eccentric_start_time if self.inflection_time > 0 else 0.0
                    con_sec = timestamp - self.concentric_start_time if self.concentric_start_time > 0 else 0.0

                    # Strict Validation Guard: Must satisfy ROM and Duration constraints
                    if (rom >= cfg["min_rom"] and 
                        rep_duration >= cfg["min_duration"] and 
                        ecc_sec >= cfg["min_ecc_duration"] and 
                        con_sec >= cfg["min_con_duration"]):
                        
                        self.rep_count += 1
                        rep_completed = True
                        
                        completed_metric = RepMetric(
                            rep_number=self.rep_count,
                            duration_sec=round(rep_duration, 1),
                            concentric_sec=round(con_sec, 1),
                            eccentric_sec=round(ecc_sec, 1),
                            min_primary_angle=round(self.min_angle, 1),
                            max_primary_angle=round(self.max_angle, 1),
                            form_score=round(current_form_score, 1),
                            warnings=list(self.current_rep_warnings),
                            tempo_ratio=round(ecc_sec / max(0.1, con_sec), 2)
                        )
                        if current_form_score >= 65.0:
                            self.valid_reps += 1
                        self.rep_history.append(completed_metric)

                    # Reset tracking for next rep
                    self.current_rep_warnings.clear()
                    self.min_angle = primary_angle
                    self.max_angle = primary_angle
                    self.rep_start_time = timestamp
                    self.phase = MovementPhase.START

        else:
            # Shoulder Press (Low -> High -> Low)
            if self.phase == MovementPhase.IDLE:
                if primary_angle <= cfg["start_thresh"]:
                    self.phase = MovementPhase.START
                    self.rep_start_time = timestamp
                    self.min_angle = primary_angle
                    self.max_angle = primary_angle

            elif self.phase == MovementPhase.START:
                if primary_angle >= (cfg["start_thresh"] + 15.0):
                    self.phase = MovementPhase.CONCENTRIC
                    self.concentric_start_time = timestamp

            elif self.phase == MovementPhase.CONCENTRIC:
                if primary_angle >= cfg["inflection_thresh"]:
                    self.phase = MovementPhase.INFLECTION
                    self.inflection_time = timestamp

            elif self.phase == MovementPhase.INFLECTION:
                if primary_angle <= (cfg["inflection_thresh"] - 15.0):
                    self.phase = MovementPhase.ECCENTRIC
                    self.eccentric_start_time = timestamp

            elif self.phase == MovementPhase.ECCENTRIC:
                if primary_angle <= cfg["lockout_thresh"]:
                    rep_duration = timestamp - self.rep_start_time
                    rom = self.max_angle - self.min_angle
                    con_sec = self.inflection_time - self.concentric_start_time if self.inflection_time > 0 else 0.0
                    ecc_sec = timestamp - self.eccentric_start_time if self.eccentric_start_time > 0 else 0.0

                    if (rom >= cfg["min_rom"] and 
                        rep_duration >= cfg["min_duration"] and 
                        con_sec >= cfg["min_con_duration"] and 
                        ecc_sec >= cfg["min_ecc_duration"]):
                        
                        self.rep_count += 1
                        rep_completed = True
                        completed_metric = RepMetric(
                            rep_number=self.rep_count,
                            duration_sec=round(rep_duration, 1),
                            concentric_sec=round(con_sec, 1),
                            eccentric_sec=round(ecc_sec, 1),
                            min_primary_angle=round(self.min_angle, 1),
                            max_primary_angle=round(self.max_angle, 1),
                            form_score=round(current_form_score, 1),
                            warnings=list(self.current_rep_warnings),
                            tempo_ratio=round(ecc_sec / max(0.1, con_sec), 2)
                        )
                        if current_form_score >= 65.0:
                            self.valid_reps += 1
                        self.rep_history.append(completed_metric)

                    self.current_rep_warnings.clear()
                    self.min_angle = primary_angle
                    self.max_angle = primary_angle
                    self.rep_start_time = timestamp
                    self.phase = MovementPhase.START

        return self.phase, rep_completed, completed_metric

    def calculate_depth_percentage(self, primary_angle: float) -> float:
        cfg = self.configs.get(self.exercise, self.configs[ExerciseType.SQUAT])
        start = cfg["start_thresh"]
        target = cfg["inflection_thresh"]
        
        if self.exercise == ExerciseType.SHOULDER_PRESS:
            depth = (primary_angle - start) / max(1.0, (target - start)) * 100.0
        else:
            depth = (start - primary_angle) / max(1.0, (start - target)) * 100.0
            
        return float(max(0.0, min(100.0, depth)))
