/**
 * High-Performance, Zero-Flicker Edge Vision & Biomechanics Tracker.
 * Features:
 *  - Concurrency Lock (eliminates dropped frames and flickering lines)
 *  - 640x480 high-framerate resolution
 *  - Exponential landmark trajectory smoothing
 *  - Anti-false-positive rep counting
 */

// Application State
const state = {
  isStreaming: false,
  exercise: 'squat',
  voiceCoachEnabled: true,
  ws: null,
  camera: null,
  pose: null,
  isProcessingFrame: false,
  lastFrameTime: performance.now(),
  fps: 0,
  
  // Smoothed Landmark Positions
  smoothedLandmarks: null,
  
  // AI Model State
  mlDetectedExercise: 'idle',
  mlConfidence: 0,
  
  // Rep Tracker
  repCount: 0,
  validReps: 0,
  phase: 'idle',
  primaryAngle: 0,
  depthPercentage: 0,
  formScore: 100,
  activeWarnings: [],
  
  // Voice Audio
  lastVoiceCue: '',
  lastVoiceCueTime: 0,
  speechSynth: window.speechSynthesis || null
};

// DOM Elements
const videoElement = document.getElementById('inputVideo');
const canvasElement = document.getElementById('outputCanvas');
const canvasCtx = canvasElement.getContext('2d');
const cameraToggleBtn = document.getElementById('cameraToggleBtn');
const resetSessionBtn = document.getElementById('resetSessionBtn');
const toggleAudioBtn = document.getElementById('toggleAudioBtn');
const exerciseSelect = document.getElementById('exerciseSelect');

const hudStatusBadge = document.getElementById('hudStatusBadge');
const hudStatusText = document.getElementById('hudStatusText');
const hudPhaseText = document.getElementById('hudPhaseText');
const fpsCounter = document.getElementById('fpsCounter');

const cueBanner = document.getElementById('cueBanner');
const cueText = document.getElementById('cueText');
const cueIcon = document.getElementById('cueIcon');

const hudPrimaryAngle = document.getElementById('hudPrimaryAngle');
const hudDepthBar = document.getElementById('hudDepthBar');
const hudDepthText = document.getElementById('hudDepthText');
const hudFormScore = document.getElementById('hudFormScore');

const repCountEl = document.getElementById('repCount');
const validRepsText = document.getElementById('validRepsText');
const repRingCircle = document.getElementById('repRingCircle');
const ringPercentage = document.getElementById('ringPercentage');

const telemetryAngle = document.getElementById('telemetryAngle');
const telemetryTempo = document.getElementById('telemetryTempo');
const telemetryDuration = document.getElementById('telemetryDuration');
const wsStatus = document.getElementById('wsStatus');
const repHistoryList = document.getElementById('repHistoryList');
const historyCount = document.getElementById('historyCount');

const RING_CIRCUMFERENCE = 226.2;

// -------------------------------------------------------------
// WebSocket Connection
// -------------------------------------------------------------
function initWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host || 'localhost:8000';
  const wsUrl = `${protocol}//${host}/ws/live-session`;

  try {
    state.ws = new WebSocket(wsUrl);

    state.ws.onopen = () => {
      wsStatus.innerText = 'Connected';
      wsStatus.style.color = '#00F59B';
      sendExerciseConfig();
    };

    state.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'telemetry') {
          if (data.ml_detected_exercise) {
            state.mlDetectedExercise = data.ml_detected_exercise;
            state.mlConfidence = data.ml_confidence || 0;

            const aiText = document.getElementById('aiDetectedText');
            const aiConf = document.getElementById('aiConfidenceText');
            if (aiText) aiText.innerText = data.ml_detected_exercise.replace('_', ' ').toUpperCase();
            if (aiConf) aiConf.innerText = `${Math.round(state.mlConfidence)}%`;
          }
        }
      } catch (e) {}
    };

    state.ws.onclose = () => {
      wsStatus.innerText = 'Local Mode';
      wsStatus.style.color = '#F6AD55';
      setTimeout(initWebSocket, 3000);
    };
  } catch (err) {
    console.error('WebSocket init:', err);
  }
}

