"""
ML Model Training Pipeline for Exercise Classification and Biomechanical Recognition.
Trains, evaluates, and exports a production-ready model bundle to ml/models/exercise_classifier.joblib.
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import joblib
import time
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

from ml.dataset_generator import DatasetGenerator

def train_and_export():
    print("=" * 60)
    print("STEP 1: Generating Kinematic & Biomechanical Dataset...")
    print("=" * 60)
    
    generator = DatasetGenerator(samples_per_class=1500)
    X, y = generator.generate_dataset()
    print(f"Dataset generated: {X.shape[0]} total samples, {X.shape[1]} features each.")

    # Encode target labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    print("\nClass Distribution:")
    for idx, class_name in enumerate(label_encoder.classes_):
        count = np.sum(y_encoded == idx)
        print(f"  [{idx}] {class_name:15s}: {count} samples")

    # Stratified Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.20, random_state=42, stratify=y_encoded
    )
    print(f"\nTrain set: {X_train.shape[0]} samples | Test set: {X_test.shape[0]} samples")

    print("\n" + "=" * 60)
    print("STEP 2: Training & Benchmarking Candidate ML Architectures...")
    print("=" * 60)

    models = {
        "Random Forest (150 Estimators)": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", RandomForestClassifier(n_estimators=150, max_depth=16, random_state=42, n_jobs=-1))
        ]),
        "Histogram Gradient Boosting": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", HistGradientBoostingClassifier(max_iter=120, random_state=42))
        ]),
        "Multi-Layer Perceptron (Deep Neural Net)": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=250, random_state=42, early_stopping=True))
        ])
    }

    best_name = None
    best_pipeline = None
    best_score = 0.0

    for name, pipeline in models.items():
        t0 = time.time()
        pipeline.fit(X_train, y_train)
        train_time = time.time() - t0
        
        y_pred = pipeline.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        print(f"-> {name:40s} | Test Accuracy: {acc * 100:.2f}% | Training Time: {train_time:.2f}s")
        
        if acc > best_score:
            best_score = acc
            best_name = name
            best_pipeline = pipeline

    print("\n" + "=" * 60)
    print(f"STEP 3: Selected Champion Model: {best_name} ({best_score * 100:.2f}%)")
    print("=" * 60)

    # Detailed Evaluation
    y_pred_best = best_pipeline.predict(X_test)
    print("\nClassification Report on Unseen Test Data:")
    print(classification_report(y_test, y_pred_best, target_names=label_encoder.classes_, digits=4))

    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred_best))

    # Save Model Bundle
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(models_dir, exist_ok=True)
    model_path = os.path.join(models_dir, "exercise_classifier.joblib")

    model_bundle = {
        "model": best_pipeline,
        "label_encoder": label_encoder,
        "feature_count": X.shape[1],
        "classes": list(label_encoder.classes_),
        "test_accuracy": best_score,
        "trained_timestamp": time.time()
    }

    joblib.dump(model_bundle, model_path)
    print(f"\nSuccessfully exported trained ML model to:\n-> {model_path}")
    return model_path

if __name__ == "__main__":
    train_and_export()
