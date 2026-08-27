"""
Export Generated Dataset to CSV with Human-Readable Feature Column Headers.
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import pandas as pd
from ml.dataset_generator import DatasetGenerator

def export_csv():
    generator = DatasetGenerator(samples_per_class=1500)
    X, y = generator.generate_dataset()

    # Create descriptive column names for all 83 features
    feature_names = []
    
    # 1. 22 Key Normalized Body Landmarks (Indices 11 to 32)
    landmark_names = [
        "left_shoulder", "right_shoulder", "left_elbow", "right_elbow", "left_wrist", "right_wrist",
        "left_pinky", "right_pinky", "left_index", "right_index", "left_thumb", "right_thumb",
        "left_hip", "right_hip", "left_knee", "right_knee", "left_ankle", "right_ankle",
        "left_heel", "right_heel", "left_foot_index", "right_foot_index"
    ]
    for lm in landmark_names:
        feature_names.extend([f"norm_{lm}_x", f"norm_{lm}_y", f"norm_{lm}_z"])

    # 2. 10 3D Joint Angles
    angle_names = [
        "angle_l_knee", "angle_r_knee",
        "angle_l_hip", "angle_r_hip",
        "angle_l_elbow", "angle_r_elbow",
        "angle_l_shoulder", "angle_r_shoulder",
        "angle_l_bodyline", "angle_r_bodyline"
    ]
    feature_names.extend(angle_names)

    # 3. 7 Relational Kinematic Metrics
    rel_names = [
        "l_wrist_rel_shoulder", "r_wrist_rel_shoulder",
        "l_hip_rel_knee", "r_hip_rel_knee",
        "knee_spread", "ankle_spread", "wrist_spread"
    ]
    feature_names.extend(rel_names)

    df = pd.DataFrame(X, columns=feature_names)
    df.insert(0, "exercise_label", y)

    csv_path = os.path.join(os.path.dirname(__file__), "dataset.csv")
    df.to_csv(csv_path, index=False)
    print(f"Exported {df.shape[0]} rows and {df.shape[1]} columns to {csv_path}")
    
    # Print sample preview
    print("\nDataset Summary by Exercise (Mean Joint Angles in Degrees):")
    angle_cols = ["exercise_label", "angle_l_knee", "angle_l_hip", "angle_l_elbow", "angle_l_shoulder", "angle_l_bodyline"]
    print(df[angle_cols].groupby("exercise_label").mean().round(1).to_string())

if __name__ == "__main__":
    export_csv()
