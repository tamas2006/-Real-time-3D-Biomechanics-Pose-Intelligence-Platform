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

export interface PairWorkoutSession {
  athleteId: string;
  mentorId: string;
  collaborativeScore: number;
  synchronizedReps: number;
  timestamp: number;
}

export interface ClinicalTelemetry {
  leftKneeAngle: number;
  rightKneeAngle: number;
  leftHipAngle: number;
  rightHipAngle: number;
  torsoInclination: number;
  symmetryBalance: number; // 50 = Perfect 50/50 balance
  barVelocityMps: number; // Mean propulsive velocity (m/s)
  peakPowerWatts: number; // Dynamic estimated power output (Watts)
  fatigueIndexPercent: number; // Dynamic fatigue index (% drop-off)
}

export interface TrajectoryPoint {
  x: number;
  y: number;
  timestamp: number;
  phase: MovementPhase;
}

export type ClinicalCoachPersona = 'olympic' | 'physio' | 'mindset';
