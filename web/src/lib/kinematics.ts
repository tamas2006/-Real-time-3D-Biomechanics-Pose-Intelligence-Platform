import { ExerciseType, Landmark, ExerciseConfig } from '@/types/fitness';

export const EXERCISE_CONFIGS: Record<ExerciseType, ExerciseConfig> = {
  squat: {
    id: 'squat',
    name: 'Barbell / Bodyweight Squat',
    primaryJoint: 'Bilateral Knees & Hips',
    startThresh: 145,
    inflectionThresh: 120,
    lockoutThresh: 132,
    minROM: 20,
    minDuration: 0.35,
    description: 'Lower until thighs reach parallel with proud chest and knees tracking outwards.'
  },
  bicep_curl: {
    id: 'bicep_curl',
    name: 'Standing Bicep Curl',
    primaryJoint: 'Elbow Flexion',
    startThresh: 135,
    inflectionThresh: 85,
    lockoutThresh: 125,
    minROM: 30,
    minDuration: 0.35,
    description: 'Keep elbows pinned to your ribs, curling weight upwards through full range.'
  },
  pushup: {
    id: 'pushup',
    name: 'Standard Push-Up',
    primaryJoint: 'Elbows & Core',
    startThresh: 135,
    inflectionThresh: 105,
    lockoutThresh: 128,
    minROM: 25,
    minDuration: 0.35,
    description: 'Maintain rigid horizontal body line on floor, lowering chest to near floor.'
  },
  lunge: {
    id: 'lunge',
    name: 'Forward / Reverse Lunge',
    primaryJoint: 'Lead Knee',
    startThresh: 145,
    inflectionThresh: 115,
    lockoutThresh: 135,
    minROM: 25,
    minDuration: 0.35,
    description: 'Step into deep lunge until lead thigh is parallel with floor.'
  },
  shoulder_press: {
    id: 'shoulder_press',
    name: 'Overhead Shoulder Press',
    primaryJoint: 'Shoulders & Elbows',
    startThresh: 100,
    inflectionThresh: 145,
    lockoutThresh: 112,
    minROM: 30,
    minDuration: 0.35,
    description: 'Press vertically overhead to full elbow lockout without arching spine.'
  },
  plank: {
    id: 'plank',
    name: 'Core Isometric Plank',
    primaryJoint: 'Spine & Abdominals',
    startThresh: 155,
    inflectionThresh: 155,
    lockoutThresh: 155,
    minROM: 0,
    minDuration: 1.0,
    description: 'Maintain a straight, unbroken line across shoulders, hips, and ankles.'
  }
};

/**
 * Calculates 3D angle between three spatial landmarks A, B (vertex), and C.
 * Invariant to scale, translation, and camera distance.
 */
export function calculateAngle3D(a: Landmark, b: Landmark, c: Landmark): number {
  if (!a || !b || !c) return 180;
  const ba = [a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0)];
  const bc = [c.x - b.x, c.y - b.y, (c.z || 0) - (b.z || 0)];

  const dot = ba[0] * bc[0] + ba[1] * bc[1] + ba[2] * bc[2];
  const magBA = Math.sqrt(ba[0] * ba[0] + ba[1] * ba[1] + ba[2] * ba[2]);
  const magBC = Math.sqrt(bc[0] * bc[0] + bc[1] * bc[1] + bc[2] * bc[2]);

  if (magBA === 0 || magBC === 0) return 180;
  const cosine = Math.max(-1.0, Math.min(1.0, dot / (magBA * magBC)));
  return Math.round((Math.acos(cosine) * 180.0) / Math.PI);
}

/**
 * Calculates torso inclination angle relative to global vertical gravity axis.
 * Returns angle in degrees: 0° = vertical upright, 90° = horizontal prone.
 */
export function calculateTorsoAngleFromVertical(shoulder: Landmark, hip: Landmark): number {
  if (!shoulder || !hip) return 0;
  const dx = hip.x - shoulder.x;
  const dy = hip.y - shoulder.y;
  const mag = Math.sqrt(dx * dx + dy * dy);
  if (mag === 0) return 0;
  const cosine = Math.max(-1.0, Math.min(1.0, (dy * 1) / mag));
  return Math.round((Math.acos(cosine) * 180.0) / Math.PI);
}