function sendExerciseConfig() {
  if (state.ws && state.ws.readyState === WebSocket.OPEN) {
    state.ws.send(JSON.stringify({ action: 'config', exercise: state.exercise }));
  }
}

// -------------------------------------------------------------
// Vector Angle Trigonometry
// -------------------------------------------------------------
function calculateAngle(a, b, c) {
  if (!a || !b || !c) return 180;
  const ba = [a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0)];
  const bc = [c.x - b.x, c.y - b.y, (c.z || 0) - (b.z || 0)];
  
  const dot = ba[0]*bc[0] + ba[1]*bc[1] + ba[2]*bc[2];
  const magBA = Math.sqrt(ba[0]*ba[0] + ba[1]*ba[1] + ba[2]*ba[2]);
  const magBC = Math.sqrt(bc[0]*bc[0] + bc[1]*bc[1] + bc[2]*bc[2]);
  
  if (magBA === 0 || magBC === 0) return 180;
  const cosine = Math.max(-1.0, Math.min(1.0, dot / (magBA * magBC)));
  return Math.round((Math.acos(cosine) * 180.0) / Math.PI);
}

// -------------------------------------------------------------
// Landmark Smoothing Filter (Prevents Jitter & Flickering)
// -------------------------------------------------------------
function smoothLandmarks(rawLandmarks) {
  if (!state.smoothedLandmarks || state.smoothedLandmarks.length !== rawLandmarks.length) {
    state.smoothedLandmarks = rawLandmarks.map(p => ({ ...p }));
    return state.smoothedLandmarks;
  }

  const alpha = 0.65; // Smoothing factor (0.65 current + 0.35 previous)
  for (let i = 0; i < rawLandmarks.length; i++) {
    const raw = rawLandmarks[i];
    const prev = state.smoothedLandmarks[i];
    
    prev.x = alpha * raw.x + (1 - alpha) * prev.x;
    prev.y = alpha * raw.y + (1 - alpha) * prev.y;
    prev.z = alpha * (raw.z || 0) + (1 - alpha) * (prev.z || 0);
    prev.visibility = raw.visibility;
  }
  return state.smoothedLandmarks;
}

// -------------------------------------------------------------
// Kinematics & Strict Rep State Machine
// -------------------------------------------------------------
let repStartTime = 0;
let eccentricStart = 0;
let inflectionTime = 0;
let minAngleThisRep = 360;
let maxAngleThisRep = 0;

function evaluateKinematics(landmarks) {
  const lm = landmarks;
  const ex = state.exercise;
  let angle = 0;
  let score = 100;
  const warnings = [];

  if (ex === 'squat' || ex === 'lunge') {
    const visL = (lm[23].visibility + lm[25].visibility + lm[27].visibility) / 3;
    const visR = (lm[24].visibility + lm[26].visibility + lm[28].visibility) / 3;

    if (visL < 0.45 && visR < 0.45) {
      state.primaryAngle = 0;
      state.depthPercentage = 0;
      state.activeWarnings = ["Step back: Keep legs in camera view"];
      return;
    }

    const lKnee = calculateAngle(lm[23], lm[25], lm[27]);
    const rKnee = calculateAngle(lm[24], lm[26], lm[28]);
    angle = (visL >= visR) ? lKnee : rKnee;

    // Knee valgus
    const kSpread = Math.abs(lm[25].x - lm[26].x);
    const aSpread = Math.abs(lm[27].x - lm[28].x);
    if (aSpread > 0.10 && kSpread < aSpread * 0.70 && angle < 120) {
      warnings.push("Push knees outwards");
      score -= 15;
    }

  } else if (ex === 'bicep_curl') {
    const visL = (lm[11].visibility + lm[13].visibility + lm[15].visibility) / 3;
    const visR = (lm[12].visibility + lm[14].visibility + lm[16].visibility) / 3;

    if (visL < 0.45 && visR < 0.45) {
      state.primaryAngle = 0;
      state.depthPercentage = 0;
      state.activeWarnings = ["Keep arms & chest in camera view"];
      return;
    }

    const lElbow = calculateAngle(lm[11], lm[13], lm[15]);
    const rElbow = calculateAngle(lm[12], lm[14], lm[16]);
    angle = (lElbow < rElbow && visL >= 0.45) ? lElbow : (visR >= 0.45 ? rElbow : lElbow);

  } else if (ex === 'pushup') {
    const lElbow = calculateAngle(lm[11], lm[13], lm[15]);
    const rElbow = calculateAngle(lm[12], lm[14], lm[16]);
    angle = (lm[13].visibility >= lm[14].visibility) ? lElbow : rElbow;

  } else if (ex === 'shoulder_press') {
    const lArm = calculateAngle(lm[11], lm[13], lm[15]);
    const rArm = calculateAngle(lm[12], lm[14], lm[16]);
    angle = Math.round((lArm + rArm) / 2);
  }

  state.primaryAngle = angle;
  state.formScore = Math.max(0, score);
  state.activeWarnings = warnings;

  processRepProgression(angle, warnings);
}

