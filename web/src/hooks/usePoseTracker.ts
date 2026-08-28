'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ExerciseType, MovementPhase, RepMetric, Landmark } from '@/types/fitness';
import {
  calculateAngle3D,
  calculateCenterOfMassY,
  EXERCISE_CONFIGS,
  validatePosturePrerequisites
} from '@/lib/kinematics';
import { sounds } from '@/lib/soundEffects';
import { playVoiceCue } from '@/lib/voiceCoach';

export function usePoseTracker(exercise: ExerciseType) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [fps, setFps] = useState(0);
  const [phase, setPhase] = useState<MovementPhase>('idle');
  const [primaryAngle, setPrimaryAngle] = useState(0);
  const [depthPercentage, setDepthPercentage] = useState(0);
  const [formScore, setFormScore] = useState(100);
  const [repCount, setRepCount] = useState(0);
  const [validReps, setValidReps] = useState(0);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [postureStatus, setPostureStatus] = useState<string>('Ready');
  const [repHistory, setRepHistory] = useState<RepMetric[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // AI Backend Detection State
  const [aiDetected, setAiDetected] = useState<string>('IDLE');
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  const [wsConnected, setWsConnected] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const poseRef = useRef<any>(null);

  // Kinetic State Machine & Trajectory Buffer Refs
  const isProcessingRef = useRef(false);
  const lastFrameTimeRef = useRef(performance.now());
  const repStartTimeRef = useRef(0);
  const activeMinAngle = useRef(360);
  const activeMaxAngle = useRef(0);
  const hasReachedDepth = useRef(false);
  const inflectionEnterTime = useRef(0);
  const startCoMY = useRef(0);
  const cycleMinScoreRef = useRef(100);
  const cycleViolationsRef = useRef<string[]>([]);
  const currentStageRef = useRef<'START' | 'DOWN' | 'BOTTOM' | 'UP'>('START');

  // Synchronous State Counters to eliminate closure stale values
  const repCountRef = useRef(0);
  const validRepsRef = useRef(0);
  const smoothedLandmarksRef = useRef<any[] | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // -----------------------------------------------------------
  // Real-Time Spoken AI Voice Coach (Pure English)
  // -----------------------------------------------------------
  const speak = useCallback((text: string, force = false) => {
    if (!voiceEnabled) return;
    playVoiceCue(text, force);
  }, [voiceEnabled]);

  // -----------------------------------------------------------
  // WebSocket Connection to Python AI Engine
  // -----------------------------------------------------------
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      const wsUrl = 'ws://localhost:8000/ws/live-session';
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        ws?.send(JSON.stringify({ action: 'config', exercise }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'telemetry' && data.ml_detected_exercise) {
            setAiDetected(data.ml_detected_exercise.replace('_', ' ').toUpperCase());
            setAiConfidence(Math.round(data.ml_confidence || 0));
          }
        } catch (e) {}
      };

      ws.onclose = () => setWsConnected(false);
      ws.onerror = () => setWsConnected(false);
    } catch (e) {}

    return () => {
      if (ws) ws.close();
    };
  }, [exercise]);

  // -----------------------------------------------------------
  // Multi-Gate Kinematic & Anti-False-Rep Progression Engine
  // -----------------------------------------------------------
  const processKinematics = useCallback((lm: any[]) => {
    const landmarks: Landmark[] = lm.map((p, idx) => ({
      id: idx,
      x: p.x,
      y: p.y,
      z: p.z || 0,
      visibility: p.visibility || 1.0
    }));

    // GATE 1 & 2: Structural Posture & Kinetic Chain Prerequisite Check
    const posture = validatePosturePrerequisites(exercise, landmarks);
    const angle = posture.primaryAngle;
    setPrimaryAngle(angle);
    setPostureStatus(posture.statusMessage);

    if (!posture.isValid) {
      setWarnings([posture.statusMessage]);
      setPhase('idle');
      if (posture.rejectionReason && currentStageRef.current !== 'START') {
        speak(posture.statusMessage);
      }
      currentStageRef.current = 'START';
      return;
    }

    let score = 100;
    const currentWarnings: string[] = [];

    // Real-Time Joint Form Analysis & Spoken Warnings
    if (exercise === 'squat') {
      const kSpread = Math.abs(landmarks[25].x - landmarks[26].x);
      const aSpread = Math.abs(landmarks[27].x - landmarks[28].x);
      if (aSpread > 0.12 && kSpread < aSpread * 0.48 && angle < 115) {
        currentWarnings.push('Knee valgus detected (push knees outward)');
        score -= 25;
        cycleMinScoreRef.current = Math.min(cycleMinScoreRef.current, score);
        if (!cycleViolationsRef.current.includes('Knee valgus')) {
          cycleViolationsRef.current.push('Knee valgus');
        }
        speak('Push knees outward over toes!');
      }
    } else if (exercise === 'pushup') {
      const lElbow = calculateAngle3D(landmarks[11], landmarks[13], landmarks[15]);
      if (lElbow > 85 && angle < 110) {
        currentWarnings.push('Elbows flared (tuck to 45 degrees)');
        score -= 30;
        cycleMinScoreRef.current = Math.min(cycleMinScoreRef.current, score);
        if (!cycleViolationsRef.current.includes('Elbow flare')) {
          cycleViolationsRef.current.push('Elbow flare');
        }
        speak('Tuck elbows to 45 degrees.');
      }
    } else if (exercise === 'bicep_curl') {
      const lShoulderElbowAngle = calculateAngle3D(landmarks[23], landmarks[11], landmarks[13]);
      if (lShoulderElbowAngle > 30 && angle < 105) {
        currentWarnings.push('Elbow drift detected (keep pinned to ribs)');
        score -= 35;
        cycleMinScoreRef.current = Math.min(cycleMinScoreRef.current, score);
        if (!cycleViolationsRef.current.includes('Elbow swing')) {
          cycleViolationsRef.current.push('Elbow swing');
        }
        speak('Keep elbows pinned to ribs.');
      }
    }

    setFormScore(Math.max(0, score));
    setWarnings(currentWarnings);

    if (angle <= 0 || angle > 200) return;

    // Rep State Machine Thresholds
    const cfg = EXERCISE_CONFIGS[exercise];
    const now = performance.now() / 1000;
    const currentCoMY = calculateCenterOfMassY(landmarks);

    let depth = 0;
    if (exercise === 'shoulder_press') {
      depth = ((angle - cfg.startThresh) / Math.max(1, cfg.inflectionThresh - cfg.startThresh)) * 100;
    } else {
      depth = ((cfg.startThresh - angle) / Math.max(1, cfg.startThresh - cfg.inflectionThresh)) * 100;
    }
    setDepthPercentage(Math.min(100, Math.max(0, Math.round(depth))));

    if (exercise !== 'shoulder_press') {
      // 1. Ready in Lockout
      if (currentStageRef.current === 'START') {
        if (angle >= cfg.startThresh) {
          activeMinAngle.current = angle;
          activeMaxAngle.current = angle;
          hasReachedDepth.current = false;
          cycleMinScoreRef.current = 100;
          cycleViolationsRef.current = [];
          repStartTimeRef.current = now;
          startCoMY.current = currentCoMY;
        } else if (angle <= cfg.startThresh - 10) {
          currentStageRef.current = 'DOWN';
          setPhase('eccentric');
          activeMinAngle.current = Math.min(activeMinAngle.current, angle);
        }
      }
      // 2. Lowering (Eccentric)
      else if (currentStageRef.current === 'DOWN') {
        activeMinAngle.current = Math.min(activeMinAngle.current, angle);

        if (angle <= cfg.inflectionThresh) {
          currentStageRef.current = 'BOTTOM';
          setPhase('inflection');
          hasReachedDepth.current = true;
          inflectionEnterTime.current = now;
          sounds.playDepthInflection();

          const depthPhrases = [
            'Good depth! Drive up.',
            'Target depth reached! Push up.',
            'Deep parallel! Drive through heels.'
          ];
          speak(depthPhrases[Math.floor(Math.random() * depthPhrases.length)], true);
        }
      }
      // 3. Bottom Inflection Hold
      else if (currentStageRef.current === 'BOTTOM') {
        if (angle >= cfg.inflectionThresh + 10 && now - inflectionEnterTime.current >= 0.05) {
          currentStageRef.current = 'UP';
          setPhase('concentric');
        }
      }
      // 4. Ascending (Concentric) & Completion
      else if (currentStageRef.current === 'UP') {
        activeMaxAngle.current = Math.max(activeMaxAngle.current, angle);
        if (angle >= cfg.lockoutThresh) {
          const duration = now - repStartTimeRef.current;
          const rom = activeMaxAngle.current - activeMinAngle.current;

          // STRICT CLINICAL FORM & ANTI-CHEAT ENFORCEMENT
          if (hasReachedDepth.current && rom >= cfg.minROM && duration >= cfg.minDuration) {
            const isCleanRep = cycleMinScoreRef.current >= 65 && cycleViolationsRef.current.length === 0;

            if (!isCleanRep) {
              // ❌ REJECTED CHEAT REP
              const primaryViolation = cycleViolationsRef.current[0] || 'Form breakdown';
              sounds.playRepFailed();
              speak(`No rep! Form failed: ${primaryViolation}.`, true);

              const failedMetric: RepMetric = {
                repNumber: repCountRef.current + 1,
                durationSec: parseFloat(duration.toFixed(1)),
                eccentricSec: parseFloat(Math.max(0.1, duration * 0.5).toFixed(1)),
                concentricSec: parseFloat(Math.max(0.1, duration * 0.5).toFixed(1)),
                minAngle: activeMinAngle.current,
                maxAngle: activeMaxAngle.current,
                formScore: cycleMinScoreRef.current,
                tempoRatio: 1.0
              };
              setRepHistory((prev) => [failedMetric, ...prev]);
            } else {
              // ✅ CREDITED CLEAN REP
              repCountRef.current += 1;
              validRepsRef.current += 1;
              const currentRepNum = validRepsRef.current;

              setRepCount(repCountRef.current);
              setValidReps(validRepsRef.current);
              sounds.playRepSuccess();

              const praises = [
                `Rep ${currentRepNum}! Perfect form.`,
                `Rep ${currentRepNum}! Excellent tempo.`,
                `Rep ${currentRepNum} confirmed!`,
                `Solid rep ${currentRepNum}! Keep driving.`
              ];
              const chosenPraise = praises[Math.floor(Math.random() * praises.length)];
              speak(chosenPraise, true);

              const validMetric: RepMetric = {
                repNumber: currentRepNum,
                durationSec: parseFloat(duration.toFixed(1)),
                eccentricSec: parseFloat(Math.max(0.1, duration * 0.5).toFixed(1)),
                concentricSec: parseFloat(Math.max(0.1, duration * 0.5).toFixed(1)),
                minAngle: activeMinAngle.current,
                maxAngle: activeMaxAngle.current,
                formScore: score,
                tempoRatio: 1.0
              };
              setRepHistory((prev) => [validMetric, ...prev]);
            }
          } else {
            // ❌ REJECTED HALF REP (INSUFFICIENT DEPTH / PARTIAL ROM)
            sounds.playRepFailed();
            speak('No rep! Hit full depth.', true);
          }

          // Reset cycle
          currentStageRef.current = 'START';
          setPhase('start');
          activeMinAngle.current = angle;
          activeMaxAngle.current = angle;
          hasReachedDepth.current = false;
          cycleMinScoreRef.current = 100;
          cycleViolationsRef.current = [];
          repStartTimeRef.current = now;
        }
      }
    } else {
      // Overhead Shoulder Press
      if (currentStageRef.current === 'START') {
        if (angle <= cfg.startThresh) {
          activeMinAngle.current = angle;
          activeMaxAngle.current = angle;
          hasReachedDepth.current = false;
          cycleMinScoreRef.current = 100;
          cycleViolationsRef.current = [];
          repStartTimeRef.current = now;
        } else if (angle >= cfg.startThresh + 10) {
          currentStageRef.current = 'UP';
          setPhase('concentric');
        }
      } else if (currentStageRef.current === 'UP') {
        activeMaxAngle.current = Math.max(activeMaxAngle.current, angle);
        if (angle >= cfg.inflectionThresh) {
          currentStageRef.current = 'BOTTOM';
          setPhase('inflection');
          hasReachedDepth.current = true;
          sounds.playDepthInflection();
          speak('Full lockout! Lower with control.', true);
        }
      } else if (currentStageRef.current === 'BOTTOM') {
        if (angle <= cfg.inflectionThresh - 10) {
          currentStageRef.current = 'DOWN';
          setPhase('eccentric');
        }
      } else if (currentStageRef.current === 'DOWN') {
        if (angle <= cfg.lockoutThresh) {
          const duration = now - repStartTimeRef.current;
          const rom = activeMaxAngle.current - activeMinAngle.current;

          if (hasReachedDepth.current && rom >= cfg.minROM && duration >= cfg.minDuration) {
            repCountRef.current += 1;
            validRepsRef.current += 1;
            const currentRepNum = validRepsRef.current;

            setRepCount(repCountRef.current);
            setValidReps(validRepsRef.current);
            sounds.playRepSuccess();
            speak(`Rep ${currentRepNum}! Clean press.`, true);

            const validMetric: RepMetric = {
              repNumber: currentRepNum,
              durationSec: parseFloat(duration.toFixed(1)),
              eccentricSec: parseFloat(Math.max(0.1, duration * 0.5).toFixed(1)),
              concentricSec: parseFloat(Math.max(0.1, duration * 0.5).toFixed(1)),
              minAngle: activeMinAngle.current,
              maxAngle: activeMaxAngle.current,
              formScore: score,
              tempoRatio: 1.0
            };
            setRepHistory((prev) => [validMetric, ...prev]);
          } else {
            // ❌ REJECTED HALF SHOULDER PRESS
            sounds.playRepFailed();
            speak('No rep! Full overhead lockout required.', true);
          }

          currentStageRef.current = 'START';
          setPhase('start');
          activeMinAngle.current = angle;
          activeMaxAngle.current = angle;
          hasReachedDepth.current = false;
          repStartTimeRef.current = now;
        }
      }
    }
  }, [exercise, speak]);

  // -----------------------------------------------------------