/**
 * Computes anatomical weighted Center of Mass Y-altitude in normalized space.
 */
export function calculateCenterOfMassY(landmarks: Landmark[]): number {
  if (!landmarks || landmarks.length < 29) return 0.5;
  const midHipY = (landmarks[23].y + landmarks[24].y) / 2;
  const midShoulderY = (landmarks[11].y + landmarks[12].y) / 2;
  const midKneeY = (landmarks[25].y + landmarks[26].y) / 2;
  return 0.40 * midHipY + 0.35 * midShoulderY + 0.25 * midKneeY;
}

export interface PosturePrerequisiteResult {
  isValid: boolean;
  statusMessage: string;
  rejectionReason?: string;
  primaryAngle: number;
  postureType: 'OPTIMAL' | 'INVALID_SEATED' | 'INVALID_AIR_PUSH' | 'INVALID_SWING' | 'INVALID_WALK' | 'OUT_OF_FRAME' | 'IDLE';
}

/**
 * Deterministic multi-variable kinetic chain prerequisite validator.
 * Blocks walking/stepping false reps, seated cheats, and air pushing.
 */
export function validatePosturePrerequisites(
  exercise: ExerciseType,
  landmarks: Landmark[]
): PosturePrerequisiteResult {
  const lm = landmarks;
  if (!lm || lm.length < 33) {
    return {
      isValid: false,
      statusMessage: 'Scanning body posture...',
      primaryAngle: 0,
      postureType: 'IDLE'
    };
  }

  const midShoulder = { x: (lm[11].x + lm[12].x) / 2, y: (lm[11].y + lm[12].y) / 2, visibility: (lm[11].visibility + lm[12].visibility) / 2, id: -1 };
  const midHip = { x: (lm[23].x + lm[24].x) / 2, y: (lm[23].y + lm[24].y) / 2, visibility: (lm[23].visibility + lm[24].visibility) / 2, id: -2 };
  const torsoInclination = calculateTorsoAngleFromVertical(midShoulder, midHip);

  // -------------------------------------------------------------
  // 1. SQUAT KINETIC CHAIN VALIDATION (Bilateral Symmetry & Anti-Walk)
  // -------------------------------------------------------------
  if (exercise === 'squat') {
    const lKneeVis = lm[25].visibility || 1;
    const rKneeVis = lm[26].visibility || 1;

    // Framing verification
    if (lKneeVis < 0.40 && rKneeVis < 0.40) {
      return {
        isValid: false,
        statusMessage: 'Step back: Lower body must be visible',
        rejectionReason: 'Lower body out of frame',
        primaryAngle: 180,
        postureType: 'OUT_OF_FRAME'
      };
    }

    const lKnee = calculateAngle3D(lm[23], lm[25], lm[27]);
    const rKnee = calculateAngle3D(lm[24], lm[26], lm[28]);

    // Anti-Walk / Single-Leg Stepping Filter:
    // Walking features one leg straight (e.g. 165°) while other is bent (e.g. 110°).
    // A squat strictly requires bilateral symmetry (both knees bending together).
    const kneeAsymmetry = Math.abs(lKnee - rKnee);
    if (kneeAsymmetry > 35 && (lKnee > 145 || rKnee > 145)) {
      return {
        isValid: false,
        statusMessage: 'Bilateral Squat Required (Both Legs)',
        rejectionReason: 'Walking or single-leg motion rejected',
        primaryAngle: Math.round((lKnee + rKnee) / 2),
        postureType: 'INVALID_WALK'
      };
    }

    // Squat angle is the synchronized average of both knees
    const angle = Math.round((lKnee + rKnee) / 2);

    return {
      isValid: true,
      statusMessage: 'Optimal Squat Posture',
      primaryAngle: angle,
      postureType: 'OPTIMAL'
    };
  }

  // -------------------------------------------------------------
  // 2. PUSH-UP KINETIC CHAIN VALIDATION
  // -------------------------------------------------------------
  if (exercise === 'pushup') {
    const lElbow = calculateAngle3D(lm[11], lm[13], lm[15]);
    const rElbow = calculateAngle3D(lm[12], lm[14], lm[16]);
    const angle = (lm[13].visibility || 1) >= (lm[14].visibility || 1) ? lElbow : rElbow;

    // Defense against standing air-pushing:
    // A push-up strictly requires horizontal prone orientation on the floor (torso inclination >= 38°)
    if (torsoInclination < 38 && (lm[23].visibility || 1) > 0.35) {
      return {
        isValid: false,
        statusMessage: 'Assume horizontal prone plank on floor',
        rejectionReason: 'Standing vertical air-pushing rejected',
        primaryAngle: angle,
        postureType: 'INVALID_AIR_PUSH'
      };
    }

    return {
      isValid: true,
      statusMessage: 'Optimal Push-Up Plank',
      primaryAngle: angle,
      postureType: 'OPTIMAL'
    };
  }

  // -------------------------------------------------------------
  // 3. BICEP CURL KINETIC CHAIN VALIDATION
  // -------------------------------------------------------------
  if (exercise === 'bicep_curl') {
    const lElbow = calculateAngle3D(lm[11], lm[13], lm[15]);
    const rElbow = calculateAngle3D(lm[12], lm[14], lm[16]);
    const angle = lElbow < rElbow ? lElbow : rElbow;

    if (torsoInclination > 35) {
      return {
        isValid: false,
        statusMessage: 'Keep torso upright without swinging',
        rejectionReason: 'Excessive torso momentum',
        primaryAngle: angle,
        postureType: 'INVALID_SWING'
      };
    }

    return {
      isValid: true,
      statusMessage: 'Optimal Curl Alignment',
      primaryAngle: angle,
      postureType: 'OPTIMAL'
    };
  }

  // -------------------------------------------------------------
  // 4. OVERHEAD SHOULDER PRESS
  // -------------------------------------------------------------
  if (exercise === 'shoulder_press') {
    const lElbow = calculateAngle3D(lm[11], lm[13], lm[15]);
    const rElbow = calculateAngle3D(lm[12], lm[14], lm[16]);
    const angle = (lm[13].visibility || 1) >= (lm[14].visibility || 1) ? lElbow : rElbow;

    return {
      isValid: true,
      statusMessage: 'Optimal Press Alignment',
      primaryAngle: angle,
      postureType: 'OPTIMAL'
    };
  }

  // -------------------------------------------------------------
  // 5. LUNGE
  // -------------------------------------------------------------
  if (exercise === 'lunge') {
    const lKnee = calculateAngle3D(lm[23], lm[25], lm[27]);
    const rKnee = calculateAngle3D(lm[24], lm[26], lm[28]);
    const angle = lKnee < rKnee ? lKnee : rKnee;

    return {
      isValid: true,
      statusMessage: 'Optimal Lunge Stance',
      primaryAngle: angle,
      postureType: 'OPTIMAL'
    };
  }

  // -------------------------------------------------------------
  // 6. ISOMETRIC PLANK
  // -------------------------------------------------------------
  if (exercise === 'plank') {
    const lSpine = calculateAngle3D(lm[11], lm[23], lm[27]);
    const rSpine = calculateAngle3D(lm[12], lm[24], lm[28]);
    const angle = Math.round((lSpine + rSpine) / 2);

    if (torsoInclination < 38) {
      return {
        isValid: false,
        statusMessage: 'Hold horizontal prone plank on floor',
        primaryAngle: angle,
        postureType: 'INVALID_AIR_PUSH'
      };
    }

    return {
      isValid: true,
      statusMessage: 'Hold Rigid Core Line',
      primaryAngle: angle,
      postureType: 'OPTIMAL'
    };
  }

  return { isValid: true, statusMessage: 'Ready', primaryAngle: 180, postureType: 'OPTIMAL' };
}
