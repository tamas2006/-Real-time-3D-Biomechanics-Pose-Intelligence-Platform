"""
High-Performance WebSocket Endpoint for Sub-Millisecond Bidirectional Pose Streaming.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import time
import base64
import numpy as np
import cv2
from typing import Dict, Any
from backend.schemas.telemetry import ExerciseType, Landmark, MovementPhase, FormWarning
from backend.engine.form_evaluator import FormEvaluator
from backend.engine.state_machine import RepStateMachine
from backend.engine.pose_detector import PoseDetector
from ml.inference import ExerciseClassifier

ws_router = APIRouter(tags=["Live Telemetry WebSocket"])
ml_classifier = ExerciseClassifier()

@ws_router.websocket("/ws/live-session")
async def websocket_session_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    current_exercise = ExerciseType.SQUAT
    state_machine = RepStateMachine(current_exercise)
    evaluator = FormEvaluator()
    pose_detector: PoseDetector = None  # Lazily instantiated if raw frames sent
    
    try:
        while True:
            raw_data = await websocket.receive_text()
            data: Dict[str, Any] = json.loads(raw_data)
            action = data.get("action", "pose_data")
            
            if action == "config":
                ex_str = data.get("exercise", "squat")
                try:
                    current_exercise = ExerciseType(ex_str)
                    state_machine.reset(current_exercise)
                    await websocket.send_json({
                        "type": "config_ack",
                        "exercise": current_exercise.value,
                        "status": "ready"
                    })
                except ValueError:
                    await websocket.send_json({"type": "error", "message": f"Invalid exercise {ex_str}"})
                continue

            elif action == "reset":
                state_machine.reset()
                await websocket.send_json({
                    "type": "reset_ack",
                    "rep_count": 0,
                    "valid_reps": 0
                })
                continue

            elif action == "pose_data":
                # Client sent 33 extracted landmarks directly (Edge inference mode - Fastest)
                timestamp = data.get("timestamp", time.time())
                raw_landmarks = data.get("landmarks", [])
                
                landmarks = [
                    Landmark(
                        id=lm.get("id", idx),
                        x=lm.get("x", 0.0),
                        y=lm.get("y", 0.0),
                        z=lm.get("z", 0.0),
                        visibility=lm.get("visibility", 1.0)
                    )
                    for idx, lm in enumerate(raw_landmarks)
                ]

                # 1. Run ML Exercise Classifier
                predicted_ex, confidence, prob_dict = ml_classifier.predict(landmarks) if ml_classifier.is_ready() else ("unknown", 0.0, {})

                # 2. Evaluate form
                primary_angle, secondary_angle, form_score, warnings, voice_cue = evaluator.evaluate(
                    current_exercise, landmarks, timestamp
                )

                # 3. Update state machine for rep progression
                phase, rep_just_completed, rep_metric = state_machine.update(
                    primary_angle, timestamp, current_form_score=form_score
                )
                depth_pct = state_machine.calculate_depth_percentage(primary_angle)

                # 4. Stream real-time telemetry back
                payload = {
                    "type": "telemetry",
                    "exercise": current_exercise.value,
                    "ml_detected_exercise": predicted_ex,
                    "ml_confidence": round(confidence * 100.0, 1),
                    "phase": phase.value,
                    "rep_count": state_machine.rep_count,
                    "valid_reps": state_machine.valid_reps,
                    "primary_angle": round(primary_angle, 1),
                    "secondary_angle": round(secondary_angle, 1) if secondary_angle is not None else None,
                    "depth_percentage": round(depth_pct, 1),
                    "form_score": round(form_score, 1),
                    "rep_completed": rep_just_completed,
                    "completed_rep_metric": rep_metric.model_dump() if rep_metric else None,
                    "warnings": [w.model_dump() for w in warnings],
                    "voice_cue": voice_cue,
                    "timestamp": timestamp
                }
                await websocket.send_json(payload)

            elif action == "raw_frame":
                # Client sent base64 image frame (Cloud inference mode)
                b64_str = data.get("image_b64", "")
                if b64_str:
                    if pose_detector is None:
                        pose_detector = PoseDetector()
                    
                    if "," in b64_str:
                        b64_str = b64_str.split(",")[1]
                    
                    img_bytes = base64.b64decode(b64_str)
                    np_arr = np.frombuffer(img_bytes, np.uint8)
                    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                    
                    timestamp = time.time()
                    extracted_landmarks, annotated_frame = pose_detector.process_frame(frame, timestamp)
                    
                    if extracted_landmarks:
                        primary_angle, secondary_angle, form_score, warnings, voice_cue = evaluator.evaluate(
                            current_exercise, extracted_landmarks, timestamp
                        )
                        phase, rep_just_completed, rep_metric = state_machine.update(
                            primary_angle, timestamp, current_form_score=form_score
                        )
                        depth_pct = state_machine.calculate_depth_percentage(primary_angle)
                        
                        await websocket.send_json({
                            "type": "telemetry",
                            "exercise": current_exercise.value,
                            "phase": phase.value,
                            "rep_count": state_machine.rep_count,
                            "valid_reps": state_machine.valid_reps,
                            "primary_angle": round(primary_angle, 1),
                            "secondary_angle": round(secondary_angle, 1) if secondary_angle is not None else None,
                            "depth_percentage": round(depth_pct, 1),
                            "form_score": round(form_score, 1),
                            "rep_completed": rep_just_completed,
                            "warnings": [w.model_dump() for w in warnings],
                            "voice_cue": voice_cue,
                            "landmarks": [lm.model_dump() for lm in extracted_landmarks]
                        })

    except WebSocketDisconnect:
        pass
    finally:
        if pose_detector:
            pose_detector.close()