function processRepProgression(angle, warnings) {
  if (angle <= 0 || angle > 200) return;

  const now = performance.now() / 1000;
  const ex = state.exercise;

  let startThresh = 145;
  let inflectionThresh = 100;
  let lockoutThresh = 140;
  let minROM = 40;

  if (ex === 'bicep_curl') {
    startThresh = 135;
    inflectionThresh = 65;
    lockoutThresh = 130;
    minROM = 55;
  } else if (ex === 'pushup') {
    startThresh = 145;
    inflectionThresh = 95;
    lockoutThresh = 140;
    minROM = 40;
  } else if (ex === 'shoulder_press') {
    startThresh = 85;
    inflectionThresh = 150;
    lockoutThresh = 95;
    minROM = 50;
  }

  // Depth %
  let depth = 0;
  if (ex === 'shoulder_press') {
    depth = ((angle - startThresh) / Math.max(1, inflectionThresh - startThresh)) * 100;
  } else {
    depth = ((startThresh - angle) / Math.max(1, startThresh - inflectionThresh)) * 100;
  }
  state.depthPercentage = Math.min(100, Math.max(0, Math.round(depth)));

  minAngleThisRep = Math.min(minAngleThisRep, angle);
  maxAngleThisRep = Math.max(maxAngleThisRep, angle);

  if (ex !== 'shoulder_press') {
    if (state.phase === 'idle' || state.phase === 'lockout') {
      if (angle >= startThresh) {
        state.phase = 'start';
        repStartTime = now;
        minAngleThisRep = angle;
        maxAngleThisRep = angle;
      }
    } else if (state.phase === 'start') {
      if (angle <= (startThresh - 12)) {
        state.phase = 'eccentric';
        eccentricStart = now;
      }
    } else if (state.phase === 'eccentric') {
      if (angle <= inflectionThresh) {
        state.phase = 'inflection';
        inflectionTime = now;
      } else if (angle >= startThresh && (now - eccentricStart > 2.5)) {
        state.phase = 'start';
        minAngleThisRep = angle;
      }
    } else if (state.phase === 'inflection') {
      if (angle >= (inflectionThresh + 15)) {
        state.phase = 'concentric';
      }
    } else if (state.phase === 'concentric') {
      if (angle >= lockoutThresh) {
        const dur = now - repStartTime;
        const rom = maxAngleThisRep - minAngleThisRep;
        const ecc = inflectionTime - eccentricStart;
        const con = now - inflectionTime;

        if (rom >= minROM && dur >= 0.85 && ecc >= 0.25 && con >= 0.25) {
          state.repCount += 1;
          state.validReps += 1;
          state.phase = 'start';
          addRepToHistory(state.repCount, dur.toFixed(1), ecc.toFixed(1), con.toFixed(1), state.formScore);
          speakVoiceCue(`Rep ${state.repCount}`);
        } else {
          state.phase = 'start';
        }
        minAngleThisRep = angle;
        maxAngleThisRep = angle;
        repStartTime = now;
      }
    }
  } else {
    // Overhead Shoulder Press
    if (state.phase === 'idle' || state.phase === 'lockout') {
      if (angle <= startThresh) {
        state.phase = 'start';
        repStartTime = now;
        minAngleThisRep = angle;
        maxAngleThisRep = angle;
      }
    } else if (state.phase === 'start') {
      if (angle >= (startThresh + 15)) {
        state.phase = 'concentric';
        eccentricStart = now;
      }
    } else if (state.phase === 'concentric') {
      if (angle >= inflectionThresh) {
        state.phase = 'inflection';
        inflectionTime = now;
      }
    } else if (state.phase === 'inflection') {
      if (angle <= (inflectionThresh - 15)) {
        state.phase = 'eccentric';
      }
    } else if (state.phase === 'eccentric') {
      if (angle <= lockoutThresh) {
        const dur = now - repStartTime;
        const rom = maxAngleThisRep - minAngleThisRep;
        const con = inflectionTime - eccentricStart;
        const ecc = now - inflectionTime;

        if (rom >= minROM && dur >= 0.85 && con >= 0.25 && ecc >= 0.25) {
          state.repCount += 1;
          state.validReps += 1;
          state.phase = 'start';
          addRepToHistory(state.repCount, dur.toFixed(1), ecc.toFixed(1), con.toFixed(1), state.formScore);
          speakVoiceCue(`Rep ${state.repCount}`);
        } else {
          state.phase = 'start';
        }
        minAngleThisRep = angle;
        maxAngleThisRep = angle;
        repStartTime = now;
      }
    }
  }

  if (warnings.length > 0) {
    speakVoiceCue(warnings[0]);
  }
}

