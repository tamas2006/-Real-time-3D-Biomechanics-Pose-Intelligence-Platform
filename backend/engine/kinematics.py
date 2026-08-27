"""
Kinematic & Vector Geometry Module for Biomechanical Angle Calculations and Smoothing.
"""
from typing import Tuple, List, Dict, Optional
import numpy as np
import math
import time

class OneEuroFilter:
    """
    1-Euro Filter for adaptive jitter reduction and low-latency smoothing of landmark coordinates.
    """
    def __init__(self, t0: float, x0: float, dx0: float = 0.0, min_cutoff: float = 1.0, beta: float = 0.007, d_cutoff: float = 1.0):
        self.min_cutoff = float(min_cutoff)
        self.beta = float(beta)
        self.d_cutoff = float(d_cutoff)
        self.x_prev = float(x0)
        self.dx_prev = float(dx0)
        self.t_prev = float(t0)

    def _smoothing_factor(self, t_e: float, cutoff: float) -> float:
        r = 2 * math.pi * cutoff * t_e
        return r / (r + 1.0)

    def _exponential_smoothing(self, a: float, x: float, x_prev: float) -> float:
        return a * x + (1.0 - a) * x_prev

    def filter(self, t: float, x: float) -> float:
        t_e = t - self.t_prev
        if t_e <= 0.0:
            return self.x_prev

        # Filter the derivative
        a_d = self._smoothing_factor(t_e, self.d_cutoff)
        dx = (x - self.x_prev) / t_e
        dx_hat = self._exponential_smoothing(a_d, dx, self.dx_prev)

        # Adaptive cutoff frequency based on velocity
        cutoff = self.min_cutoff + self.beta * abs(dx_hat)
        a = self._smoothing_factor(t_e, cutoff)
        x_hat = self._exponential_smoothing(a, x, self.x_prev)

        self.x_prev = x_hat
        self.dx_prev = dx_hat
        self.t_prev = t
        return x_hat


class LandmarkSmoother:
    """
    Manages multi-dimensional OneEuro filters for all 33 pose landmarks.
    """
    def __init__(self, min_cutoff: float = 1.2, beta: float = 0.005):
        self.min_cutoff = min_cutoff
        self.beta = beta
        self.filters: Dict[str, OneEuroFilter] = {}

    def smooth(self, landmark_id: int, x: float, y: float, z: float, timestamp: float) -> Tuple[float, float, float]:
        kx = f"{landmark_id}_x"
        ky = f"{landmark_id}_y"
        kz = f"{landmark_id}_z"

        if kx not in self.filters:
            self.filters[kx] = OneEuroFilter(timestamp, x, min_cutoff=self.min_cutoff, beta=self.beta)
            self.filters[ky] = OneEuroFilter(timestamp, y, min_cutoff=self.min_cutoff, beta=self.beta)
            self.filters[kz] = OneEuroFilter(timestamp, z, min_cutoff=self.min_cutoff, beta=self.beta)

        sx = self.filters[kx].filter(timestamp, x)
        sy = self.filters[ky].filter(timestamp, y)
        sz = self.filters[kz].filter(timestamp, z)
        return sx, sy, sz


def calculate_angle_2d(a: Tuple[float, float], b: Tuple[float, float], c: Tuple[float, float]) -> float:
    """
    Calculates the 2D interior angle (in degrees) at vertex b formed by points a-b-c.
    Point structure: (x, y)
    """
    ba = np.array([a[0] - b[0], a[1] - b[1]], dtype=np.float32)
    bc = np.array([c[0] - b[0], c[1] - b[1]], dtype=np.float32)

    norm_ba = np.linalg.norm(ba)
    norm_bc = np.linalg.norm(bc)

    if norm_ba == 0.0 or norm_bc == 0.0:
        return 0.0

    cosine_angle = np.dot(ba, bc) / (norm_ba * norm_bc)
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
    angle = np.degrees(np.arccos(cosine_angle))
    return float(angle)


def calculate_angle_3d(a: Tuple[float, float, float], b: Tuple[float, float, float], c: Tuple[float, float, float]) -> float:
    """
    Calculates the 3D spatial angle (in degrees) at vertex b formed by vectors BA and BC.
    Point structure: (x, y, z)
    """
    ba = np.array([a[0] - b[0], a[1] - b[1], a[2] - b[2]], dtype=np.float32)
    bc = np.array([c[0] - b[0], c[1] - b[1], c[2] - b[2]], dtype=np.float32)

    norm_ba = np.linalg.norm(ba)
    norm_bc = np.linalg.norm(bc)

    if norm_ba == 0.0 or norm_bc == 0.0:
        return 0.0

    cosine_angle = np.dot(ba, bc) / (norm_ba * norm_bc)
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
    angle = np.degrees(np.arccos(cosine_angle))
    return float(angle)