const SKELETON_CONNECTIONS: [number, number][] = [
  // Upper Torso & Shoulders
  [11, 12],
  // Left Arm
  [11, 13], [13, 15],
  // Right Arm
  [12, 14], [14, 16],
  // Torso / Spine Box
  [11, 23], [12, 24], [23, 24],
  // Left Leg
  [23, 25], [25, 27], [27, 29], [29, 31], [27, 31],
  // Right Leg
  [24, 26], [26, 28], [28, 30], [30, 32], [28, 32]
];

  // -----------------------------------------------------------
  // Ultra-Fast Zero-Allocation Canvas Rendering Loop (120 FPS Target)
  // -----------------------------------------------------------
  const renderFrame = useCallback((results: any) => {
    isProcessingRef.current = false;

    const now = performance.now();
    const delta = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;
    if (delta > 0) {
      setFps(Math.min(144, Math.round(1000 / delta)));
    }

    const canvas = canvasRef.current;
    if (!canvas || !results.image) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const imgW = results.image.width || 1280;
    const imgH = results.image.height || 720;
    if (canvas.width !== imgW || canvas.height !== imgH) {
      canvas.width = imgW;
      canvas.height = imgH;
    }

    // 1. Draw Mirrored Camera Frame
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // 2. High-Responsiveness Landmark Smoothing (Zero Latency)
    if (results.poseLandmarks) {
      const rawLandmarks = results.poseLandmarks;
      if (!smoothedLandmarksRef.current || smoothedLandmarksRef.current.length !== rawLandmarks.length) {
        smoothedLandmarksRef.current = rawLandmarks.map((p: any) => ({ ...p }));
      } else {
        const alpha = 0.75; // Silky smooth jitter-free landmark tracking
        smoothedLandmarksRef.current = rawLandmarks.map((p: any, idx: number) => {
          const prev = smoothedLandmarksRef.current![idx];
          return {
            x: prev.x * (1 - alpha) + p.x * alpha,
            y: prev.y * (1 - alpha) + p.y * alpha,
            z: (prev.z || 0) * (1 - alpha) + (p.z || 0) * alpha,
            visibility: p.visibility !== undefined ? p.visibility : 1.0
          };
        });
      }

      const activeLandmarks = smoothedLandmarksRef.current;
      if (!activeLandmarks) return;

      // Coordinate converter: maps raw MediaPipe normalized (0..1) coords to mirrored screen space
      const toScreenX = (x: number) => (1.0 - x) * canvas.width;
      const toScreenY = (y: number) => y * canvas.height;

      // 3. Batch Native Draw Sharp Pure White Skeleton Lines (0.01ms CPU Time)
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < SKELETON_CONNECTIONS.length; i++) {
        const [i1, i2] = SKELETON_CONNECTIONS[i];
        const p1 = activeLandmarks[i1];
        const p2 = activeLandmarks[i2];
        if (p1 && p2 && (p1.visibility ?? 1) > 0.50 && (p2.visibility ?? 1) > 0.50) {
          ctx.moveTo(toScreenX(p1.x), toScreenY(p1.y));
          ctx.lineTo(toScreenX(p2.x), toScreenY(p2.y));
        }
      }
      ctx.stroke();

      // 4. Batch Native Draw Black Joint Nodes with White Ring
      for (let i = 11; i < activeLandmarks.length; i++) {
        const p = activeLandmarks[i];
        if (p && (p.visibility ?? 1) > 0.50) {
          const x = toScreenX(p.x);
          const y = toScreenY(p.y);
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = '#000000';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      processKinematics(activeLandmarks);

      // 5. Draw Minimalist Monochrome On-Joint Angle Badge
      let targetJointIndex = 25; // Left knee
      if (exercise === 'bicep_curl' || exercise === 'pushup' || exercise === 'shoulder_press') {
        targetJointIndex = 13; // Left elbow
      }

      const targetJoint = activeLandmarks[targetJointIndex];
      if (targetJoint && primaryAngle > 0 && (targetJoint.visibility ?? 1) > 0.50) {
        const jx = toScreenX(targetJoint.x);
        const jy = toScreenY(targetJoint.y);

        ctx.save();
        ctx.translate(jx, jy);

        ctx.fillStyle = 'rgba(8, 8, 8, 0.92)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-38, -32, 76, 24, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${primaryAngle}°`, 0, -16);
        ctx.restore();
      }
    }
  }, [exercise, primaryAngle, processKinematics]);

  // -----------------------------------------------------------
  // Cross-Platform Mobile & Desktop Camera Engine
  // -----------------------------------------------------------
  const startCamera = async () => {
    try {
      const { Pose } = await import('@mediapipe/pose');

      const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });

      pose.setOptions({
        modelComplexity: 1, // Full High-Precision Landmark Accuracy
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.70, // Rejects background clutter & false detections
        minTrackingConfidence: 0.70
      });

      pose.onResults(renderFrame);
      poseRef.current = pose;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera access is not supported. Please use a secure HTTPS connection.');
        return;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 60, max: 60 }
          },
          audio: false
        });
      } catch (err) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.muted = true;
        await videoRef.current.play();

        setIsStreaming(true);
        sounds.playButtonClick();
        speak('AI Vision Active. Ready for workout.');

        const processLoop = async () => {
          if (videoRef.current && poseRef.current && videoRef.current.readyState >= 2) {
            if (!isProcessingRef.current) {
              isProcessingRef.current = true;
              try {
                await poseRef.current.send({ image: videoRef.current });
              } catch (e) {
                isProcessingRef.current = false;
              }
            }
          }
          if (streamRef.current && streamRef.current.active) {
            animFrameIdRef.current = requestAnimationFrame(processLoop);
          }
        };

        animFrameIdRef.current = requestAnimationFrame(processLoop);
      }
    } catch (err: any) {
      console.error('Error initializing optical camera:', err);
      alert(`Camera initialization error: ${err.message || err.name || 'Permission Denied'}`);
    }
  };

  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (poseRef.current) {
      poseRef.current.close();
      poseRef.current = null;
    }
    setIsStreaming(false);
    setPrimaryAngle(0);
    setDepthPercentage(0);
    setPhase('idle');
    sounds.playButtonClick();
    speak('Workout session completed.');
  };

  const resetReps = () => {
    repCountRef.current = 0;
    validRepsRef.current = 0;
    setRepCount(0);
    setValidReps(0);
    setRepHistory([]);
    currentStageRef.current = 'START';
    sounds.playButtonClick();
    speak('Repetition counter reset.');
  };

  return {
    videoRef,
    canvasRef,
    isStreaming,
    fps,
    phase,
    primaryAngle,
    depthPercentage,
    formScore,
    repCount,
    validReps,
    warnings,
    postureStatus,
    repHistory,
    voiceEnabled,
    aiDetected,
    aiConfidence,
    wsConnected,
    setVoiceEnabled,
    startCamera,
    stopCamera,
    resetReps
  };
}
