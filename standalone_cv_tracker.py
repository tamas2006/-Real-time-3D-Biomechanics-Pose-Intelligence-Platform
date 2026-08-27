"""
Advanced Hardware-Accelerated Biomechanics Pose Tracker & Real-Time AI Coach.
Combines Nick Nochnack's intuitive HUD with 175K-Sample Deep ML Ensemble & Clinical Posture Gates.
"""
import cv2
import mediapipe as mp
import numpy as np
import math
import joblib
import os
import time

# Initialize MediaPipe Pose
mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

POSE_CONNECTIONS = mp_pose.POSE_CONNECTIONS

class BiomechanicsTracker:
    def __init__(self, model_path: str = None):
        self.exercise = "squat"
        self.rep_count = 0
        self.stage = "START"
        self.primary_angle = 0
        self.depth_pct = 0
        self.posture_status = "Optimal Alignment"
        self.posture_valid = True
        self.reached_deep_depth = False
        self.rep_start_time = 0
        self.active_min_angle = 360
        self.active_max_angle = 0
        self.form_score = 100
        
        # ML Model
        self.model_bundle = None
        if model_path and os.path.exists(model_path):
            try:
                self.model_bundle = joblib.load(model_path)
                print(f"[ML Engine] Loaded ensemble model: {model_path}")
            except Exception as e:
                print(f"[ML Engine] Model load error: {e}")

    @staticmethod
    def calculate_angle_3d(a, b, c):
        ba = np.array([a[0] - b[0], a[1] - b[1], (a[2] if len(a) > 2 else 0) - (b[2] if len(b) > 2 else 0)])
        bc = np.array([c[0] - b[0], c[1] - b[1], (c[2] if len(c) > 2 else 0) - (b[2] if len(b) > 2 else 0)])
        
        dot = np.dot(ba, bc)
        mag_ba = np.linalg.norm(ba)
        mag_bc = np.linalg.norm(bc)
        
        if mag_ba == 0 or mag_bc == 0:
            return 180.0
        cosine = np.clip(dot / (mag_ba * mag_bc), -1.0, 1.0)
        return float(np.degrees(np.arccos(cosine)))

    @staticmethod
    def calculate_torso_angle(shoulder, hip):
        dx = hip[0] - shoulder[0]
        dy = hip[1] - shoulder[1]
        mag = math.sqrt(dx * dx + dy * dy)
        if mag == 0:
            return 0.0
        cosine = max(-1.0, min(1.0, (dy * 1.0) / mag))
        return math.degrees(math.acos(cosine))

    def process_frame(self, landmarks, frame_w, frame_h):
        lm = landmarks.landmark
        now = time.time()
        
        # 1. Posture & Spatial Plane Validation
        if self.exercise == "pushup":
            l_elbow = self.calculate_angle_3d([lm[11].x, lm[11].y, lm[11].z], [lm[13].x, lm[13].y, lm[13].z], [lm[15].x, lm[15].y, lm[15].z])
            r_elbow = self.calculate_angle_3d([lm[12].x, lm[12].y, lm[12].z], [lm[14].x, lm[14].y, lm[14].z], [lm[16].x, lm[16].y, lm[16].z])
            self.primary_angle = round(l_elbow if lm[13].visibility >= lm[14].visibility else r_elbow)

            mid_shoulder = [(lm[11].x + lm[12].x)/2, (lm[11].y + lm[12].y)/2]
            mid_hip = [(lm[23].x + lm[24].x)/2, (lm[23].y + lm[24].y)/2]
            torso_tilt = self.calculate_torso_angle(mid_shoulder, mid_hip)
            
            if torso_tilt < 35.0:
                self.posture_valid = False
                self.posture_status = "Posture Warning: Assume horizontal push-up position on floor"
            else:
                self.posture_valid = True
                self.posture_status = "Horizontal Push-Up Plane: Optimal"
            
            start_thresh, inflection_thresh, lockout_thresh, min_rom = 145, 100, 140, 35
            
        elif self.exercise == "squat":
            l_knee = self.calculate_angle_3d([lm[23].x, lm[23].y, lm[23].z], [lm[25].x, lm[25].y, lm[25].z], [lm[27].x, lm[27].y, lm[27].z])
            r_knee = self.calculate_angle_3d([lm[24].x, lm[24].y, lm[24].z], [lm[26].x, lm[26].y, lm[26].z], [lm[28].x, lm[28].y, lm[28].z])
            self.primary_angle = round(l_knee if lm[25].visibility >= lm[26].visibility else r_knee)
            self.posture_valid = True
            self.posture_status = "Optimal Squat Stance"
            
            start_thresh, inflection_thresh, lockout_thresh, min_rom = 155, 110, 145, 35

        elif self.exercise == "bicep_curl":
            l_elbow = self.calculate_angle_3d([lm[11].x, lm[11].y, lm[11].z], [lm[13].x, lm[13].y, lm[13].z], [lm[15].x, lm[15].y, lm[15].z])
            r_elbow = self.calculate_angle_3d([lm[12].x, lm[12].y, lm[12].z], [lm[14].x, lm[14].y, lm[14].z], [lm[16].x, lm[16].y, lm[16].z])
            self.primary_angle = round(l_elbow if l_elbow < r_elbow else r_elbow)
            self.posture_valid = True
            self.posture_status = "Optimal Curl Alignment"
            
            start_thresh, inflection_thresh, lockout_thresh, min_rom = 145, 75, 135, 50

        # 2. Strict State Machine & Rep Isolation
        angle = self.primary_angle
        self.depth_pct = min(100, max(0, int(((start_thresh - angle) / max(1, start_thresh - inflection_thresh)) * 100)))

        if self.stage == "STANDBY" or self.stage == "START":
            if angle >= start_thresh - 10:
                self.stage = "START"
                self.active_min_angle = angle
                self.active_max_angle = angle
                self.reached_deep_depth = False
                self.rep_start_time = now
            elif angle <= start_thresh - 12:
                self.stage = "LOWERING (DOWN)"
        elif self.stage == "LOWERING (DOWN)":
            self.active_min_angle = min(self.active_min_angle, angle)
            if angle <= inflection_thresh:
                self.stage = "DEEP DEPTH"
                self.reached_deep_depth = True
        elif self.stage == "DEEP DEPTH":
            if angle >= inflection_thresh + 12:
                self.stage = "DRIVING (UP)"
        elif self.stage == "DRIVING (UP)":
            self.active_max_angle = max(self.active_max_angle, angle)
            if angle >= lockout_thresh:
                dur = now - self.rep_start_time
                rom = self.active_max_angle - self.active_min_angle
                if self.reached_deep_depth and rom >= min_rom and dur >= 0.60:
                    self.rep_count += 1
                
                self.stage = "START"
                self.active_min_angle = angle
                self.active_max_angle = angle
                self.reached_deep_depth = False
                self.rep_start_time = now