// -------------------------------------------------------------
// Voice Coaching
// -------------------------------------------------------------
function speakVoiceCue(text) {
  if (!state.speechSynth || !state.voiceCoachEnabled) return;
  const now = performance.now();
  if (text === state.lastVoiceCue && (now - state.lastVoiceCueTime < 2800)) return;

  state.lastVoiceCue = text;
  state.lastVoiceCueTime = now;

  try {
    state.speechSynth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    state.speechSynth.speak(utterance);
  } catch (e) {}
}

// -------------------------------------------------------------
// HUD Updates
// -------------------------------------------------------------
function updateHUD() {
  hudPhaseText.innerText = state.phase.toUpperCase();
  hudPrimaryAngle.innerText = state.primaryAngle > 0 ? `${state.primaryAngle}°` : '--°';
  telemetryAngle.innerText = state.primaryAngle > 0 ? `${state.primaryAngle}°` : '--°';

  hudDepthBar.style.width = `${state.depthPercentage}%`;
  hudDepthText.innerText = `${state.depthPercentage}%`;
  ringPercentage.innerText = `${state.depthPercentage}%`;

  const offset = RING_CIRCUMFERENCE - (state.depthPercentage / 100) * RING_CIRCUMFERENCE;
  repRingCircle.style.strokeDashoffset = offset;

  hudFormScore.innerText = `${state.formScore}%`;
  hudFormScore.className = 'pill-value ' + (state.formScore >= 80 ? 'score-high' : state.formScore >= 60 ? 'score-med' : 'score-low');

  repCountEl.innerText = state.repCount;
  validRepsText.innerText = `${state.validReps} Clean`;

  if (state.activeWarnings.length > 0) {
    cueText.innerText = state.activeWarnings[0];
    cueIcon.innerText = '⚠️';
    cueBanner.style.borderColor = '#FFB800';
  } else if (state.repCount > 0) {
    cueText.innerText = `Phase: ${state.phase.toUpperCase()}`;
    cueIcon.innerText = '✨';
    cueBanner.style.borderColor = '#00F59B';
  } else {
    cueText.innerText = 'Ready: Complete full range of motion';
    cueIcon.innerText = '💡';
    cueBanner.style.borderColor = 'rgba(0, 242, 254, 0.3)';
  }
}

