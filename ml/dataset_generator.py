"""
Industrial-Scale Kinematic Dataset Generator with 3D Spatial Rotations & Anthropometric Augmentation.
Generates 70,000+ biomechanically rigorous, multi-phase labeled samples across 7 movement classes.
"""
from typing import List, Dict, Tuple
import numpy as np
import math
import os
import pandas as pd
from ml.feature_extractor import PoseFeatureExtractor

class BigDatasetGenerator:
    def __init__(self, samples_per_class: int = 10000):
        self.samples_per_class = samples_per_class
        self.extractor = PoseFeatureExtractor()
        self.classes = ["squat", "pushup", "bicep_curl", "lunge", "shoulder_press", "plank", "idle"]

    def _apply_3d_rotation(self, points: np.ndarray, yaw_deg: float, pitch_deg: float, roll_deg: float) -> np.ndarray:
        # Convert to radians
        yaw = math.radians(yaw_deg)
        pitch = math.radians(pitch_deg)
        roll = math.radians(roll_deg)

        # Rotation Matrices
        R_yaw = np.array([
            [math.cos(yaw), 0, math.sin(yaw)],
            [0, 1, 0],
            [-math.sin(yaw), 0, math.cos(yaw)]
        ], dtype=np.float32)

        R_pitch = np.array([
            [1, 0, 0],
            [0, math.cos(pitch), -math.sin(pitch)],
            [0, math.sin(pitch), math.cos(pitch)]
        ], dtype=np.float32)

        R_roll = np.array([
            [math.cos(roll), -math.sin(roll), 0],
            [math.sin(roll), math.cos(roll), 0],
            [0, 0, 1]
        ], dtype=np.float32)

        R = R_roll @ R_pitch @ R_yaw
        center = np.mean(points, axis=0)
        return (points - center) @ R.T + center

    def _generate_base_skeleton(self, height_scale: float = 1.0, limb_ratio: float = 1.0) -> np.ndarray:
        skel = np.zeros((33, 3), dtype=np.float32)
        
        # Torso & Hips
        skel[23] = [0.46, 0.60 * height_scale, 0.0] # L_HIP
        skel[24] = [0.54, 0.60 * height_scale, 0.0] # R_HIP
        skel[11] = [0.43, 0.35 * height_scale, 0.0] # L_SHOULDER
        skel[12] = [0.57, 0.35 * height_scale, 0.0] # R_SHOULDER
        skel[0]  = [0.50, 0.22 * height_scale, 0.0] # NOSE
        
        # Arms
        skel[13] = [0.41, 0.48 * height_scale * limb_ratio, 0.0] # L_ELBOW
        skel[14] = [0.59, 0.48 * height_scale * limb_ratio, 0.0] # R_ELBOW
        skel[15] = [0.40, 0.60 * height_scale * limb_ratio, 0.0] # L_WRIST
        skel[16] = [0.60, 0.60 * height_scale * limb_ratio, 0.0] # R_WRIST
        
        # Legs
        skel[25] = [0.46, 0.78 * height_scale * limb_ratio, 0.0] # L_KNEE
        skel[26] = [0.54, 0.78 * height_scale * limb_ratio, 0.0] # R_KNEE
        skel[27] = [0.46, 0.95 * height_scale, 0.0] # L_ANKLE
        skel[28] = [0.54, 0.95 * height_scale, 0.0] # R_ANKLE
        return skel

    def generate_dataset(self) -> Tuple[np.ndarray, np.ndarray]:
        X_data = []
        y_labels = []

        np.random.seed(42)

        for label in self.classes:
            for _ in range(self.samples_per_class):
                h_scale = np.random.uniform(0.80, 1.20)
                l_ratio = np.random.uniform(0.88, 1.12)
                skel = self._generate_base_skeleton(h_scale, l_ratio)

                # Camera angle variations
                yaw = np.random.uniform(-25.0, 25.0)
                pitch = np.random.uniform(-15.0, 15.0)
                roll = np.random.uniform(-8.0, 8.0)

                if label == "squat":
                    depth = np.random.uniform(0.0, 1.0)
                    skel[23, 1] += 0.22 * depth
                    skel[24, 1] += 0.22 * depth
                    skel[23, 2] -= 0.18 * depth
                    skel[24, 2] -= 0.18 * depth
                    skel[25, 1] += 0.06 * depth
                    skel[26, 1] += 0.06 * depth
                    skel[25, 2] += 0.20 * depth
                    skel[26, 2] += 0.20 * depth
                    skel[11, 1] += 0.14 * depth
                    skel[12, 1] += 0.14 * depth
                    skel[11, 2] += 0.14 * depth
                    skel[12, 2] += 0.14 * depth

                elif label == "pushup":
                    depth = np.random.uniform(0.0, 1.0)
                    skel[11] = [0.35, 0.65 + 0.12 * depth, 0.0]
                    skel[12] = [0.45, 0.65 + 0.12 * depth, 0.0]
                    skel[23] = [0.35, 0.68 + 0.06 * depth, -0.42]
                    skel[24] = [0.45, 0.68 + 0.06 * depth, -0.42]
                    skel[25] = [0.35, 0.70, -0.72]
                    skel[26] = [0.45, 0.70, -0.72]
                    skel[27] = [0.35, 0.72, -0.92]
                    skel[28] = [0.45, 0.72, -0.92]
                    skel[15] = [0.28, 0.80, 0.0]
                    skel[16] = [0.52, 0.80, 0.0]
                    skel[13] = [0.22 - 0.10 * depth, 0.73, 0.0]
                    skel[14] = [0.58 + 0.10 * depth, 0.73, 0.0]

                elif label == "bicep_curl":
                    phase = np.random.uniform(0.05, 1.0)
                    skel[15, 1] -= (0.26 * phase)
                    skel[16, 1] -= (0.26 * phase)
                    skel[15, 2] += (0.16 * phase)
                    skel[16, 2] += (0.16 * phase)

                elif label == "lunge":
                    depth = np.random.uniform(0.2, 1.0)
                    skel[25] = [0.46, 0.75 + 0.10 * depth, 0.38]
                    skel[27] = [0.46, 0.95, 0.38]
                    skel[26] = [0.54, 0.84 + 0.10 * depth, -0.38]
                    skel[28] = [0.54, 0.95, -0.48]
                    skel[23, 1] += 0.18 * depth
                    skel[24, 1] += 0.18 * depth

                elif label == "shoulder_press":
                    phase = np.random.uniform(0.05, 1.0)
                    skel[15] = [0.38 - 0.03 * phase, 0.40 - (0.32 * phase), 0.0]
                    skel[16] = [0.62 + 0.03 * phase, 0.40 - (0.32 * phase), 0.0]
                    skel[13] = [0.34, 0.44 - (0.20 * phase), 0.0]
                    skel[14] = [0.66, 0.44 - (0.20 * phase), 0.0]

                elif label == "plank":
                    skel[11] = [0.38, 0.70, 0.0]
                    skel[12] = [0.48, 0.70, 0.0]
                    skel[13] = [0.38, 0.82, 0.0]
                    skel[14] = [0.48, 0.82, 0.0]
                    skel[15] = [0.38, 0.82, 0.15]
                    skel[16] = [0.48, 0.82, 0.15]
                    skel[23] = [0.38, 0.69, -0.45]
                    skel[24] = [0.48, 0.69, -0.45]
                    skel[27] = [0.38, 0.70, -0.90]
                    skel[28] = [0.48, 0.70, -0.90]

                elif label == "idle":
                    shift = np.random.uniform(-0.06, 0.06)
                    skel[:, 0] += shift

                # 3D spatial rotation simulation
                skel_rotated = self._apply_3d_rotation(skel, yaw, pitch, roll)
                
                # Realistic sensor noise
                noise = np.random.normal(0, 0.015, skel.shape).astype(np.float32)
                skel_augmented = skel_rotated + noise

                features = self.extractor.extract_features(skel_augmented)
                if features is not None:
                    X_data.append(features)
                    y_labels.append(label)

        return np.array(X_data, dtype=np.float32), np.array(y_labels)

if __name__ == "__main__":
    gen = BigDatasetGenerator(samples_per_class=1000)
    X, y = gen.generate_dataset()
    print(f"Generated Big Dataset: {X.shape}, labels: {y.shape}")
