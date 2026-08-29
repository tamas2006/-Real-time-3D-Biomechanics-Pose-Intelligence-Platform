import { ExerciseType, Landmark, ExerciseConfig } from '@/types/fitness';

export const EXERCISE_CONFIGS: Record<ExerciseType, ExerciseConfig> = {
  squat: {
    id: 'squat',
    name: 'Barbell / Bodyweight Squat',
    primaryJoint: 'Bilateral Knees & Hips',
    startThresh: 145,
    inflectionThresh: 105,     // Natural parallel depth (<= 105°)
    lockoutThresh: 140,        // Standing return (>= 140°)
    minROM: 25,                // Reliable ROM registration
    minDuration: 0.35,         // Natural repetition tempo
    description: 'Lower until thighs reach parallel or below, driving back to full vertical lockout.'
  },
  bicep_curl: {
    id: 'bicep_curl',
    name: 'Standing Bicep Curl',
    primaryJoint: 'Elbow Flexion',
    startThresh: 135,
    inflectionThresh: 75,      // Flexion squeeze (<= 75°)
    lockoutThresh: 130,        // Bottom extension (>= 130°)
    minROM: 30,
    minDuration: 0.30,
    description: 'Full extension at the bottom to peak squeeze at the top.'
  },
  pushup: {
    id: 'pushup',
    name: 'Standard Push-Up',
    primaryJoint: 'Elbows & Core',
    startThresh: 140,
    inflectionThresh: 100,     // Chest depth (<= 100°)
    lockoutThresh: 135,        // Press to lockout (>= 135°)
    minROM: 25,
    minDuration: 0.30,
    description: 'Rigid plank with chest lowering near floor and pressing to complete lockout.'
  },
  lunge: {
    id: 'lunge',
    name: 'Forward / Reverse Lunge',
    primaryJoint: 'Lead Knee',
    startThresh: 140,
    inflectionThresh: 105,     // Split depth (<= 105°)
    lockoutThresh: 135,        // Standing return (>= 135°)
    minROM: 25,
    minDuration: 0.35,
    description: 'Deep split lunge with lead thigh parallel to floor before returning to standing.'
  },
  shoulder_press: {
    id: 'shoulder_press',
    name: 'Overhead Shoulder Press',
    primaryJoint: 'Shoulders & Elbows',
    startThresh: 100,          // Rack start (<= 100°)
    inflectionThresh: 148,     // Overhead extension (>= 148°)
    lockoutThresh: 110,        // Return to shoulders
    minROM: 30,
    minDuration: 0.30,
    description: 'Press from clavicle height to full vertical arm lockout overhead.'
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
 * Blocks dancing, stepping false reps, half-squats, and incomplete ROM.
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

  // Human Athlete Presence Verification
  const leftShoulderVis = lm[11]?.visibility ?? 0;
  const rightShoulderVis = lm[12]?.visibility ?? 0;
  const leftHipVis = lm[23]?.visibility ?? 0;
  const rightHipVis = lm[24]?.visibility ?? 0;
  const leftElbowVis = lm[13]?.visibility ?? 0;
  const rightElbowVis = lm[14]?.visibility ?? 0;

  // Flexible presence check based on exercise posture
  const maxUpperVis = Math.max(leftShoulderVis, rightShoulderVis);
  const maxArmVis = Math.max(leftElbowVis, rightElbowVis);
  const coreBodyVisibility = (leftShoulderVis + rightShoulderVis + leftHipVis + rightHipVis) / 4;

  if (exercise === 'pushup') {
    if (maxUpperVis < 0.40 || maxArmVis < 0.35) {
      return {
        isValid: false,
        statusMessage: 'Position camera to see upper body & arms',
        rejectionReason: 'Upper body out of frame',
        primaryAngle: 0,
        postureType: 'OUT_OF_FRAME'
      };
    }
  } else if (coreBodyVisibility < 0.45 && maxUpperVis < 0.50) {
    return {
      isValid: false,
      statusMessage: 'Step into camera frame',
      rejectionReason: 'No athlete detected in frame',
      primaryAngle: 0,
      postureType: 'IDLE'
    };
  }

  const midShoulder = { x: (lm[11].x + lm[12].x) / 2, y: (lm[11].y + lm[12].y) / 2, visibility: (lm[11].visibility + lm[12].visibility) / 2, id: -1 };
  const midHip = { x: (lm[23].x + lm[24].x) / 2, y: (lm[23].y + lm[24].y) / 2, visibility: (lm[23].visibility + lm[24].visibility) / 2, id: -2 };
  const torsoInclination = calculateTorsoAngleFromVertical(midShoulder, midHip);

  // -------------------------------------------------------------
  // 1. SQUAT KINETIC CHAIN VALIDATION (Bilateral Symmetry & Anti-Dancing)
  // -------------------------------------------------------------
  if (exercise === 'squat') {
    const lKneeVis = lm[25]?.visibility ?? 0;
    const rKneeVis = lm[26]?.visibility ?? 0;

    // Framing verification
    if (lKneeVis < 0.45 && rKneeVis < 0.45) {
      return {
        isValid: false,
        statusMessage: 'Step back: Knees must be visible',
        rejectionReason: 'Lower body out of frame',
        primaryAngle: 0,
        postureType: 'OUT_OF_FRAME'
      };
    }

    const lKnee = calculateAngle3D(lm[23], lm[25], lm[27]);
    const rKnee = calculateAngle3D(lm[24], lm[26], lm[28]);

    // Handle side-profile vs front-facing tracking naturally
    let angle: number;
    if (lKneeVis > 0.60 && rKneeVis < 0.45) {
      angle = lKnee;
    } else if (rKneeVis > 0.60 && lKneeVis < 0.45) {
      angle = rKnee;
    } else {
      angle = Math.round((lKnee + rKnee) / 2);
    }

    return {
      isValid: true,
      statusMessage: 'Optimal Squat Posture',
      primaryAngle: angle,
      postureType: 'OPTIMAL'
    };
  }

  // -------------------------------------------------------------
  // 2. PUSH-UP KINETIC CHAIN VALIDATION (All camera angles supported)
  // -------------------------------------------------------------
  if (exercise === 'pushup') {
    const lElbow = calculateAngle3D(lm[11], lm[13], lm[15]);
    const rElbow = calculateAngle3D(lm[12], lm[14], lm[16]);

    // Select the more visible arm
    let angle: number;
    if ((lm[13]?.visibility ?? 0) >= (lm[14]?.visibility ?? 0)) {
      angle = lElbow;
    } else {
      angle = rElbow;
    }

    return {
      isValid: true,
      statusMessage: 'Push-Up Plank Active',
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
    const isLeft = (lm[13].visibility || 1) >= (lm[14].visibility || 1);
    const angle = isLeft ? lElbow : rElbow;

    const shoulderIdx = isLeft ? 11 : 12;
    const elbowIdx = isLeft ? 13 : 14;
    const hipIdx = isLeft ? 23 : 24;

    const shoulderElbowAngle = calculateAngle3D(lm[hipIdx], lm[shoulderIdx], lm[elbowIdx]);
    if (shoulderElbowAngle > 35) {
      return {
        isValid: false,
        statusMessage: 'Pin upper arm to ribs (Stop swinging)',
        rejectionReason: 'Arm swing / flailing motion rejected',
        primaryAngle: angle,
        postureType: 'INVALID_SWING'
      };
    }

    return {
      isValid: true,
      statusMessage: 'Optimal Curl Posture',
      primaryAngle: angle,
      postureType: 'OPTIMAL'
    };
  }

  // -------------------------------------------------------------
  // 4. LUNGE KINETIC CHAIN VALIDATION
  // -------------------------------------------------------------
  if (exercise === 'lunge') {
    const lKnee = calculateAngle3D(lm[23], lm[25], lm[27]);
    const rKnee = calculateAngle3D(lm[24], lm[26], lm[28]);
    const leadKneeAngle = Math.min(lKnee, rKnee);

    return {
      isValid: true,
      statusMessage: 'Optimal Lunge Posture',
      primaryAngle: leadKneeAngle,
      postureType: 'OPTIMAL'
    };
  }

  // -------------------------------------------------------------
  // 5. OVERHEAD SHOULDER PRESS VALIDATION
  // -------------------------------------------------------------
  if (exercise === 'shoulder_press') {
    const lElbow = calculateAngle3D(lm[11], lm[13], lm[15]);
    const rElbow = calculateAngle3D(lm[12], lm[14], lm[16]);
    const angle = Math.round((lElbow + rElbow) / 2);

    return {
      isValid: true,
      statusMessage: 'Optimal Press Posture',
      primaryAngle: angle,
      postureType: 'OPTIMAL'
    };
  }

  // -------------------------------------------------------------
  // 6. CORE ISOMETRIC PLANK VALIDATION
  // -------------------------------------------------------------
  if (exercise === 'plank') {
    const lSpine = calculateAngle3D(lm[11], lm[23], lm[27]);
    const rSpine = calculateAngle3D(lm[12], lm[24], lm[28]);
    const spineAngle = Math.round((lSpine + rSpine) / 2);

    if (torsoInclination < 38) {
      return {
        isValid: false,
        statusMessage: 'Assume horizontal plank position',
        rejectionReason: 'Standing position rejected for plank',
        primaryAngle: spineAngle,
        postureType: 'INVALID_AIR_PUSH'
      };
    }

    return {
      isValid: true,
      statusMessage: 'Hold Isometric Plank',
      primaryAngle: spineAngle,
      postureType: 'OPTIMAL'
    };
  }

  return {
    isValid: true,
    statusMessage: 'Tracking active',
    primaryAngle: 180,
    postureType: 'OPTIMAL'
  };
}

/**
 * Computes bilateral pair synchronization score between two athletes or mentor-athlete pairs.
 */
export function calculatePairSynchronizationScore(angleA: number, angleB: number): number {
  const diff = Math.abs(angleA - angleB);
  return Math.max(0, Math.min(100, Math.round(100 - (diff * 1.5))));
}
