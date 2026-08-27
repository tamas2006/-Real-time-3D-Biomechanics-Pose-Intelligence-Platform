"""
Server-side MediaPipe Pose Landmark Extraction and Pipeline Wrapper.
"""
from typing import List, Optional, Tuple
import cv2
import numpy as np
import mediapipe as mp
import time
from backend.schemas.telemetry import Landmark, PoseFrame, ExerciseType
from backend.engine.kinematics import LandmarkSmoother

class PoseDetector:
    """
    OpenCV & MediaPipe Pose detector for video frames and desktop webcam tracking.
    """
    def __init__(self, min_detection_confidence: float = 0.5, min_tracking_confidence: float = 0.5, enable_smoothing: bool = True):
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
        self.enable_smoothing = enable_smoothing
        self.smoother = LandmarkSmoother() if enable_smoothing else None

    def process_frame(self, image: np.ndarray, timestamp: Optional[float] = None) -> Tuple[Optional[List[Landmark]], np.ndarray]:
        """
        Processes a BGR image frame, extracts 33 landmarks, and draws skeletal overlay.
        """
        if timestamp is None:
            timestamp = time.time()

        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image_rgb.flags.writeable = False
        results = self.pose.process(image_rgb)
        image_rgb.flags.writeable = True

        landmarks_out: Optional[List[Landmark]] = None

        if results.pose_landmarks:
            landmarks_out = []
            for idx, lm in enumerate(results.pose_landmarks.landmark):
                x, y, z = lm.x, lm.y, lm.z
                if self.smoother:
                    x, y, z = self.smoother.smooth(idx, x, y, z, timestamp)
                
                landmarks_out.append(Landmark(
                    id=idx,
                    x=float(x),
                    y=float(y),
                    z=float(z),
                    visibility=float(lm.visibility)
                ))

            # Draw landmarks on output frame
            self.mp_drawing.draw_landmarks(
                image,
                results.pose_landmarks,
                self.mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=self.mp_drawing_styles.get_default_pose_landmarks_style()
            )

        return landmarks_out, image

    def close(self):
        self.pose.close()
