'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ExerciseType, MovementPhase, RepMetric, Landmark } from '@/types/fitness';
import { calculateAngle3D, EXERCISE_CONFIGS, validatePosturePrerequisites } from '@/lib/kinematics';
import { sounds } from '@/lib/soundEffects';

import { playMarathiVoice } from '@/lib/marathiVoice';

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
  const [repHistory, setRepHistory] = useState<RepMetric[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // AI Backend Detection State
  const [aiDetected, setAiDetected] = useState<string>('IDLE');
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  const [wsConnected, setWsConnected] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const cameraRef = useRef<any>(null);
  const poseRef = useRef<any>(null);

  // State Machine Local Refs
  const isProcessingRef = useRef(false);
  const lastFrameTimeRef = useRef(performance.now());
  const repStartTimeRef = useRef(0);
  const activeMinAngle = useRef(360);
  const activeMaxAngle = useRef(0);
  const hasReachedDepth = useRef(false);
  const currentStageRef = useRef<'START' | 'DOWN' | 'BOTTOM' | 'UP'>('START');
  const lastVoiceCueRef = useRef('');
  const lastVoiceTimeRef = useRef(0);

  // -----------------------------------------------------------
  // Real-Time Spoken AI Voice Coach in Fluent Marathi
  // -----------------------------------------------------------
  const speak = useCallback((text: string, force = false) => {
    if (!voiceEnabled) return;
    playMarathiVoice(text, force);
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
  // Biomechanical Angle & Real-Time Marathi Voice Motivation Engine
  // -----------------------------------------------------------
  const processKinematics = useCallback((lm: any[]) => {
    const landmarks: Landmark[] = lm.map((p, idx) => ({
      id: idx,
      x: p.x,
      y: p.y,
      z: p.z || 0,
      visibility: p.visibility || 1.0
    }));

    const posture = validatePosturePrerequisites(exercise, landmarks);
    const angle = posture.primaryAngle;
    setPrimaryAngle(angle);

    if (!posture.isValid) {
      setWarnings([posture.statusMessage]);
      setPhase('idle');
      return;
    }

    let score = 100;
    const currentWarnings: string[] = [];

    // Real-Time Form Analysis & Live Vocal Corrections in Pure Marathi
    if (exercise === 'squat') {
      const kSpread = Math.abs(landmarks[25].x - landmarks[26].x);
      const aSpread = Math.abs(landmarks[27].x - landmarks[28].x);
      if (aSpread > 0.08 && kSpread < aSpread * 0.70 && angle < 125) {
        currentWarnings.push('शेठ गुडघे आत वळतायत, बाहेर ढकला!');
        score -= 15;
        speak('शेठ गुडघे बाहेर ढकला!');
      }
    } else if (exercise === 'pushup') {
      const lElbow = calculateAngle3D(landmarks[11], landmarks[13], landmarks[15]);
      if (lElbow > 85 && angle < 110) {
        currentWarnings.push('कोपरं शरीराच्या जवळ ठेवा शेठ');
        score -= 10;
        speak('कोपरं जवळ ठेवा शेठ!');
      }
    } else if (exercise === 'bicep_curl') {
      const lShoulderElbowAngle = calculateAngle3D(landmarks[23], landmarks[11], landmarks[13]);
      if (lShoulderElbowAngle > 35 && angle < 100) {
        currentWarnings.push('कोपरं बरगड्यांना चिकटवून ठेवा शेठ');
        score -= 15;
        speak('कोपरं चिकटवून ठेवा शेठ!');
      }
    }

    setFormScore(Math.max(0, score));
    setWarnings(currentWarnings);

    if (angle <= 0 || angle > 200) return;

    // Rep State Machine Thresholds
    const cfg = EXERCISE_CONFIGS[exercise];
    const now = performance.now() / 1000;

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
          repStartTimeRef.current = now;
        } else if (angle <= cfg.startThresh - 15) {
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
          sounds.playDepthInflection();

          const depthPhrases = [
            'कडक depth शेठ, लावा ताकद!',
            'मस्त खोल गेलायस शेठ, आता वर!',
            'एक नंबर depth, लावा जोर!'
          ];
          speak(depthPhrases[Math.floor(Math.random() * depthPhrases.length)], true);
        }
      }
      // 3. Bottom Inflection Hold
      else if (currentStageRef.current === 'BOTTOM') {
        if (angle >= cfg.inflectionThresh + 15) {
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

          // Verified Valid Repetition
          if (hasReachedDepth.current && rom >= cfg.minROM && duration >= cfg.minDuration) {
            setRepCount((prev) => {
              const nextRep = prev + 1;
              sounds.playRepSuccess();

              // High-Energy Slang Praise in Marathi
              const praises = [
                `लावा ताकद शेठ! rep ${nextRep}!`,
                `एक नंबर शेठ! rep ${nextRep} कडक!`,
                `नादच खुळा शेठ! rep ${nextRep}!`,
                `राडा झाला पाहिजे शेठ! rep ${nextRep}!`,
                `विषय खोल शेठ! rep ${nextRep} पडला!`
              ];
              const chosenPraise = praises[Math.floor(Math.random() * praises.length)];
              speak(chosenPraise, true);

              return nextRep;
            });
            setValidReps((prev) => prev + 1);

            const metric: RepMetric = {
              repNumber: repCount + 1,
              durationSec: parseFloat(duration.toFixed(1)),
              eccentricSec: parseFloat(Math.max(0.1, duration * 0.5).toFixed(1)),
              concentricSec: parseFloat(Math.max(0.1, duration * 0.5).toFixed(1)),
              minAngle: activeMinAngle.current,
              maxAngle: activeMaxAngle.current,
              formScore: score,
              tempoRatio: 1.0
            };
            setRepHistory((prev) => [metric, ...prev]);
          }

          // Reset cycle
          currentStageRef.current = 'START';
          setPhase('start');
          activeMinAngle.current = angle;
          activeMaxAngle.current = angle;
          hasReachedDepth.current = false;
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
          repStartTimeRef.current = now;
        } else if (angle >= cfg.startThresh + 15) {
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
          speak('पूर्ण वर हात कर भावा!', true);
        }
      } else if (currentStageRef.current === 'BOTTOM') {
        if (angle <= cfg.inflectionThresh - 15) {
          currentStageRef.current = 'DOWN';
          setPhase('eccentric');
        }
      } else if (currentStageRef.current === 'DOWN') {
        if (angle <= cfg.lockoutThresh) {
          const duration = now - repStartTimeRef.current;
          const rom = activeMaxAngle.current - activeMinAngle.current;

          if (hasReachedDepth.current && rom >= cfg.minROM && duration >= cfg.minDuration) {
            setRepCount((prev) => {
              const nextRep = prev + 1;
              sounds.playRepSuccess();
              speak(`मस्त भावा! rep ${nextRep}!`, true);
              return nextRep;
            });
            setValidReps((prev) => prev + 1);
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
  }, [exercise, repCount, speak]);

  // -----------------------------------------------------------
  // Canvas Rendering Loop with Official Google MediaPipe Draw Utils
  // -----------------------------------------------------------
  const renderFrame = useCallback(async (results: any) => {
    isProcessingRef.current = false;

    const now = performance.now();
    const delta = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;
    if (delta > 0) {
      setFps(Math.round(1000 / delta));
    }

    const canvas = canvasRef.current;
    if (!canvas || !results.image) return;
    const ctx = canvas.getContext('2d');
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

    // 2. Draw Official MediaPipe Pose Connectors & Landmarks
    if (results.poseLandmarks) {
      try {
        const { drawConnectors, drawLandmarks } = await import('@mediapipe/drawing_utils');
        const { POSE_CONNECTIONS } = await import('@mediapipe/pose');

        // Draw Glowing Kinetic Cyan Skeleton Connectors
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: '#00F2FE',
          lineWidth: 5
        });

        // Draw Joint Spheres
        drawLandmarks(ctx, results.poseLandmarks, {
          color: '#FF007F',
          fillColor: '#FFFFFF',
          lineWidth: 2,
          radius: 6
        });
      } catch (e) {}

      processKinematics(results.poseLandmarks);

      // 3. Draw On-Joint Angle Badge on active joint
      let targetJointIndex = 25; // Left knee
      if (exercise === 'bicep_curl' || exercise === 'pushup' || exercise === 'shoulder_press') {
        targetJointIndex = 13; // Left elbow
      }

      const targetJoint = results.poseLandmarks[targetJointIndex];
      if (targetJoint && primaryAngle > 0 && (targetJoint.visibility || 1) > 0.35) {
        const jx = targetJoint.x * canvas.width;
        const jy = targetJoint.y * canvas.height;

        ctx.save();
        ctx.translate(jx, jy);
        ctx.scale(-1, 1); // Counter-flip text

        ctx.fillStyle = 'rgba(18, 22, 32, 0.90)';
        ctx.strokeStyle = '#FEF08A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-42, -36, 84, 28, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FEF08A';
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${primaryAngle}°`, 0, -17);
        ctx.restore();
      }
    }

    ctx.restore();
  }, [exercise, primaryAngle, processKinematics]);

  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

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
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      pose.onResults(renderFrame);
      poseRef.current = pose;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('कॅमेरा ॲक्सेस उपलब्ध नाही. कृपया सुरक्षित HTTPS लिंक वापरा.');
        return;
      }

      // Universal Mobile & Desktop Camera Constraints
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (err) {
        // Fallback for older mobile devices
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
        speak('शेठ, AI कॅमेरा चालू झालाय. लावा ताकद!');

        // Continuous High-Speed Frame Processing Loop
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
      alert(`कॅमेरा चालू करताना एरर आला: ${err.message || err.name || 'Permission Denied'}`);
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
    speak('कडक workout झाला शेठ!');
  };

  const resetReps = () => {
    setRepCount(0);
    setValidReps(0);
    setRepHistory([]);
    currentStageRef.current = 'START';
    sounds.playButtonClick();
    speak('Reps reset केलेत शेठ, नवीन set सुरू करा!');
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
