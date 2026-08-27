import { ExerciseType, Landmark, ExerciseConfig } from '@/types/fitness';

export const EXERCISE_CONFIGS: Record<ExerciseType, ExerciseConfig> = {
  squat: {
    id: 'squat',
    name: 'Barbell / Bodyweight Squat',
    primaryJoint: 'Knees & Hips',
    startThresh: 145,
    inflectionThresh: 118,
    lockoutThresh: 138,
    minROM: 25,
    minDuration: 0.45,
    description: 'Lower until thighs reach parallel with proud chest and knees tracking outwards.'
  },
  bicep_curl: {
    id: 'bicep_curl',
    name: 'Standing Bicep Curl',
    primaryJoint: 'Elbow Flexion',
    startThresh: 135,
    inflectionThresh: 85,
    lockoutThresh: 125,
    minROM: 35,
    minDuration: 0.45,
    description: 'Keep elbows pinned to your ribs, curling weight upwards through full range.'
  },
  pushup: {
    id: 'pushup',
    name: 'Standard Push-Up',
    primaryJoint: 'Elbows & Core',
    startThresh: 135,
    inflectionThresh: 105,
    lockoutThresh: 130,
    minROM: 25,
    minDuration: 0.45,
    description: 'Maintain rigid horizontal body line on floor, lowering chest to near floor.'
  },
  lunge: {
    id: 'lunge',
    name: 'Forward / Reverse Lunge',
    primaryJoint: 'Lead Knee',
    startThresh: 145,
    inflectionThresh: 115,
    lockoutThresh: 138,
    minROM: 25,
    minDuration: 0.45,
    description: 'Step into deep lunge until lead thigh is parallel with floor.'
  },
  shoulder_press: {
    id: 'shoulder_press',
    name: 'Overhead Shoulder Press',
    primaryJoint: 'Shoulders & Elbows',
    startThresh: 100,
    inflectionThresh: 145,
    lockoutThresh: 110,
    minROM: 35,
    minDuration: 0.45,
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

export function calculateTorsoAngleFromVertical(shoulder: Landmark, hip: Landmark): number {
  if (!shoulder || !hip) return 0;
  const dx = hip.x - shoulder.x;
  const dy = hip.y - shoulder.y;
  const mag = Math.sqrt(dx * dx + dy * dy);
  if (mag === 0) return 0;
  const cosine = Math.max(-1.0, Math.min(1.0, (dy * 1) / mag));
  return Math.round((Math.acos(cosine) * 180.0) / Math.PI);
}

export interface PosturePrerequisiteResult {
  isValid: boolean;
  statusMessage: string;
  primaryAngle: number;
}

export function validatePosturePrerequisites(
  exercise: ExerciseType,
  landmarks: Landmark[]
): PosturePrerequisiteResult {
  const lm = landmarks;
  if (!lm || lm.length < 33) {
    return { isValid: false, statusMessage: 'कॅमेरा स्कॅन करतोय शेठ...', primaryAngle: 0 };
  }

  if (exercise === 'pushup') {
    const lElbow = calculateAngle3D(lm[11], lm[13], lm[15]);
    const rElbow = calculateAngle3D(lm[12], lm[14], lm[16]);
    const angle = (lm[13].visibility || 1) >= (lm[14].visibility || 1) ? lElbow : rElbow;

    const midShoulder = { x: (lm[11].x + lm[12].x) / 2, y: (lm[11].y + lm[12].y) / 2, visibility: 1, id: -1 };
    const midHip = { x: (lm[23].x + lm[24].x) / 2, y: (lm[23].y + lm[24].y) / 2, visibility: 1, id: -2 };
    const torsoInclination = calculateTorsoAngleFromVertical(midShoulder, midHip);

    if (torsoInclination < 30 && (lm[23].visibility || 1) > 0.3) {
      return {
        isValid: false,
        statusMessage: 'शेठ, जमिनीवर आडवे होऊन पुशअप मारा!',
        primaryAngle: angle
      };
    }

    return { isValid: true, statusMessage: 'कडक पुशअप फॉर्म शेठ', primaryAngle: angle };
  }

  if (exercise === 'squat') {
    const lKnee = calculateAngle3D(lm[23], lm[25], lm[27]);
    const rKnee = calculateAngle3D(lm[24], lm[26], lm[28]);
    const angle = (lm[25].visibility || 1) >= (lm[26].visibility || 1) ? lKnee : rKnee;

    return { isValid: true, statusMessage: 'कडक squat फॉर्म शेठ', primaryAngle: angle };
  }

  if (exercise === 'bicep_curl') {
    const lElbow = calculateAngle3D(lm[11], lm[13], lm[15]);
    const rElbow = calculateAngle3D(lm[12], lm[14], lm[16]);
    const angle = lElbow < rElbow ? lElbow : rElbow;

    return { isValid: true, statusMessage: 'कडक curl फॉर्म शेठ', primaryAngle: angle };
  }

  if (exercise === 'shoulder_press') {
    const lElbow = calculateAngle3D(lm[11], lm[13], lm[15]);
    const rElbow = calculateAngle3D(lm[12], lm[14], lm[16]);
    const angle = (lm[13].visibility || 1) >= (lm[14].visibility || 1) ? lElbow : rElbow;

    return { isValid: true, statusMessage: 'कडक press फॉर्म शेठ', primaryAngle: angle };
  }

  if (exercise === 'lunge') {
    const lKnee = calculateAngle3D(lm[23], lm[25], lm[27]);
    const rKnee = calculateAngle3D(lm[24], lm[26], lm[28]);
    const angle = lKnee < rKnee ? lKnee : rKnee;

    return { isValid: true, statusMessage: 'कडक lunge फॉर्म शेठ', primaryAngle: angle };
  }

  if (exercise === 'plank') {
    const lSpine = calculateAngle3D(lm[11], lm[23], lm[27]);
    const rSpine = calculateAngle3D(lm[12], lm[24], lm[28]);
    const angle = Math.round((lSpine + rSpine) / 2);

    return { isValid: true, statusMessage: 'कडक plank पोझिशन', primaryAngle: angle };
  }

  return { isValid: true, statusMessage: 'तयार राहा शेठ', primaryAngle: 180 };
}
