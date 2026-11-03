import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, VideoOff, Play, Pause, AlertCircle, RefreshCw, Activity, MessageSquare, Zap, Trophy, Ghost } from 'lucide-react';
import { drawSkeleton } from '../utils/drawSkeleton';
import GhostRaceBar from './GhostRaceBar';
import EnergyBar from './EnergyBar';
import ComboBadge from './ComboBadge';

export default function CameraCard({
  videoRef,
  isActive,
  cameraError,
  startCamera,
  stopCamera,
  landmarker,
  isLandmarkerLoading,
  landmarkerError,
  bodyStatus, // { statusCode, statusText, allVisible }
  onPoseDetected,
  isWorkoutActive,
  isPaused = false,
  onPauseWorkoutClick = null,
  onResumeWorkoutClick = null,
  onStartWorkoutClick,
  onFinishWorkoutClick,
  countdown = null,
  currentAngle,
  liveMetric = null,
  metricLabel = 'Knee',
  metricUnit = '°',
  cameraTip = 'Camera tip: Step back 6-8 feet, full body in frame',
  phase,
  feedback,
  floatingXp = null,
  levelUpEvent = null,
  targetCompletedEvent = null,
  // Auto-Start props
  isAutoStartEnabled = true,
  onToggleAutoStart = null,
  autoStartProgress = 0,
  autoStartSecondsRemaining = 2,
  autoStartStatusMessage = '',
  isAutoStartHolding = false,
  autoStartCancelledMessage = null,
  voiceCueEnabled = false,
  onToggleVoiceCue = null,
  // Ghost Mode props
  ghostModeEnabled = true,
  onToggleGhostMode = null,
  ghostSource = 'last',
  onToggleGhostSource = null,
  activeGhostRun = null,
  ghostCurrentReps = 0,
  ghostPulsing = false,
  // AI Power Mode props
  energyPercent = 0,
  combo = 1,
  // Voice Commands props
  voiceControls = null,
  lastHeard = '',
  voiceToast = null,
}) {

  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);

  // FPS calculation
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());

  // Real-time detection loop
  useEffect(() => {
    let isCancelled = false;

    function renderLoop() {
      if (isCancelled) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (
        isActive &&
        video &&
        canvas &&
        landmarker &&
        video.readyState >= 2 // HAVE_CURRENT_DATA or higher
      ) {
        if (video.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = video.currentTime;

          if (video.videoWidth && video.videoHeight) {
            if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
            }

            try {
              const startTimeMs = performance.now();
              const result = landmarker.detectForVideo(video, startTimeMs);

              const ctx = canvas.getContext('2d');
              if (result && result.landmarks && result.landmarks.length > 0) {
                const primaryLandmarks = result.landmarks[0];
                drawSkeleton(ctx, primaryLandmarks, canvas.width, canvas.height);
                onPoseDetected(primaryLandmarks);
              } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                onPoseDetected(null);
              }

              // Update FPS counter
              frameCountRef.current += 1;
              const now = performance.now();
              if (now - lastFpsTimeRef.current >= 1000) {
                setFps(frameCountRef.current);
                frameCountRef.current = 0;
                lastFpsTimeRef.current = now;
              }
            } catch (err) {
              console.error('Pose detection loop error:', err);
            }
          }
        }
      } else if (!isActive && canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    }

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isCancelled = true;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isActive, landmarker, onPoseDetected, videoRef]);

  // Status pill styling matching requirements:
  // green "Body Detected", amber "Move back", red "Person Not Detected", gray "Camera Off"
  let pillStyle = '';
  let pillText = '';
  let dotColor = '';

  if (isLandmarkerLoading) {
    pillStyle = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    pillText = 'Initializing AI...';
    dotColor = 'bg-amber-400 animate-ping';
  } else if (!isActive) {
    pillStyle = 'bg-white/5 text-slate-400 border-white/10';
    pillText = 'Camera Off';
    dotColor = 'bg-slate-500';
  } else if (bodyStatus.statusCode === 'READY') {
    pillStyle = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10';
    pillText = 'Body Detected';
    dotColor = 'bg-emerald-400';
  } else if (bodyStatus.statusCode === 'PARTIAL') {
    pillStyle = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    pillText = 'Move back';
    dotColor = 'bg-amber-400 animate-pulse';
  } else {
    pillStyle = 'bg-red-500/15 text-red-400 border-red-500/30';
    pillText = 'Person Not Detected';
    dotColor = 'bg-red-400';
  }

  const canStartWorkout = isActive && bodyStatus.allVisible && !isWorkoutActive && countdown === null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111424]/85 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
      {/* Window-style Top Bar */}
      <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-[#ff5a36]/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
          </div>
          <span className="text-xs font-semibold text-slate-300 ml-2 tracking-wide flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-[#ff5a36]" />
            Arena Stream (1280 × 720)
          </span>
        </div>

        {/* Live FPS + Status Pill */}
        <div className="flex items-center gap-2.5">
          {isPaused && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Workout Paused
            </span>
          )}
          {isActive && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40 text-slate-400 border border-white/5">
              {fps} FPS
            </span>
          )}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${pillStyle}`}>
            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
            {pillText}
          </span>
        </div>
      </div>

      {/* Main Video & Skeleton Canvas Area */}
      <div className="relative w-full aspect-video sm:aspect-[16/10] bg-black/80 flex items-center justify-center overflow-hidden">
        {/* Hidden video tag supplying frames to MediaPipe */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover -scale-x-100 transition-opacity duration-300 ${
            isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Canvas overlay for drawing skeleton */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none z-10 transition-opacity duration-300 ${
            isActive ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Offline / Inactive Placeholder State */}
        {!isActive && !isLandmarkerLoading && (
          <div className="flex flex-col items-center justify-center p-6 text-center z-10 max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-[#ff5a36] shadow-inner">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
              Camera Feed Inactive
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              Activate your camera to trigger on-device MediaPipe pose detection. Zero video is saved or streamed.
            </p>
            <button
              onClick={startCamera}
              className="btn-coral px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-[#ff5a36]/30 flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Start Camera
            </button>
          </div>
        )}

        {/* AI Loading Skeleton / Spinner State */}
        {isLandmarkerLoading && (
          <div className="flex flex-col items-center justify-center p-6 z-10 text-center">
            <div className="w-12 h-12 rounded-full border-2 border-[#ff5a36]/20 border-t-[#ff5a36] animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-200">Loading AI Pose Detection Engine...</p>
            <p className="text-xs text-slate-400 mt-1">Downloading lightweight vision task wasm model</p>
          </div>
        )}

        {/* Error message banner */}
        {(cameraError || landmarkerError) && (
          <div className="absolute top-4 left-4 right-4 z-20 p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 backdrop-blur-md text-red-200 text-xs sm:text-sm flex items-start gap-2.5 shadow-lg">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-100">Camera / AI Notice</p>
              <p className="text-red-300 mt-0.5">{cameraError || landmarkerError}</p>
            </div>
          </div>
        )}

        {/* Auto Start Cancelled Alert Banner */}
        {autoStartCancelledMessage && (
          <div className="absolute top-4 left-4 right-4 z-25 p-3 rounded-xl bg-amber-950/85 border border-amber-500/40 backdrop-blur-md text-amber-200 text-xs sm:text-sm flex items-center gap-2.5 shadow-lg animate-fade-in">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium text-amber-100">{autoStartCancelledMessage}</span>
          </div>
        )}

        {/* Auto Start Holding Circular Progress Badge Overlay */}
        {isActive && !isWorkoutActive && countdown === null && isAutoStartEnabled && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5">
            <div className="relative flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#0b0d17]/85 border border-white/10 backdrop-blur-md shadow-lg">
              {/* Circular SVG Progress Ring */}
              <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
                <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    className="stroke-white/10"
                    strokeWidth="3"
                  />
                  {/* Progress Indicator */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#ff5a36"
                    strokeWidth="3"
                    strokeDasharray={2 * Math.PI * 14}
                    strokeDashoffset={2 * Math.PI * 14 * (1 - Math.max(0, Math.min(1, autoStartProgress)))}
                    strokeLinecap="round"
                    className="transition-all duration-150 ease-out"
                  />
                </svg>
                {/* Center dot / icon */}
                <div className={`w-2 h-2 rounded-full absolute ${isAutoStartHolding ? 'bg-[#ff5a36] animate-ping' : 'bg-slate-500'}`} />
              </div>

              {/* Text feedback */}
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Auto Start
                </span>
                <span className="text-xs font-semibold text-white">
                  {isAutoStartHolding
                    ? `Hold still... ${autoStartSecondsRemaining}s`
                    : autoStartStatusMessage || 'Stand straight in full frame'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3-2-1 Countdown Overlay */}
        {countdown !== null && countdown > 0 && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
            <div className="w-28 h-28 rounded-full border-4 border-[#ff5a36] flex items-center justify-center animate-ping absolute" />
            <span className="text-7xl font-extrabold text-[#ff5a36] drop-shadow-[0_0_25px_rgba(255,90,54,0.6)] animate-pulse">
              {countdown}
            </span>
            <p className="text-[#ff5a36] text-sm font-bold mt-4 tracking-wider uppercase">
              Get Into Position!
            </p>
          </div>
        )}

        {/* Workout Started Active Overlay Banner & Current Phase */}
        {isWorkoutActive && (
          <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-lg bg-[#ff5a36]/20 border border-[#ff5a36]/40 backdrop-blur-md flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5a36] animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#ff5a36]">
                Workout Started
              </span>
            </div>

            {/* Current Phase Badge */}
            {phase && (
              <div className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 backdrop-blur-md text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#ff5a36]" />
                <span>Phase: <strong className="text-white">{phase.replace('_', ' ')}</strong></span>
              </div>
            )}

            {/* AI Power Mode Combo Badge */}
            <ComboBadge combo={combo} />
          </div>
        )}

        {/* Pulsing Ghost Skeleton Badge in corner */}
        {isWorkoutActive && ghostModeEnabled && activeGhostRun && (
          <motion.div
            animate={{ scale: ghostPulsing ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3 }}
            className={`absolute top-16 right-4 z-20 px-2.5 py-1.5 rounded-xl border backdrop-blur-md flex items-center gap-1.5 text-xs font-bold transition-colors ${
              ghostPulsing
                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(56,189,248,0.7)]'
                : 'bg-black/50 border-white/10 text-cyan-300'
            }`}
            title="Ghost completed rep pulse"
          >
            <Ghost className="w-4 h-4 text-cyan-300" />
            <span>Ghost: {ghostCurrentReps}</span>
          </motion.div>
        )}

        {/* Live Exercise Metric Badge (e.g. Knee 85°, Elbow 60°, or Jumping Jacks Open/Closed) */}
        {isActive && (liveMetric !== null && liveMetric !== undefined) && (
          <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 backdrop-blur-md text-xs font-medium text-slate-200 shadow-md">
            <span>
              {metricLabel}{' '}
              <strong className="text-[#ff5a36] font-bold">
                {typeof liveMetric === 'number' ? `${liveMetric}${metricUnit}` : liveMetric}
              </strong>
              {typeof liveMetric === 'number' && ' (approx.)'}
            </span>
          </div>
        )}

        {/* Live Heard Phrase Chip (Hands-free voice recognition feedback) */}
        {lastHeard && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-black/70 border border-white/15 backdrop-blur-md text-[11px] font-medium text-slate-200 shadow-lg flex items-center gap-1.5"
            aria-live="polite"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a36] animate-pulse" />
            <span className="text-slate-400">Heard:</span>
            <span className="text-white font-semibold italic">"{lastHeard}"</span>
          </motion.div>
        )}

        {/* Voice Command Execution Toast */}
        <AnimatePresence>
          {voiceToast && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.25 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 z-30 max-w-sm pointer-events-none"
            >
              <div
                className={`px-4 py-2 rounded-xl border backdrop-blur-md shadow-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
                  voiceToast.type === 'success'
                    ? 'bg-gradient-to-r from-emerald-500/90 to-teal-600/90 border-emerald-400/40 text-white shadow-emerald-500/20'
                    : voiceToast.type === 'warning'
                    ? 'bg-amber-500/90 border-amber-400/40 text-black shadow-amber-500/20'
                    : voiceToast.type === 'hint'
                    ? 'bg-[#111424]/95 border-[#ff5a36]/40 text-[#ff5a36] shadow-black/40'
                    : 'bg-slate-900/90 border-white/20 text-white shadow-black/40'
                }`}
              >
                <span>{voiceToast.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slim Energy Bar Overlaid at Bottom of CameraCard */}
        {isWorkoutActive && (
          <div className="absolute bottom-16 left-4 right-4 z-20 max-w-md mx-auto pointer-events-none">
            <EnergyBar energyPercent={energyPercent} combo={combo} compact />
          </div>
        )}

        {/* Camera Tip Banner when camera is active and workout not running */}
        {isActive && !isWorkoutActive && cameraTip && (
          <div className="absolute bottom-4 left-4 right-4 z-20 max-w-md mx-auto pointer-events-none">
            <div className="px-3.5 py-1.5 rounded-xl bg-black/70 border border-white/10 backdrop-blur-md text-[11px] text-slate-300 text-center shadow-lg">
              {cameraTip}
            </div>
          </div>
        )}

        {/* Movement Feedback Bubble (underneath video overlay) */}
        {feedback && feedback.text && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 max-w-sm sm:max-w-md w-11/12">
            <div
              className={`px-4 py-2.5 rounded-xl border backdrop-blur-md shadow-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold transition-all duration-300 ${
                feedback.type === 'good'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                  : feedback.type === 'shallow'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                  : feedback.type === 'warning'
                  ? 'bg-red-500/20 border-red-500/40 text-red-200'
                  : 'bg-white/10 border-white/15 text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0 text-[#ff5a36]" />
              <span className="text-center">{feedback.text}</span>
            </div>
          </div>
        )}

        {/* Floating +10 XP Rep Notification Animation */}
        <AnimatePresence>
          {floatingXp && (
            <motion.div
              key={floatingXp.id}
              initial={{ opacity: 0, scale: 0.7, y: 0 }}
              animate={{ opacity: 1, scale: 1.15, y: -65 }}
              exit={{ opacity: 0, scale: 0.9, y: -90 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
            >
              <div className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#ff5a36] to-amber-500 text-white font-black text-lg sm:text-xl shadow-[0_0_25px_rgba(255,90,54,0.6)] border border-white/30 flex items-center gap-2">
                <Zap className="w-5 h-5 fill-white text-white" />
                <span>+{floatingXp.amount} XP</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level Up Animation Badge */}
        <AnimatePresence>
          {levelUpEvent && (
            <motion.div
              key={levelUpEvent.id}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ type: 'spring', damping: 15 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 pointer-events-none"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#ff5a36] to-amber-400 p-0.5 shadow-[0_0_40px_rgba(255,90,54,0.7)] flex items-center justify-center mb-4"
              >
                <div className="w-full h-full bg-[#111424] rounded-2xl flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
                </div>
              </motion.div>
              <span className="px-4 py-1 rounded-full bg-[#ff5a36]/20 border border-[#ff5a36]/40 text-[#ff5a36] text-xs font-bold uppercase tracking-widest mb-2">
                Level Up!
              </span>
              <h4 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Level {levelUpEvent.level}!
              </h4>
              <p className="text-sm text-slate-300 mt-1 font-medium">
                Keep pushing your arena form!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Target Completed Celebration Modal Banner */}
        <AnimatePresence>
          {targetCompletedEvent && (
            <motion.div
              key={targetCompletedEvent.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <Trophy className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Target Reached
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Workout Complete!
              </h3>
              <p className="text-sm text-slate-300 mt-1 max-w-sm">
                Completed {targetCompletedEvent.targetReps} / {targetCompletedEvent.targetReps} reps!
                {targetCompletedEvent.bonusXp > 0 && (
                  <span className="block text-[#ff5a36] font-bold mt-1">
                    Bonus +{targetCompletedEvent.bonusXp} XP awarded ({targetCompletedEvent.goodPct}% good depth)!
                  </span>
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Action Bar with Orange Primary */}
      <div className="p-4 bg-white/[0.01] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {isActive ? (
            <button
              id="stop-camera-btn"
              onClick={stopCamera}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10 transition-all focus:outline-none"
              aria-label="Stop Camera"
            >
              <VideoOff className="w-4 h-4 text-red-400" />
              Stop Camera
            </button>
          ) : (
            <button
              id="start-camera-btn"
              onClick={startCamera}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10 transition-all focus:outline-none"
              aria-label="Start Camera"
            >
              <Camera className="w-4 h-4 text-[#ff5a36]" />
              Start Camera
            </button>
          )}

          {isActive && (
            <button
              onClick={() => {
                stopCamera();
                setTimeout(() => startCamera(), 200);
              }}
              title="Restart stream"
              className="p-2.5 rounded-xl text-slate-400 hover:text-white bg-white/5 border border-white/10 transition-colors focus:outline-none"
              aria-label="Restart camera feed"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Start / Finish Workout Button Action Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Hands-Free Voice Commands Mic Button & Settings Popover */}
          {voiceControls}

          {/* Auto Start Toggle Switch */}
          {!isWorkoutActive && (
            <label
              htmlFor="auto-start-toggle"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-colors cursor-pointer select-none"
              title="Automatically start workout when holding ready pose for 2 seconds"
            >
              <div className="relative inline-flex items-center">
                <input
                  id="auto-start-toggle"
                  type="checkbox"
                  checked={isAutoStartEnabled}
                  onChange={(e) => {
                    if (typeof onToggleAutoStart === 'function') {
                      onToggleAutoStart(e.target.checked);
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-white/15 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#ff5a36]" />
              </div>
              <span className="text-xs font-semibold text-slate-300">
                Auto start
              </span>
            </label>
          )}

          {/* Pause / Resume Button while workout is active */}
          {isWorkoutActive && (
            <button
              id="pause-resume-workout-btn"
              onClick={isPaused ? onResumeWorkoutClick : onPauseWorkoutClick}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                isPaused
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
              aria-label={isPaused ? 'Resume Workout' : 'Pause Workout'}
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 text-amber-300 fill-amber-300" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 text-slate-300" />
                  Pause
                </>
              )}
            </button>
          )}

          {isWorkoutActive ? (
            <button
              id="finish-workout-btn"
              onClick={onFinishWorkoutClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide bg-gradient-to-r from-red-500/80 to-amber-600/80 hover:from-red-500 hover:to-amber-600 text-white border border-red-500/30 transition-all shadow-md shadow-red-500/20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label="Finish Workout and view summary"
            >
              <Trophy className="w-4 h-4 text-white" />
              Finish Workout
            </button>
          ) : (
            <button
              id="start-workout-btn"
              onClick={onStartWorkoutClick}
              disabled={!canStartWorkout}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#ff5a36] ${
                canStartWorkout
                  ? 'btn-coral cursor-pointer'
                  : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed opacity-50'
              }`}
              aria-label="Start Workout session"
            >
              <Play className={`w-4 h-4 ${canStartWorkout ? 'text-white fill-white' : 'text-slate-500'}`} />
              Start Workout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
