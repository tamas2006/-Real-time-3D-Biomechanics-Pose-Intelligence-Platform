import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.engine.kinematics import calculate_angle_2d, calculate_angle_3d, calculate_vertical_inclination, OneEuroFilter
from backend.engine.state_machine import RepStateMachine
from backend.engine.form_evaluator import FormEvaluator
from backend.schemas.telemetry import ExerciseType, MovementPhase, Landmark
import time

def test_kinematics():
    # Test 90 degree angle calculation
    a = (0.0, 1.0, 0.0)
    b = (0.0, 0.0, 0.0)
    c = (1.0, 0.0, 0.0)
    angle = calculate_angle_3d(a, b, c)
    assert abs(angle - 90.0) < 1e-4, f"Expected 90 degrees, got {angle}"

    # Test 180 degree straight line
    d = (0.0, -1.0, 0.0)
    angle_straight = calculate_angle_3d(a, b, d)
    assert abs(angle_straight - 180.0) < 1e-4, f"Expected 180 degrees, got {angle_straight}"
    print("Kinematics Tests Passed!")

def test_state_machine():
    sm = RepStateMachine(ExerciseType.SQUAT)
    t = 0.0

    # 1. User starts standing tall (165°)
    phase, rep_done, _ = sm.update(165.0, t)
    assert phase == MovementPhase.START, f"Expected START, got {phase}"

    # 2. User goes down eccentrically (165° -> 130°)
    t += 0.5
    phase, rep_done, _ = sm.update(130.0, t)
    assert phase == MovementPhase.ECCENTRIC, f"Expected ECCENTRIC, got {phase}"

    # 3. User reaches bottom inflection / depth (85°)
    t += 0.8
    phase, rep_done, _ = sm.update(85.0, t)
    assert phase == MovementPhase.INFLECTION, f"Expected INFLECTION, got {phase}"

    # 4. User starts rising concentric (120°)
    t += 0.5
    phase, rep_done, _ = sm.update(120.0, t)
    assert phase == MovementPhase.CONCENTRIC, f"Expected CONCENTRIC, got {phase}"

    # 5. User locks out at top (160°)
    t += 0.6
    phase, rep_done, metric = sm.update(160.0, t)
    assert rep_done is True, "Repetition was expected to complete!"
    assert sm.rep_count == 1, f"Expected rep count 1, got {sm.rep_count}"
    assert metric.min_primary_angle <= 85.0
    print(f"State Machine Rep Count Passed! Metric: {metric}")

if __name__ == "__main__":
    test_kinematics()
    test_state_machine()
    print("ALL TESTS PASSED SUCCESSFULLY!")
