# Real-time 3D Biomechanics & Pose Intelligence Platform 🏋️‍♂️⚡

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-1.0.0-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![MediaPipe](https://img.shields.io/badge/Google-MediaPipe-blue?style=for-the-badge&logo=google)](https://developers.google.com/mediapipe)
[![YOLOv8](https://img.shields.io/badge/Ultralytics-YOLOv8--Pose-00FFFF?style=for-the-badge)](https://github.com/ultralytics/ultralytics)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C?style=for-the-badge&logo=pytorch)](https://pytorch.org/)

An industrial-grade, full-stack **3D Biomechanical Human Pose Estimation, Form Evaluation, and Real-Time NLP Voice Mentorship Platform**. 

Engineered with dual-engine computer vision (MediaPipe Pose + YOLOv8-Pose PyTorch), 5-phase finite state machines (FSM), multi-layer liquid acrylic glass UI (Tamas-Ingle luxury aesthetic), and high-energy real-time spoken coaching.

---

## 🌟 Key Features

### 1. 👁️ Dual-Engine Computer Vision
- **Browser MediaPipe Hardware Pipeline:** 60 FPS client-side pose estimation using WebGL / WebAssembly SIMD hardware acceleration.
- **Ultralytics YOLOv8-Pose (PyTorch):** Deep learning COCO-17 keypoint tracking running natively on PyTorch with real-time bounding box kinematic inference.

### 2. 📐 Clinical 3D Kinematics & FSM Repetition Counting
- **3D Joint Angle Calculation:** Real-time vectors across femoral-tibial, humero-radial, and spinal flexion axes.
- **5-Phase State Machine:** `START` $\to$ `ECCENTRIC` $\to$ `INFLECTION` $\to$ `CONCENTRIC` $\to$ `LOCKOUT` cycle verification.
- **Real-Time Biomechanical Error Detection:**
  - Knee valgus collapse (inward knee buckling)
  - Excessive anterior torso pitch
  - Lateral elbow flare / humeral impingement
  - Partial range of motion & premature lockout

### 3. 🎙️ Real-Time Biomechanical NLP Voice Mentor
- **Contextual Cognitive Reasoning:** Dynamically generates spoken feedback based on tempo ratios, ROM degrees, and joint stability.
- **High-Energy "शेठ / लावा ताकद" Slang Mode:** Authentic, motivating Marathi gym-buddy persona (*"कडक depth शेठ, लावा ताकद!"*, *"शेठ गुडघे बाहेर ढकला!"*, *"नादच खुळा शेठ!"*).
- **Zero Audio Overlap Streamer:** Server-side `gTTS` streaming with instant audio cancellation and Web Speech API fallback.

### 4. 💎 Luxury Liquid Acrylic Glass UI
- **Tamas-Ingle Editorial Design:** Mac Terminal glass cards (`🔴 🟡 🟢` traffic light dots, obsidian dark glass, and column dividers).
- **Vogue Typography & Glowing Accents:** Didone masthead typography with soft ambient white/warm glow indicators (`#FEF9C3`).
- **Responsive Mobile Engine:** Native `navigator.mediaDevices.getUserMedia` with `playsinline` support for iOS Safari and Android Chrome.

---

## 📂 Project Architecture

```
├── backend/                  # FastAPI High-Performance Python Backend
│   ├── api/                  # REST & WebSocket Endpoints (/ws/live-session, /api/mentor)
│   ├── engine/               # Kinematics, Form Evaluator & 5-Phase State Machine
│   ├── schemas/              # Pydantic Telemetry & Metric Models
│   └── services/             # Real-Time NLP Mentorship & gTTS Voice Engine
│
├── web/                      # Next.js 16 (App Router + Turbopack) Frontend
│   ├── src/app/              # Layout, Global CSS & Liquid Acrylic Styling
│   ├── src/components/       # Mac Terminal Cards, VisionCanvas, Hero, Protractor & NLP Mentor
│   ├── src/hooks/            # usePoseTracker (Native getUserMedia & MediaPipe Loop)
│   └── src/lib/              # Marathi Voice Synthesizer, Kinematics & Audio Engine
│
├── ml/                       # Machine Learning Training & Deep Ensembles
│   ├── models/               # Trained Random Forest, XGBoost & LightGBM Classifiers
│   └── train_deep_ensemble.py# 175,000 Sample Synthetic & Augmented Biomechanical Dataset Trainer
│
├── standalone_cv_tracker.py  # 60 FPS Standalone OpenCV Hardware Tracker
└── yolo_biomechanics_tracker.py # Native Ultralytics YOLOv8-Pose Tracker
```

---

## 🚀 Quickstart Guide

### 1. Backend (FastAPI & PyTorch)

```bash
# Create virtual environment & install requirements
python -m venv venv
.\venv\Scripts\activate

pip install fastapi uvicorn websockets pydantic opencv-python numpy scikit-learn ultralytics torch torchvision gTTS

# Start FastAPI server on port 8000
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### 2. Frontend (Next.js 16 & Turbopack)

```bash
cd web
npm install
npm run dev -- -p 3000
```

Open **`http://localhost:3000`** in your browser!

---

## 📱 Mobile Device Testing

1. Connect your phone to the same Wi-Fi as your machine.
2. Open `http://<YOUR_LOCAL_IP>:3000` on your mobile browser (e.g. Chrome / Safari).
3. Tap **Start Camera** and grant camera permissions to activate real-time mobile workout tracking!

---

## 📄 License
MIT License. Built for sports science, athletic longevity, and intelligent human motion analysis.