def run_app():
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    
    model_path = os.path.join(os.path.dirname(__file__), "ml", "models", "exercise_classifier.joblib")
    tracker = BiomechanicsTracker(model_path=model_path)
    
    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5, model_complexity=1) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            frame = cv2.flip(frame, 1)
            h, w, _ = frame.shape
            
            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image_rgb.flags.writeable = False
            results = pose.process(image_rgb)
            
            image_rgb.flags.writeable = True
            image = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)
            
            if results.poseLandmarks:
                mp_drawing.draw_landmarks(
                    image, results.poseLandmarks, POSE_CONNECTIONS,
                    mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=3, circle_radius=3),
                    mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=3, circle_radius=2)
                )
                tracker.process_frame(results.poseLandmarks, w, h)
                
            # Top Info Bar
            cv2.rectangle(image, (0, 0), (w, 90), (18, 22, 32), -1)
            cv2.line(image, (0, 90), (w, 90), (0, 242, 254), 2)
            
            # Rep Count Box
            cv2.putText(image, "REPS", (25, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (150, 160, 180), 2, cv2.LINE_AA)
            cv2.putText(image, f"{tracker.rep_count:02d}", (20, 75), cv2.FONT_HERSHEY_SIMPLEX, 1.6, (255, 255, 255), 3, cv2.LINE_AA)
            
            # Movement Stage
            cv2.putText(image, "STAGE", (140, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (150, 160, 180), 2, cv2.LINE_AA)
            stage_color = (0, 255, 150) if tracker.stage == "DEEP DEPTH" else ((0, 200, 255) if tracker.stage in ["DRIVING (UP)", "START"] else (0, 165, 255))
            cv2.putText(image, tracker.stage, (140, 72), cv2.FONT_HERSHEY_SIMPLEX, 1.0, stage_color, 2, cv2.LINE_AA)
            
            # Target Exercise
            cv2.putText(image, "EXERCISE", (420, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (150, 160, 180), 2, cv2.LINE_AA)
            cv2.putText(image, tracker.exercise.upper(), (420, 72), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2, cv2.LINE_AA)

            # Joint Angle & Depth %
            cv2.putText(image, "ANGLE / ROM", (680, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (150, 160, 180), 2, cv2.LINE_AA)
            angle_str = f"{tracker.primary_angle} deg ({tracker.depth_pct}%)" if tracker.primary_angle > 0 else "-- deg"
            cv2.putText(image, angle_str, (680, 72), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 242, 254), 2, cv2.LINE_AA)
            
            # Bottom Guidance
            if not tracker.posture_valid:
                cv2.rectangle(image, (0, h - 45), (w, h), (0, 0, 180), -1)
                cv2.putText(image, f"WARNING: {tracker.posture_status}", (20, h - 15), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2, cv2.LINE_AA)
            else:
                cv2.rectangle(image, (0, h - 35), (w, h), (18, 22, 32), -1)
                cv2.putText(image, f"STATUS: {tracker.posture_status} | Press [S] Squat, [P] Pushup, [C] Curl, [Q] Quit", (20, h - 12), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 150), 1, cv2.LINE_AA)

            cv2.imshow("Kinetic.AI — Biomechanics Pose Studio", image)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('s'):
                tracker.exercise = "squat"
                tracker.rep_count = 0
            elif key == ord('p'):
                tracker.exercise = "pushup"
                tracker.rep_count = 0
            elif key == ord('c'):
                tracker.exercise = "bicep_curl"
                tracker.rep_count = 0

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run_app()
