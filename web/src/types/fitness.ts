export type ExerciseType = 'squat' | 'pushup' | 'bicep_curl' | 'lunge' | 'shoulder_press' | 'plank';

export type MovementPhase = 'idle' | 'start' | 'eccentric' | 'inflection' | 'concentric' | 'lockout';

export interface Landmark {
  id: number;
  x: number;
  y: number;
  z?: number;
  visibility: number;
}

export interface FormWarning {
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface RepMetric {
  repNumber: number;
  durationSec: number;
  eccentricSec: number;
  concentricSec: number;
  minAngle: number;
  maxAngle: number;
  formScore: number;
  tempoRatio: number;
}

export interface ExerciseConfig {
  id: ExerciseType;
  name: string;
  primaryJoint: string;
  startThresh: number;
  inflectionThresh: number;
  lockoutThresh: number;
  minROM: number;
  minDuration: number;
  description: string;
}