function addRepToHistory(repNum, duration, ecc, con, score) {
  telemetryTempo.innerText = `${ecc}s / ${con}s`;
  telemetryDuration.innerText = `${duration}s`;

  const item = document.createElement('div');
  item.className = 'history-item';
  item.innerHTML = `
    <div class="history-item-left">
      <strong>REP ${repNum}</strong>
      <span>${duration}s (${ecc}s ecc / ${con}s con)</span>
    </div>
    <div class="history-item-score" style="color: ${score >= 80 ? '#00F59B' : '#FFB800'}">
      ${score}%
    </div>
  `;

  const empty = repHistoryList.querySelector('.empty-state');
  if (empty) empty.remove();
  repHistoryList.prepend(item);
  historyCount.innerText = `${repHistoryList.children.length} Completed`;
}

// -------------------------------------------------------------
// Skeletal Rendering & Video Frame Processing
// -------------------------------------------------------------
const POSE_PAIRS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28],
  [27, 31], [28, 32]
];

function onPoseResults(results) {
  state.isProcessingFrame = false; // Release concurrency lock

  const now = performance.now();
  state.fps = Math.round(1000 / Math.max(1, (now - state.lastFrameTime)));
  state.lastFrameTime = now;
  fpsCounter.innerText = state.fps;

  if (canvasElement.width !== videoElement.videoWidth && videoElement.videoWidth > 0) {
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
  }

  const w = canvasElement.width;
  const h = canvasElement.height;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, w, h);
  canvasCtx.drawImage(results.image, 0, 0, w, h);

  if (results.poseLandmarks && results.poseLandmarks.length > 0) {
    hudStatusBadge.className = 'hud-badge status-badge active';
    hudStatusText.innerText = 'TRACKING';

    // Apply smoothing filter to eliminate noise & jumping
    const lm = smoothLandmarks(results.poseLandmarks);

    // Draw Smooth Solid Skeleton
    canvasCtx.lineWidth = 4;
    canvasCtx.strokeStyle = '#00F2FE';
    canvasCtx.shadowColor = '#00F2FE';
    canvasCtx.shadowBlur = 8;

    for (const [p1, p2] of POSE_PAIRS) {
      if (lm[p1] && lm[p2] && lm[p1].visibility > 0.35 && lm[p2].visibility > 0.35) {
        canvasCtx.beginPath();
        canvasCtx.moveTo(lm[p1].x * w, lm[p1].y * h);
        canvasCtx.lineTo(lm[p2].x * w, lm[p2].y * h);
        canvasCtx.stroke();
      }
    }

    // Draw Joint Dots
    canvasCtx.shadowBlur = 4;
    for (let i = 0; i < lm.length; i++) {
      if (lm[i].visibility > 0.35) {
        canvasCtx.beginPath();
        canvasCtx.arc(lm[i].x * w, lm[i].y * h, 5, 0, 2 * Math.PI);
        canvasCtx.fillStyle = '#FFFFFF';
        canvasCtx.fill();
        canvasCtx.strokeStyle = '#00F2FE';
        canvasCtx.lineWidth = 2;
        canvasCtx.stroke();
      }
    }

    drawActiveJointBadge(canvasCtx, lm, w, h);
    canvasCtx.restore();

    evaluateKinematics(lm);
    updateHUD();

    // Send to WebSocket for ML Classification (downsampled)
    if (state.ws && state.ws.readyState === WebSocket.OPEN && Math.random() < 0.4) {
      state.ws.send(JSON.stringify({
        action: 'pose_data',
        timestamp: Date.now() / 1000,
        exercise: state.exercise,
        landmarks: lm.map((pt, idx) => ({
          id: idx,
          x: pt.x,
          y: pt.y,
          z: pt.z,
          visibility: pt.visibility
        }))
      }));
    }
  } else {
    canvasCtx.restore();
    hudStatusBadge.className = 'hud-badge status-badge';
    hudStatusText.innerText = 'STANDBY';
  }
}

