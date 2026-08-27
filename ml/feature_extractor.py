"""
Biomechanical Feature Extractor & Scale-Invariant Pose Normalizer for ML Models.
"""
from typing import List, Dict, Tuple, Optional, Any
import numpy as np
import math

class PoseFeatureExtractor:
    """
    Transforms raw MediaPipe 33-point landmarks into a translation- and scale-invariant 
    feature vector composed of normalized coordinates and 3D joint kinematic angles.
    """
    
    LANDMARK_NAMES = [
        "nose", "left_eye_inner", "left_eye", "left_eye_outer", "right_eye_inner", "right_eye", "right_eye_outer",
        "left_ear", "right_ear", "mouth_left", "mouth_right",
        "left_shoulder", "right_shoulder", "left_elbow", "right_elbow", "left_wrist", "right_wrist",
        "left_pinky", "right_pinky", "left_index", "right_index", "left_thumb", "right_thumb",
        "left_hip", "right_hip", "left_knee", "right_knee", "left_ankle", "right_ankle",
        "left_heel", "right_heel", "left_foot_index", "right_foot_index"
    ]

    # Indices
    L_SHOULDER = 11
    R_SHOULDER = 12
    L_ELBOW = 13
    R_ELBOW = 14
    L_WRIST = 15
    R_WRIST = 16
    L_HIP = 23
    R_HIP = 24
    L_KNEE = 25
    R_KNEE = 26
    L_ANKLE = 27
    R_ANKLE = 28

    @staticmethod
    def calculate_angle_3d(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
        ba = a - b
        bc = c - b
        norm_ba = np.linalg.norm(ba)
        norm_bc = np.linalg.norm(bc)
        if norm_ba == 0.0 or norm_bc == 0.0:
            return 0.0
        cosine = np.dot(ba, bc) / (norm_ba * norm_bc)
        cosine = np.clip(cosine, -1.0, 1.0)
        return float(np.degrees(np.arccos(cosine)))

    def extract_features(self, landmarks: List[Any]) -> Optional[np.ndarray]:
        """
        Extracts invariant feature vector from a list of 33 landmarks.
        Accepts list of dicts, objects with .x, .y, .z, or (N, 3) arrays.
        """
        if len(landmarks) < 33:
            return None

        # Convert to numpy (33, 3) array
        coords = np.zeros((33, 3), dtype=np.float32)
        for i in range(33):
            lm = landmarks[i]
            if isinstance(lm, dict):
                coords[i] = [lm.get('x', 0.0), lm.get('y', 0.0), lm.get('z', 0.0)]
            elif hasattr(lm, 'x'):
                coords[i] = [lm.x, lm.y, getattr(lm, 'z', 0.0)]
            else:
                coords[i] = lm[:3]

        # 1. Origin Shift: Translate relative to Mid-Hip
        mid_hip = (coords[self.L_HIP] + coords[self.R_HIP]) / 2.0
        centered_coords = coords - mid_hip

        # 2. Scale Invariance: Normalize by Torso Length (Mid-Hip to Mid-Shoulder distance)
        mid_shoulder = (coords[self.L_SHOULDER] + coords[self.R_SHOULDER]) / 2.0
        torso_length = np.linalg.norm(mid_shoulder - mid_hip)
        if torso_length <= 1e-4:
            torso_length = 1.0 # fallback

        normalized_coords = centered_coords / torso_length

        # 3. Extract 3D Biomechanical Angles
        angles = [
            # Knee Flexion (Hip - Knee - Ankle)
            self.calculate_angle_3d(coords[self.L_HIP], coords[self.L_KNEE], coords[self.L_ANKLE]),
            self.calculate_angle_3d(coords[self.R_HIP], coords[self.R_KNEE], coords[self.R_ANKLE]),
            
            # Hip Hinge (Shoulder - Hip - Knee)
            self.calculate_angle_3d(coords[self.L_SHOULDER], coords[self.L_HIP], coords[self.L_KNEE]),
            self.calculate_angle_3d(coords[self.R_SHOULDER], coords[self.R_HIP], coords[self.R_KNEE]),
            
            # Elbow Flexion (Shoulder - Elbow - Wrist)
            self.calculate_angle_3d(coords[self.L_SHOULDER], coords[self.L_ELBOW], coords[self.L_WRIST]),
            self.calculate_angle_3d(coords[self.R_SHOULDER], coords[self.R_ELBOW], coords[self.R_WRIST]),
            
            # Shoulder Extension / Abduction (Hip - Shoulder - Elbow)
            self.calculate_angle_3d(coords[self.L_HIP], coords[self.L_SHOULDER], coords[self.L_ELBOW]),
            self.calculate_angle_3d(coords[self.R_HIP], coords[self.R_SHOULDER], coords[self.R_ELBOW]),
            
            # Body Line / Spine Alignment (Shoulder - Hip - Ankle)
            self.calculate_angle_3d(coords[self.L_SHOULDER], coords[self.L_HIP], coords[self.L_ANKLE]),
            self.calculate_angle_3d(coords[self.R_SHOULDER], coords[self.R_HIP], coords[self.R_ANKLE])
        ]

        # 4. Key Relative Distances (Normalized)
        # Wrist height relative to shoulder
        l_wrist_rel_shoulder = normalized_coords[self.L_WRIST, 1] - normalized_coords[self.L_SHOULDER, 1]
        r_wrist_rel_shoulder = normalized_coords[self.R_WRIST, 1] - normalized_coords[self.R_SHOULDER, 1]
        
        # Hip height relative to knee
        l_hip_rel_knee = normalized_coords[self.L_HIP, 1] - normalized_coords[self.L_KNEE, 1]
        r_hip_rel_knee = normalized_coords[self.R_HIP, 1] - normalized_coords[self.R_KNEE, 1]

        # Ankle and Knee distances (Coronal separation for Valgus/Stance)
        knee_spread = abs(normalized_coords[self.L_KNEE, 0] - normalized_coords[self.R_KNEE, 0])
        ankle_spread = abs(normalized_coords[self.L_ANKLE, 0] - normalized_coords[self.R_ANKLE, 0])
        wrist_spread = abs(normalized_coords[self.L_WRIST, 0] - normalized_coords[self.R_WRIST, 0])

        # Flatten upper and lower body keypoints (indices 11 through 32)
        key_body_coords = normalized_coords[11:33].flatten()

        # Combine into complete feature vector
        features = np.concatenate([
            key_body_coords,                                      # 22 points * 3 = 66 normalized coords
            np.array(angles, dtype=np.float32),                   # 10 joint angles
            np.array([
                l_wrist_rel_shoulder, r_wrist_rel_shoulder,
                l_hip_rel_knee, r_hip_rel_knee,
                knee_spread, ankle_spread, wrist_spread
            ], dtype=np.float32)                                  # 7 relative metrics
        ])

        return features
