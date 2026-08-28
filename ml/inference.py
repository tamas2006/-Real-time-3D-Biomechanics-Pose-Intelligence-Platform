"""
Sub-Millisecond Real-Time Inference Engine for Pose Classification.
"""
from typing import List, Dict, Tuple, Optional, Any
import os
import numpy as np
from ml.feature_extractor import PoseFeatureExtractor

try:
    import joblib
    JOBLIB_AVAILABLE = True
except ImportError:
    JOBLIB_AVAILABLE = False
    joblib = None

class ExerciseClassifier:
    """
    Loads the trained model bundle and performs ultra-fast real-time inference on landmark streams.
    """
    def __init__(self, model_path: Optional[str] = None):
        if model_path is None:
            model_path = os.path.join(os.path.dirname(__file__), "models", "exercise_classifier.joblib")
        
        self.model_path = model_path
        self.extractor = PoseFeatureExtractor()
        self.bundle = None
        self.model = None
        self.label_encoder = None
        self.classes = []
        self._load_model()

    def _load_model(self):
        if JOBLIB_AVAILABLE and joblib and os.path.exists(self.model_path):
            self.bundle = joblib.load(self.model_path)
            self.model = self.bundle["model"]
            self.label_encoder = self.bundle["label_encoder"]
            self.classes = self.bundle["classes"]
            print(f"[ML Inference] Loaded model from {self.model_path} (Trained Acc: {self.bundle['test_accuracy']*100:.1f}%)")
        else:
            print(f"[ML Inference] Warning: Model file not found at {self.model_path}. Run ml/train_classifier.py first.")

    def is_ready(self) -> bool:
        return self.model is not None

    def predict(self, landmarks: List[Any]) -> Tuple[str, float, Dict[str, float]]:
        """
        Predicts exercise class from 33 landmarks.
        Returns: (predicted_class, confidence_score, class_probabilities_dict)
        """
        if not self.is_ready():
            return "idle", 0.0, {}

        features = self.extractor.extract_features(landmarks)
        if features is None:
            return "idle", 0.0, {}

        # Reshape for single sample
        X = features.reshape(1, -1)
        probs = self.model.predict_proba(X)[0]
        top_idx = int(np.argmax(probs))
        predicted_class = self.classes[top_idx]
        confidence = float(probs[top_idx])

        prob_dict = {
            cls_name: float(probs[i]) for i, cls_name in enumerate(self.classes)
        }
        return predicted_class, confidence, prob_dict