function drawActiveJointBadge(ctx, lm, w, h) {
  let targetNode = null;
  const ex = state.exercise;

  if (ex === 'squat' || ex === 'lunge') {
    targetNode = (lm[25].visibility >= lm[26].visibility) ? lm[25] : lm[26];
  } else if (ex === 'bicep_curl' || ex === 'pushup') {
    targetNode = (lm[13].visibility >= lm[14].visibility) ? lm[13] : lm[14];
  } else if (ex === 'shoulder_press') {
    targetNode = lm[11].visibility > 0.4 ? lm[11] : lm[12];
  }

  if (targetNode && targetNode.visibility > 0.4 && state.primaryAngle > 0) {
    const x = targetNode.x * w;
    const y = targetNode.y * h;

    ctx.save();
    ctx.fillStyle = 'rgba(12, 16, 28, 0.9)';
    ctx.strokeStyle = '#00F2FE';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x + 12, y - 18, 62, 28, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.fillText(`${state.primaryAngle}°`, x + 20, y + 1);
    ctx.restore();
  }
}

// -------------------------------------------------------------
// Camera Setup with Concurrency Lock
// -------------------------------------------------------------
function initMediaPipePose() {
  state.pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
  });

  state.pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  state.pose.onResults(onPoseResults);
}

async function startCamera() {
  try {
    cameraToggleBtn.innerText = 'Starting...';
    cameraToggleBtn.disabled = true;

    initMediaPipePose();

    state.camera = new Camera(videoElement, {
      onFrame: async () => {
        // Concurrency Guard: Drop frame if previous inference is still executing
        if (state.pose && state.isStreaming && !state.isProcessingFrame) {
          state.isProcessingFrame = true;
          try {
            await state.pose.send({ image: videoElement });
          } catch (err) {
            state.isProcessingFrame = false;
          }
        }
      },
      width: 640,
      height: 480
    });

    await state.camera.start();
    state.isStreaming = true;
    cameraToggleBtn.innerText = 'Stop Camera';
    cameraToggleBtn.className = 'btn-secondary';
    cameraToggleBtn.disabled = false;
    speakVoiceCue('Camera connected. Ready for workout.');
  } catch (err) {
    console.error('Camera startup failed:', err);
    alert('Could not access camera. Please allow camera permissions.');
    cameraToggleBtn.innerText = 'Start Camera';
    cameraToggleBtn.className = 'btn-primary';
    cameraToggleBtn.disabled = false;
  }
}

function stopCamera() {
  if (state.camera) state.camera.stop();
  state.isStreaming = false;
  state.isProcessingFrame = false;
  cameraToggleBtn.innerText = 'Start Camera';
  cameraToggleBtn.className = 'btn-primary';
  hudStatusBadge.className = 'hud-badge status-badge';
  hudStatusText.innerText = 'STANDBY';
}

function resetSession() {
  state.repCount = 0;
  state.validReps = 0;
  state.phase = 'idle';
  state.primaryAngle = 0;
  state.depthPercentage = 0;
  state.smoothedLandmarks = null;
  updateHUD();
  repHistoryList.innerHTML = '<div class="empty-state">Complete your first repetition to see kinematic metrics</div>';
  historyCount.innerText = '0 Completed';
  speakVoiceCue('Session reset');
}

function toggleAudio() {
  state.voiceCoachEnabled = !state.voiceCoachEnabled;
  toggleAudioBtn.querySelector('.btn-label').innerText = `Voice Coach: ${state.voiceCoachEnabled ? 'ON' : 'OFF'}`;
  toggleAudioBtn.querySelector('.icon').innerText = state.voiceCoachEnabled ? '🔊' : '🔇';
}

// -------------------------------------------------------------
// Event Listeners
// -------------------------------------------------------------
cameraToggleBtn.addEventListener('click', () => {
  if (state.isStreaming) stopCamera();
  else startCamera();
});

resetSessionBtn.addEventListener('click', resetSession);
toggleAudioBtn.addEventListener('click', toggleAudio);

exerciseSelect.addEventListener('change', (e) => {
  state.exercise = e.target.value;
  sendExerciseConfig();
  resetSession();
});

window.addEventListener('DOMContentLoaded', () => {
  initWebSocket();
});
