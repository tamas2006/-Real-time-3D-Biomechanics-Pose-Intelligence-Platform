"""
Server-side MediaPipe Pose Landmark Extraction and Pipeline Wrapper.
"""
from typing import List, Optional, Tuple
import numpy as np
import time
from backend.schemas.telemetry import Landmark, PoseFrame, ExerciseType
from backend.engine.kinematics import LandmarkSmoother

try:
    import cv2
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    cv2 = None
    mp = None

class PoseDetector:
    """
    OpenCV & MediaPipe Pose detector for video frames and desktop webcam tracking.
    """
    def __init__(self, min_detection_confidence: float = 0.5, min_tracking_confidence: float = 0.5, enable_smoothing: bool = True):
        self.enable_smoothing = enable_smoothing
        self.smoother = LandmarkSmoother() if enable_smoothing else None
        
        if MEDIAPIPE_AVAILABLE and mp:
            try:
                self.mp_pose = mp.solutions.pose
                self.mp_drawing = mp.solutions.drawing_utils
                self.mp_drawing_styles = mp.solutions.drawing_styles
                self.pose = self.mp_pose.Pose(
                    static_image_mode=False,
                    model_complexity=1,
                    smooth_landmarks=True,
                    enable_segmentation=False,
                    min_detection_confidence=0.5,
                    min_tracking_confidence=0.5
                )
            except Exception:
                self.pose = None
        else:
            self.pose = None

    def process_frame(self, image: np.ndarray, timestamp: Optional[float] = None) -> Tuple[Optional[List[Landmark]], np.ndarray]:
        """
        Processes a BGR image frame, extracts 33 landmarks, and draws skeletal overlay.
        """
        if not MEDIAPIPE_AVAILABLE or self.pose is None or cv2 is None:
            return None, image

        if timestamp is None:
            timestamp = time.time()

        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image_rgb.flags.writeable = False
        results = self.pose.process(image_rgb)
        image_rgb.flags.writeable = True
        annotated_image = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)

        if not results.pose_landmarks:
            return None, annotated_image

        landmarks: List[Landmark] = []
        for idx, lm in enumerate(results.pose_landmarks.landmark):
            landmarks.append(
                Landmark(
                    id=idx,
                    x=float(lm.x),
                    y=float(lm.y),
                    z=float(lm.z) if hasattr(lm, 'z') else 0.0,
                    visibility=float(lm.visibility) if hasattr(lm, 'visibility') else 1.0
                )
            )

        # Apply exponential moving average filter
        if self.enable_smoothing and self.smoother:
            landmarks = self.smoother.smooth(landmarks)

        # Render visual skeleton connections
        if self.mp_drawing and self.mp_pose:
            self.mp_drawing.draw_landmarks(
                annotated_image,
                results.pose_landmarks,
                self.mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=self.mp_drawing_styles.get_default_pose_landmarks_style()
            )

        return landmarks, annotated_image
