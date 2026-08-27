"""
Robust Biomechanical Form Analysis & Error Detection Engine.
Calculates joint angles, valgus/varus deviation, spine neutrality, and generates actionable voice/visual cues.
"""
from typing import Dict, List, Tuple, Optional
from backend.schemas.telemetry import ExerciseType, FormWarning, Landmark
from backend.engine.kinematics import calculate_angle_2d, calculate_angle_3d, calculate_vertical_inclination

# MediaPipe 33 Landmark Indices
NOSE = 0
LEFT_SHOULDER = 11
RIGHT_SHOULDER = 12
LEFT_ELBOW = 13
RIGHT_ELBOW = 14
LEFT_WRIST = 15
RIGHT_WRIST = 16
LEFT_HIP = 23
RIGHT_HIP = 24
LEFT_KNEE = 25
RIGHT_KNEE = 26
LEFT_ANKLE = 27
RIGHT_ANKLE = 28

class FormEvaluator:
    def __init__(self):
        self.last_voice_cue_time = 0.0
        self.last_cue = ""

    def evaluate(self, exercise: ExerciseType, landmarks: List[Landmark], timestamp: float) -> Tuple[float, Optional[float], float, List[FormWarning], Optional[str]]:
        # Map: id -> (x, y, z, visibility)
        lm_map: Dict[int, Tuple[float, float, float, float]] = {
            lm.id: (lm.x, lm.y, lm.z, lm.visibility) for lm in landmarks
        }

        if exercise == ExerciseType.SQUAT:
            return self._evaluate_squat(lm_map, timestamp)
        elif exercise == ExerciseType.PUSHUP:
            return self._evaluate_pushup(lm_map, timestamp)
        elif exercise == ExerciseType.BICEP_CURL:
            return self._evaluate_bicep_curl(lm_map, timestamp)
        elif exercise == ExerciseType.LUNGE:
            return self._evaluate_lunge(lm_map, timestamp)
        elif exercise == ExerciseType.SHOULDER_PRESS:
            return self._evaluate_shoulder_press(lm_map, timestamp)
        elif exercise == ExerciseType.PLANK:
            return self._evaluate_plank(lm_map, timestamp)
        else:
            return 180.0, None, 100.0, [], None

    def _has_points(self, lm: Dict[int, Tuple[float, float, float, float]], ids: List[int], thresh: float = 0.25) -> bool:
        for idx in ids:
            if idx not in lm or lm[idx][3] < thresh:
                return False
        return True

    def _get_3d(self, lm: Dict[int, Tuple[float, float, float, float]], idx: int) -> Tuple[float, float, float]:
        val = lm.get(idx, (0.0, 0.0, 0.0, 0.0))
        return val[0], val[1], val[2]

    def _get_2d(self, lm: Dict[int, Tuple[float, float, float, float]], idx: int) -> Tuple[float, float]:
        val = lm.get(idx, (0.0, 0.0, 0.0, 0.0))
        return val[0], val[1]

    def _evaluate_squat(self, lm: Dict[int, Tuple[float, float, float, float]], timestamp: float):
        warnings: List[FormWarning] = []
        score = 100.0

        # Choose more visible leg
        has_l = self._has_points(lm, [LEFT_HIP, LEFT_KNEE, LEFT_ANKLE])
        has_r = self._has_points(lm, [RIGHT_HIP, RIGHT_KNEE, RIGHT_ANKLE])

        if not has_l and not has_r:
            return 180.0, None, 50.0, [FormWarning(code="STEP_BACK", message="Step back so your legs are visible", severity="info")], None

        use_left = has_l
        h_idx = LEFT_HIP if use_left else RIGHT_HIP
        k_idx = LEFT_KNEE if use_left else RIGHT_KNEE
        a_idx = LEFT_ANKLE if use_left else RIGHT_ANKLE
        s_idx = LEFT_SHOULDER if use_left else RIGHT_SHOULDER

        hip = self._get_3d(lm, h_idx)
        knee = self._get_3d(lm, k_idx)
        ankle = self._get_3d(lm, a_idx)

        knee_angle = calculate_angle_3d(hip, knee, ankle)
        hip_angle = None

        if self._has_points(lm, [s_idx]):
            shoulder = self._get_3d(lm, s_idx)
            hip_angle = calculate_angle_3d(shoulder, hip, knee)
            torso_lean = calculate_vertical_inclination(self._get_2d(lm, s_idx), self._get_2d(lm, h_idx))
            if torso_lean > 45.0 and knee_angle < 120:
                warnings.append(FormWarning(code="CHEST_UP", message="Keep your chest up", severity="warning"))
                score -= 15.0

        # Check Knee Valgus (Knees caving in)
        if self._has_points(lm, [LEFT_KNEE, RIGHT_KNEE, LEFT_ANKLE, RIGHT_ANKLE]):
            k_spread = abs(lm[LEFT_KNEE][0] - lm[RIGHT_KNEE][0])
            a_spread = abs(lm[LEFT_ANKLE][0] - lm[RIGHT_ANKLE][0])
            if a_spread > 0.12 and k_spread < (a_spread * 0.72) and knee_angle < 125:
                warnings.append(FormWarning(code="KNEES_OUT", message="Push knees out", severity="warning"))
                score -= 15.0

        voice_cue = self._select_voice_cue(warnings, timestamp)
        return knee_angle, hip_angle, max(0.0, score), warnings, voice_cue

    def _evaluate_bicep_curl(self, lm: Dict[int, Tuple[float, float, float, float]], timestamp: float):
        warnings: List[FormWarning] = []
        score = 100.0

        has_l = self._has_points(lm, [LEFT_SHOULDER, LEFT_ELBOW, LEFT_WRIST])
        has_r = self._has_points(lm, [RIGHT_SHOULDER, RIGHT_ELBOW, RIGHT_WRIST])

        if not has_l and not has_r:
            return 180.0, None, 50.0, [FormWarning(code="ARMS_VISIBLE", message="Position upper body and arms in frame", severity="info")], None

        angle_l = calculate_angle_3d(self._get_3d(lm, LEFT_SHOULDER), self._get_3d(lm, LEFT_ELBOW), self._get_3d(lm, LEFT_WRIST)) if has_l else 180.0
        angle_r = calculate_angle_3d(self._get_3d(lm, RIGHT_SHOULDER), self._get_3d(lm, RIGHT_ELBOW), self._get_3d(lm, RIGHT_WRIST)) if has_r else 180.0

        # Active arm is the one flexing
        if has_r and (not has_l or angle_r < angle_l):
            primary_angle = angle_r
            secondary_angle = angle_l
            active_s, active_e, active_h = RIGHT_SHOULDER, RIGHT_ELBOW, RIGHT_HIP
        else:
            primary_angle = angle_l
            secondary_angle = angle_r
            active_s, active_e, active_h = LEFT_SHOULDER, LEFT_ELBOW, LEFT_HIP

        # Check elbow drift / swinging if hip is visible
        if self._has_points(lm, [active_h]):
            drift = calculate_angle_2d(self._get_2d(lm, active_s), self._get_2d(lm, active_e), self._get_2d(lm, active_h))
            if drift > 40.0 and primary_angle < 130:
                warnings.append(FormWarning(code="PIN_ELBOWS", message="Keep elbows pinned to your sides", severity="warning"))
                score -= 15.0

        voice_cue = self._select_voice_cue(warnings, timestamp)
        return primary_angle, secondary_angle, max(0.0, score), warnings, voice_cue

    def _evaluate_pushup(self, lm: Dict[int, Tuple[float, float, float, float]], timestamp: float):
        warnings: List[FormWarning] = []
        score = 100.0

        has_l = self._has_points(lm, [LEFT_SHOULDER, LEFT_ELBOW, LEFT_WRIST])
        has_r = self._has_points(lm, [RIGHT_SHOULDER, RIGHT_ELBOW, RIGHT_WRIST])

        if not has_l and not has_r:
            return 180.0, None, 50.0, [FormWarning(code="BODY_VISIBLE", message="Ensure side plank view is in camera", severity="info")], None

        use_left = has_l
        s_idx = LEFT_SHOULDER if use_left else RIGHT_SHOULDER
        e_idx = LEFT_ELBOW if use_left else RIGHT_ELBOW
        w_idx = LEFT_WRIST if use_left else RIGHT_WRIST
        h_idx = LEFT_HIP if use_left else RIGHT_HIP
        a_idx = LEFT_ANKLE if use_left else RIGHT_ANKLE

        elbow_angle = calculate_angle_3d(self._get_3d(lm, s_idx), self._get_3d(lm, e_idx), self._get_3d(lm, w_idx))
        body_line = None

        if self._has_points(lm, [h_idx, a_idx]):
            body_line = calculate_angle_3d(self._get_3d(lm, s_idx), self._get_3d(lm, h_idx), self._get_3d(lm, a_idx))
            if body_line < 150.0:
                warnings.append(FormWarning(code="CORE_BRACE", message="Engage core, maintain straight plank", severity="warning"))
                score -= 20.0

        voice_cue = self._select_voice_cue(warnings, timestamp)
        return elbow_angle, body_line, max(0.0, score), warnings, voice_cue

    def _evaluate_shoulder_press(self, lm: Dict[int, Tuple[float, float, float, float]], timestamp: float):
        warnings: List[FormWarning] = []
        score = 100.0

        has_l = self._has_points(lm, [LEFT_SHOULDER, LEFT_ELBOW, LEFT_WRIST])
        has_r = self._has_points(lm, [RIGHT_SHOULDER, RIGHT_ELBOW, RIGHT_WRIST])

        if not has_l and not has_r:
            return 90.0, None, 50.0, [FormWarning(code="UPPER_BODY_VISIBLE", message="Position upper body in camera", severity="info")], None

        angle_l = calculate_angle_3d(self._get_3d(lm, LEFT_SHOULDER), self._get_3d(lm, LEFT_ELBOW), self._get_3d(lm, LEFT_WRIST)) if has_l else 90.0
        angle_r = calculate_angle_3d(self._get_3d(lm, RIGHT_SHOULDER), self._get_3d(lm, RIGHT_ELBOW), self._get_3d(lm, RIGHT_WRIST)) if has_r else 90.0

        primary_angle = (angle_l + angle_r) / 2.0 if (has_l and has_r) else (angle_l if has_l else angle_r)
        asym = abs(angle_l - angle_r) if (has_l and has_r) else 0.0

        if asym > 28.0:
            warnings.append(FormWarning(code="EVEN_PRESS", message="Press evenly with both arms", severity="warning"))
            score -= 15.0

        voice_cue = self._select_voice_cue(warnings, timestamp)
        return primary_angle, asym, max(0.0, score), warnings, voice_cue

    def _evaluate_lunge(self, lm: Dict[int, Tuple[float, float, float, float]], timestamp: float):
        warnings: List[FormWarning] = []
        score = 100.0

        has_l = self._has_points(lm, [LEFT_HIP, LEFT_KNEE, LEFT_ANKLE])
        has_r = self._has_points(lm, [RIGHT_HIP, RIGHT_KNEE, RIGHT_ANKLE])

        if not has_l and not has_r:
            return 180.0, None, 50.0, [FormWarning(code="LEGS_VISIBLE", message="Position lower body in camera", severity="info")], None

        k_l = calculate_angle_3d(self._get_3d(lm, LEFT_HIP), self._get_3d(lm, LEFT_KNEE), self._get_3d(lm, LEFT_ANKLE)) if has_l else 180.0
        k_r = calculate_angle_3d(self._get_3d(lm, RIGHT_HIP), self._get_3d(lm, RIGHT_KNEE), self._get_3d(lm, RIGHT_ANKLE)) if has_r else 180.0

        front_knee = min(k_l, k_r)
        back_knee = max(k_l, k_r)

        voice_cue = self._select_voice_cue(warnings, timestamp)
        return front_knee, back_knee, max(0.0, score), warnings, voice_cue

    def _evaluate_plank(self, lm: Dict[int, Tuple[float, float, float, float]], timestamp: float):
        warnings: List[FormWarning] = []
        score = 100.0

        if self._has_points(lm, [LEFT_SHOULDER, LEFT_HIP, LEFT_ANKLE]):
            body_line = calculate_angle_3d(self._get_3d(lm, LEFT_SHOULDER), self._get_3d(lm, LEFT_HIP), self._get_3d(lm, LEFT_ANKLE))
        elif self._has_points(lm, [RIGHT_SHOULDER, RIGHT_HIP, RIGHT_ANKLE]):
            body_line = calculate_angle_3d(self._get_3d(lm, RIGHT_SHOULDER), self._get_3d(lm, RIGHT_HIP), self._get_3d(lm, RIGHT_ANKLE))
        else:
            return 180.0, None, 50.0, [FormWarning(code="PLANK_VIEW", message="Show full body side view for plank", severity="info")], None

        if body_line < 155.0:
            warnings.append(FormWarning(code="PLANK_ALIGN", message="Keep body in a straight line", severity="warning"))
            score -= 20.0

        voice_cue = self._select_voice_cue(warnings, timestamp)
        return body_line, None, max(0.0, score), warnings, voice_cue

    def _select_voice_cue(self, warnings: List[FormWarning], timestamp: float) -> Optional[str]:
        if not warnings:
            return None
        cue = warnings[0].message
        if cue != self.last_cue and (timestamp - self.last_voice_cue_time > 3.0):
            self.last_cue = cue
            self.last_voice_cue_time = timestamp
            return cue
        return None