class KinematicsEngine:
    @staticmethod
    def calculate_torso_angle_from_vertical(shoulder: Tuple[float, float, float], hip: Tuple[float, float, float]) -> float:
        dx = hip[0] - shoulder[0]
        dy = hip[1] - shoulder[1]
        mag = math.sqrt(dx * dx + dy * dy)
        if mag == 0:
            return 0.0
        cosine = max(-1.0, min(1.0, (dy * 1.0) / mag))
        return math.degrees(math.acos(cosine))

    @staticmethod
    def calculate_3d_angle(a, b, c):
        return calculate_angle_3d(a, b, c)

    @staticmethod
    def validate_posture_prerequisites(exercise: str, landmarks: List[Dict[str, float]]) -> Tuple[bool, str, float]:
        lm = landmarks
        if len(lm) < 33:
            return False, "Insufficient landmarks", 0.0

        if exercise == "pushup":
            vis_upper = (lm[11]["visibility"] + lm[12]["visibility"] + lm[13]["visibility"] + lm[14]["visibility"]) / 4.0
            vis_hips = (lm[23]["visibility"] + lm[24]["visibility"]) / 2.0

            if vis_upper < 0.45:
                return False, "Position camera to see upper body & arms", 0.0

            mid_shoulder = ((lm[11]["x"] + lm[12]["x"]) / 2.0, (lm[11]["y"] + lm[12]["y"]) / 2.0, 0.0)
            mid_hip = ((lm[23]["x"] + lm[24]["x"]) / 2.0, (lm[23]["y"] + lm[24]["y"]) / 2.0, 0.0)
            torso_angle = KinematicsEngine.calculate_torso_angle_from_vertical(mid_shoulder, mid_hip)

            if torso_angle < 40.0 and vis_hips > 0.40:
                return False, "Posture Mismatch: Assume horizontal push-up position on floor", 0.0

            l_elbow = KinematicsEngine.calculate_3d_angle(
                (lm[11]["x"], lm[11]["y"], lm[11]["z"]),
                (lm[13]["x"], lm[13]["y"], lm[13]["z"]),
                (lm[15]["x"], lm[15]["y"], lm[15]["z"])
            )
            r_elbow = KinematicsEngine.calculate_3d_angle(
                (lm[12]["x"], lm[12]["y"], lm[12]["z"]),
                (lm[14]["x"], lm[14]["y"], lm[14]["z"]),
                (lm[16]["x"], lm[16]["y"], lm[16]["z"])
            )
            angle = l_elbow if lm[13]["visibility"] >= lm[14]["visibility"] else r_elbow
            return True, "Optimal Push-Up Posture", angle

        elif exercise == "squat":
            vis_legs_l = (lm[23]["visibility"] + lm[25]["visibility"] + lm[27]["visibility"]) / 3.0
            vis_legs_r = (lm[24]["visibility"] + lm[26]["visibility"] + lm[28]["visibility"]) / 3.0

            if vis_legs_l < 0.55 and vis_legs_r < 0.55:
                return False, "Step back: Entire legs & hips must be in frame", 0.0

            active_hip_y = lm[23]["y"] if vis_legs_l >= vis_legs_r else lm[24]["y"]
            active_knee_y = lm[25]["y"] if vis_legs_l >= vis_legs_r else lm[26]["y"]
            active_ankle_y = lm[27]["y"] if vis_legs_l >= vis_legs_r else lm[28]["y"]

            if active_knee_y <= active_hip_y - 0.05 or active_ankle_y <= active_knee_y - 0.05:
                return False, "Stand upright in front of camera to begin squat", 0.0

            l_knee = KinematicsEngine.calculate_3d_angle(
                (lm[23]["x"], lm[23]["y"], lm[23]["z"]),
                (lm[25]["x"], lm[25]["y"], lm[25]["z"]),
                (lm[27]["x"], lm[27]["y"], lm[27]["z"])
            )
            r_knee = KinematicsEngine.calculate_3d_angle(
                (lm[24]["x"], lm[24]["y"], lm[24]["z"]),
                (lm[26]["x"], lm[26]["y"], lm[26]["z"]),
                (lm[28]["x"], lm[28]["y"], lm[28]["z"])
            )
            angle = l_knee if vis_legs_l >= vis_legs_r else r_knee
            return True, "Optimal Squat Stance", angle

        elif exercise == "bicep_curl":
            vis_l = (lm[11]["visibility"] + lm[13]["visibility"] + lm[15]["visibility"]) / 3.0
            vis_r = (lm[12]["visibility"] + lm[14]["visibility"] + lm[16]["visibility"]) / 3.0

            if vis_l < 0.50 and vis_r < 0.50:
                return False, "Keep upper body & arms in camera frame", 0.0

            l_elbow = KinematicsEngine.calculate_3d_angle(
                (lm[11]["x"], lm[11]["y"], lm[11]["z"]),
                (lm[13]["x"], lm[13]["y"], lm[13]["z"]),
                (lm[15]["x"], lm[15]["y"], lm[15]["z"])
            )
            r_elbow = KinematicsEngine.calculate_3d_angle(
                (lm[12]["x"], lm[12]["y"], lm[12]["z"]),
                (lm[14]["x"], lm[14]["y"], lm[14]["z"]),
                (lm[16]["x"], lm[16]["y"], lm[16]["z"])
            )
            angle = l_elbow if (l_elbow < r_elbow and vis_l >= 0.50) else (r_elbow if vis_r >= 0.50 else l_elbow)
            return True, "Optimal Curl Alignment", angle

        return True, "Ready", 180.0


def calculate_vertical_inclination(a: Tuple[float, float], b: Tuple[float, float]) -> float:
    """
    Calculates the angle (degrees) of vector AB relative to the vertical line (spine tilt / torso lean).
    0 degrees = perfectly vertical.
    """
    dx = a[0] - b[0]
    dy = a[1] - b[1] # Note: in image coords, y points down
    angle = math.degrees(math.atan2(abs(dx), abs(dy)))
    return float(angle)
