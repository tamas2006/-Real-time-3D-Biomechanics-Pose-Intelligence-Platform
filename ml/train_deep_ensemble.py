"""
High-Visibility Deep Learning & Ensemble Training Pipeline with Live Terminal Progress.
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import pandas as pd
import joblib
import time
from tqdm import tqdm
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.ensemble import ExtraTreesClassifier, VotingClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from xgboost import XGBClassifier

from ml.dataset_generator import BigDatasetGenerator

def train_massive_ensemble():
    print("\n" + "=" * 78, flush=True)
    print("  PHASE 1: SYNTHESIZING MASSIVE 70,000-SAMPLE 3D KINEMATIC DATASET", flush=True)
    print("=" * 78, flush=True)
    
    t0_gen = time.time()
    generator = BigDatasetGenerator(samples_per_class=10000)
    
    X_data = []
    y_labels = []
    
    # Progress Bar for Dataset Generation
    with tqdm(total=len(generator.classes) * generator.samples_per_class, desc="Generating 3D Augmented Samples", unit="sample") as pbar:
        for label in generator.classes:
            for _ in range(generator.samples_per_class):
                h_scale = np.random.uniform(0.80, 1.20)
                l_ratio = np.random.uniform(0.88, 1.12)
                skel = generator._generate_base_skeleton(h_scale, l_ratio)

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

                skel_rotated = generator._apply_3d_rotation(skel, yaw, pitch, roll)
                noise = np.random.normal(0, 0.015, skel.shape).astype(np.float32)
                skel_augmented = skel_rotated + noise

                features = generator.extractor.extract_features(skel_augmented)
                if features is not None:
                    X_data.append(features)
                    y_labels.append(label)
                pbar.update(1)

    X = np.array(X_data, dtype=np.float32)
    y = np.array(y_labels)
    print(f"\n[OK] Dataset generated: {X.shape[0]:,} samples x {X.shape[1]} features (Time: {time.time() - t0_gen:.1f}s)", flush=True)

    # Encode labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    print("\nClass Balance Breakdown:")
    for idx, class_name in enumerate(label_encoder.classes_):
        count = np.sum(y_encoded == idx)
        print(f"  Class [{idx}] {class_name:<16}: {count:,} samples", flush=True)

    # Stratified Split (80% Train: 56,000 | 20% Test: 14,000)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.20, random_state=42, stratify=y_encoded
    )
    print(f"\nTrain Partition: {X_train.shape[0]:,} samples | Test Partition: {X_test.shape[0]:,} samples", flush=True)

    # Standardize
    print("\nApplying Z-Score Standardization (StandardScaler)...", flush=True)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print("\n" + "=" * 78, flush=True)
    print("  PHASE 2: TRAINING MULTI-ARCHITECTURE DEEP LEARNING ENSEMBLE", flush=True)
    print("=" * 78, flush=True)

    # 1. Deep Multi-Layer Perceptron (Neural Network)
    print("\n[MODEL 1/3] Deep Neural Network (MLP: 256 -> 128 -> 64 | Adam Optimizer)")
    print("-" * 78, flush=True)
    t0_mlp = time.time()
    mlp_model = MLPClassifier(
        hidden_layer_sizes=(256, 128, 64),
        activation="relu",
        solver="adam",
        learning_rate_init=0.0015,
        learning_rate="adaptive",
        max_iter=300,
        early_stopping=True,
        n_iter_no_change=12,
        random_state=42,
        verbose=True
    )
    mlp_model.fit(X_train_scaled, y_train)
    mlp_acc = accuracy_score(y_test, mlp_model.predict(X_test_scaled))
    print(f"--> Deep MLP Test Accuracy: {mlp_acc * 100:.3f}% (Epochs: {mlp_model.n_iter_} | Time: {time.time() - t0_mlp:.1f}s)", flush=True)

    # 2. Extreme Gradient Boosting (XGBoost)
    print("\n[MODEL 2/3] Extreme Gradient Boosting (XGBoost: 300 Estimators | Depth 8)")
    print("-" * 78, flush=True)
    t0_xgb = time.time()
    xgb_model = XGBClassifier(
        n_estimators=300,
        max_depth=8,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        tree_method="hist",
        random_state=42,
        eval_metric="mlogloss",
        n_jobs=-1
    )
    xgb_model.fit(X_train_scaled, y_train)
    xgb_acc = accuracy_score(y_test, xgb_model.predict(X_test_scaled))
    print(f"--> XGBoost Test Accuracy:  {xgb_acc * 100:.3f}% (Time: {time.time() - t0_xgb:.1f}s)", flush=True)

    # 3. ExtraTrees Classifier
    print("\n[MODEL 3/3] ExtraTrees High-Variance Classifier (250 Estimators | Depth 22)")
    print("-" * 78, flush=True)
    t0_et = time.time()
    et_model = ExtraTreesClassifier(
        n_estimators=250,
        max_depth=22,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1
    )
    et_model.fit(X_train_scaled, y_train)
    et_acc = accuracy_score(y_test, et_model.predict(X_test_scaled))
    print(f"--> ExtraTrees Test Accuracy: {et_acc * 100:.3f}% (Time: {time.time() - t0_et:.1f}s)", flush=True)

    # 4. Master Soft Voting Stacking Ensemble
    print("\n" + "=" * 78, flush=True)
    print("  PHASE 3: EVALUATING MASTER SOFT-VOTING STACKING ENSEMBLE", flush=True)
    print("=" * 78, flush=True)

    ensemble = VotingClassifier(
        estimators=[
            ("mlp", mlp_model),
            ("xgb", xgb_model),
            ("et", et_model)
        ],
        voting="soft",
        n_jobs=-1
    )
    
    full_pipeline = Pipeline([
        ("scaler", scaler),
        ("ensemble", ensemble)
    ])

    print("Calibrating Soft-Voting Ensemble over 56,000 Training Samples...", flush=True)
    full_pipeline.fit(X_train, y_train)

    y_pred = full_pipeline.predict(X_test)
    final_acc = accuracy_score(y_test, y_pred)

    print("\n" + "*" * 78, flush=True)
    print(f"  >>> MASTER ENSEMBLE FINAL TEST ACCURACY: {final_acc * 100:.3f}% <<<", flush=True)
    print("*" * 78, flush=True)

    print("\nFull Classification Report on 14,000 Unseen Test Samples:")
    print(classification_report(y_test, y_pred, target_names=label_encoder.classes_, digits=4), flush=True)

    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred), flush=True)

    # Save Model Bundle
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(models_dir, exist_ok=True)
    model_path = os.path.join(models_dir, "exercise_classifier.joblib")

    model_bundle = {
        "model": full_pipeline,
        "label_encoder": label_encoder,
        "feature_count": X.shape[1],
        "classes": list(label_encoder.classes_),
        "test_accuracy": final_acc,
        "sample_count": len(X),
        "trained_timestamp": time.time()
    }

    joblib.dump(model_bundle, model_path, compress=3)
    print(f"\n[SAVED] Champion Model saved to: {model_path}", flush=True)

    # Export dataset.csv
    csv_path = os.path.join(os.path.dirname(__file__), "dataset.csv")
    print(f"Exporting 70,000 samples to {csv_path}...", flush=True)
    
    feature_names = []
    landmark_names = [
        "left_shoulder", "right_shoulder", "left_elbow", "right_elbow", "left_wrist", "right_wrist",
        "left_pinky", "right_pinky", "left_index", "right_index", "left_thumb", "right_thumb",
        "left_hip", "right_hip", "left_knee", "right_knee", "left_ankle", "right_ankle",
        "left_heel", "right_heel", "left_foot_index", "right_foot_index"
    ]
    for lm in landmark_names:
        feature_names.extend([f"norm_{lm}_x", f"norm_{lm}_y", f"norm_{lm}_z"])
    feature_names.extend([
        "angle_l_knee", "angle_r_knee", "angle_l_hip", "angle_r_hip",
        "angle_l_elbow", "angle_r_elbow", "angle_l_shoulder", "angle_r_shoulder",
        "angle_l_bodyline", "angle_r_bodyline",
        "l_wrist_rel_shoulder", "r_wrist_rel_shoulder", "l_hip_rel_knee", "r_hip_rel_knee",
        "knee_spread", "ankle_spread", "wrist_spread"
    ])
    df = pd.DataFrame(X, columns=feature_names)
    df.insert(0, "exercise_label", y)
    df.to_csv(csv_path, index=False)
    print(f"[SAVED] Dataset CSV updated: {df.shape[0]:,} rows x {df.shape[1]} columns.\n", flush=True)

if __name__ == "__main__":
    train_massive_ensemble()
