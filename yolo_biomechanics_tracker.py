"""
State-of-the-Art Deep Learning Biomechanics Studio powered by Ultralytics YOLOv8-Pose.
Uses Deep Convolutional Keypoint Heatmaps for robust joint tracking and zero-drift rep counting.
"""
import cv2
import numpy as np
import time
import math
import os
import sys

def run_yolo_tracker():
    try:
        from ultralytics import YOLO
    except ImportError:
        print("[ERROR] Ultralytics is still installing. Please wait a few seconds and run again.")
        return

    print("=" * 75)
    print("  INITIALIZING ULTRALYTICS YOLOV8-POSE DEEP VISION ENGINE")
    print("=" * 75)

    # Load YOLOv8n-pose deep neural network (downloads once automatically)
    model = YOLO("yolov8n-pose.pt")
    print("[OK] YOLOv8-Pose Neural Network loaded successfully!")

    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    exercise = "squat"
    rep_count = 0
    stage = "START"
    primary_angle = 0
    active_min_angle = 360
    active_max_angle = 0
    reached_deep_depth = False
    rep_start_time = time.time()
    warnings = []

    def calculate_angle(a, b, c):
        ba = np.array([a[0] - b[0], a[1] - b[1]])
        bc = np.array([c[0] - b[0], c[1] - b[1]])
        dot = np.dot(ba, bc)
        mag_ba = np.linalg.norm(ba)
        mag_bc = np.linalg.norm(bc)
        if mag_ba == 0 or mag_bc == 0:
            return 180.0
        cosine = np.clip(dot / (mag_ba * mag_bc), -1.0, 1.0)
        return float(np.degrees(np.arccos(cosine)))

    def calculate_torso_angle(shoulder, hip):
        dx = hip[0] - shoulder[0]
        dy = hip[1] - shoulder[1]
        mag = math.sqrt(dx * dx + dy * dy)
        if mag == 0:
            return 0.0
        cosine = max(-1.0, min(1.0, (dy * 1.0) / mag))
        return math.degrees(math.acos(cosine))

    print("\n[READY] Controls:")
    print("  [S] Squats | [P] Push-Ups | [C] Bicep Curls | [Q] Quit\n")

    # COCO Keypoint mapping for YOLO-Pose:
    # 5: L_Shoulder, 6: R_Shoulder, 7: L_Elbow, 8: R_Elbow, 9: L_Wrist, 10: R_Wrist
    # 11: L_Hip, 12: R_Hip, 13: L_Knee, 14: R_Knee, 15: L_Ankle, 16: R_Ankle

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape
        now = time.time()

        # Run Deep Pose Inference
        results = model(frame, verbose=False, conf=0.5)[0]

        if results.keypoints is not None and len(results.keypoints.data) > 0:
            # First detected person's keypoints [17, 3] (x, y, conf)
            kpts = results.keypoints.data[0].cpu().numpy()

            # Keypoint Indices
            l_sh, r_sh = kpts[5][:2], kpts[6][:2]
            l_el, r_el = kpts[7][:2], kpts[8][:2]
            l_wr, r_wr = kpts[9][:2], kpts[10][:2]
            l_hp, r_hp = kpts[11][:2], kpts[12][:2]
            l_kn, r_kn = kpts[13][:2], kpts[14][:2]
            l_an, r_an = kpts[15][:2], kpts[16][:2]

            # Draw Deep Skeleton Connectors
            bones = [
                (5, 6), (5, 7), (7, 9), (6, 8), (8, 10),
                (5, 11), (6, 12), (11, 12),
                (11, 13), (13, 15), (12, 14), (14, 16)
            ]
            for i1, i2 in bones:
                if kpts[i1][2] > 0.4 and kpts[i2][2] > 0.4:
                    pt1 = (int(kpts[i1][0]), int(kpts[i1][1]))
                    pt2 = (int(kpts[i2][0]), int(kpts[i2][1]))
                    cv2.line(frame, pt1, pt2, (0, 242, 254), 4, cv2.LINE_AA)

            # Draw Joint Keypoints
            for i in range(5, 17):
                if kpts[i][2] > 0.4:
                    pt = (int(kpts[i][0]), int(kpts[i][1]))
                    cv2.circle(frame, pt, 7, (255, 255, 255), -1, cv2.LINE_AA)
                    cv2.circle(frame, pt, 4, (255, 0, 128), -1, cv2.LINE_AA)

            # Exercise Evaluation
            warnings = []
            if exercise == "squat":
                l_knee_angle = calculate_angle(l_hp, l_kn, l_an)
                r_knee_angle = calculate_angle(r_hp, r_kn, r_an)
                primary_angle = round(l_knee_angle if kpts[13][2] >= kpts[14][2] else r_knee_angle)

                start_thresh, inflection_thresh, lockout_thresh, min_rom = 150, 105, 145, 40

                # Target joint to draw angle badge
                target_pt = (int(l_kn[0]), int(l_kn[1]))

            elif exercise == "pushup":
                l_elbow_angle = calculate_angle(l_sh, l_el, l_wr)
                r_elbow_angle = calculate_angle(r_sh, r_el, r_wr)
                primary_angle = round(l_elbow_angle if kpts[7][2] >= kpts[8][2] else r_elbow_angle)

                mid_sh = [(l_sh[0] + r_sh[0])/2, (l_sh[1] + r_sh[1])/2]
                mid_hp = [(l_hp[0] + r_hp[0])/2, (l_hp[1] + r_hp[1])/2]
                torso_tilt = calculate_torso_angle(mid_sh, mid_hp)

                if torso_tilt < 35.0:
                    warnings.append("Posture Mismatch: Assume horizontal pushup position on floor")

                start_thresh, inflection_thresh, lockout_thresh, min_rom = 145, 95, 140, 40
                target_pt = (int(l_el[0]), int(l_el[1]))

            elif exercise == "bicep_curl":
                l_elbow_angle = calculate_angle(l_sh, l_el, l_wr)
                r_elbow_angle = calculate_angle(r_sh, r_el, r_wr)
                primary_angle = round(l_elbow_angle if l_elbow_angle < r_elbow_angle else r_elbow_angle)

                start_thresh, inflection_thresh, lockout_thresh, min_rom = 145, 70, 135, 55
                target_pt = (int(l_el[0]), int(l_el[1]))

            # State Machine Progression
            angle = primary_angle
            if stage in ["START", "STANDBY"]:
                if angle >= start_thresh:
                    stage = "START"
                    active_min_angle = angle
                    active_max_angle = angle
                    reached_deep_depth = False
                    rep_start_time = now
                elif angle <= start_thresh - 15:
                    stage = "LOWERING (DOWN)"
            elif stage == "LOWERING (DOWN)":
                active_min_angle = min(active_min_angle, angle)
                if angle <= inflection_thresh:
                    stage = "DEEP DEPTH"
                    reached_deep_depth = True
            elif stage == "DEEP DEPTH":
                if angle >= inflection_thresh + 15:
                    stage = "DRIVING (UP)"
            elif stage == "DRIVING (UP)":
                active_max_angle = max(active_max_angle, angle)
                if angle >= lockout_thresh:
                    dur = now - rep_start_time
                    rom = active_max_angle - active_min_angle
                    if reached_deep_depth and rom >= min_rom and dur >= 0.70:
                        rep_count += 1
                        print(f"\a[REP {rep_count}] Valid Repetition! ROM: {rom:.1f} deg | Time: {dur:.1f}s")

                    stage = "START"
                    active_min_angle = angle
                    active_max_angle = angle
                    reached_deep_depth = False
                    rep_start_time = now

            # Draw On-Joint Angle Badge
            if primary_angle > 0 and 'target_pt' in locals():
                cv2.rectangle(frame, (target_pt[0] - 45, target_pt[1] - 35), (target_pt[0] + 45, target_pt[1] - 5), (18, 22, 32), -1)
                cv2.rectangle(frame, (target_pt[0] - 45, target_pt[1] - 35), (target_pt[0] + 45, target_pt[1] - 5), (0, 242, 254), 2)
                cv2.putText(frame, f"{primary_angle} deg", (target_pt[0] - 38, target_pt[1] - 14), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 242, 254), 2, cv2.LINE_AA)

        # -----------------------------------------------------------------
        # High-Contrast Professional HUD
        # -----------------------------------------------------------------
        cv2.rectangle(frame, (0, 0), (w, 90), (18, 22, 32), -1)
        cv2.line(frame, (0, 90), (w, 90), (0, 242, 254), 2)

        # Rep Count
        cv2.putText(frame, "REPS", (25, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (150, 160, 180), 2, cv2.LINE_AA)
        cv2.putText(frame, f"{rep_count:02d}", (20, 75), cv2.FONT_HERSHEY_SIMPLEX, 1.6, (255, 255, 255), 3, cv2.LINE_AA)

        # Stage
        cv2.putText(frame, "STAGE", (140, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (150, 160, 180), 2, cv2.LINE_AA)
        stage_color = (0, 255, 150) if stage == "DEEP DEPTH" else ((0, 200, 255) if stage in ["DRIVING (UP)", "START"] else (0, 165, 255))
        cv2.putText(frame, stage, (140, 72), cv2.FONT_HERSHEY_SIMPLEX, 1.0, stage_color, 2, cv2.LINE_AA)

        # Exercise
        cv2.putText(frame, "EXERCISE (YOLOv8)", (440, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (150, 160, 180), 2, cv2.LINE_AA)
        cv2.putText(frame, exercise.upper(), (440, 72), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2, cv2.LINE_AA)

        # Angle
        cv2.putText(frame, "JOINT ANGLE", (740, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (150, 160, 180), 2, cv2.LINE_AA)
        cv2.putText(frame, f"{primary_angle} deg", (740, 72), cv2.FONT_HERSHEY_SIMPLEX, 1.1, (0, 242, 254), 2, cv2.LINE_AA)

        # Warnings Banner
        if len(warnings) > 0:
            cv2.rectangle(frame, (0, h - 45), (w, h), (0, 0, 180), -1)
            cv2.putText(frame, f"WARNING: {warnings[0]}", (20, h - 15), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2, cv2.LINE_AA)
        else:
            cv2.rectangle(frame, (0, h - 35), (w, h), (18, 22, 32), -1)
            cv2.putText(frame, f"STATUS: Deep Neural Net Active | [S] Squat, [P] Pushup, [C] Curl, [Q] Quit", (20, h - 12), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 150), 1, cv2.LINE_AA)

        cv2.imshow("YOLOv8 Deep Pose Biomechanics Studio", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('s'):
            exercise = "squat"
            rep_count = 0
        elif key == ord('p'):
            exercise = "pushup"
            rep_count = 0
        elif key == ord('c'):
            exercise = "bicep_curl"
            rep_count = 0

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run_yolo_tracker()
