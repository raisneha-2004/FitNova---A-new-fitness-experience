import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Dotted Skeleton (Standing posture)
 * 33 key landmark dots with connecting faint lines (MediaPipe pose style)
 */
export function DottedSkeletonStanding({ className = '', color = '#ff5a36' }) {
  // Approximate 2D normalized landmark coordinates for a standing athletic pose
  const points = [
    // Head / Face
    { id: 'nose', x: 100, y: 35 },
    { id: 'left_eye', x: 94, y: 30 },
    { id: 'right_eye', x: 106, y: 30 },
    { id: 'left_ear', x: 88, y: 32 },
    { id: 'right_ear', x: 112, y: 32 },
    // Shoulders
    { id: 'l_shoulder', x: 70, y: 75 },
    { id: 'r_shoulder', x: 130, y: 75 },
    // Elbows
    { id: 'l_elbow', x: 50, y: 125 },
    { id: 'r_elbow', x: 150, y: 125 },
    // Wrists
    { id: 'l_wrist', x: 38, y: 175 },
    { id: 'r_wrist', x: 162, y: 175 },
    // Hands / Fingers
    { id: 'l_pinky', x: 34, y: 185 },
    { id: 'r_pinky', x: 166, y: 185 },
    { id: 'l_index', x: 37, y: 190 },
    { id: 'r_index', x: 163, y: 190 },
    { id: 'l_thumb', x: 42, y: 182 },
    { id: 'r_thumb', x: 158, y: 182 },
    // Hips
    { id: 'l_hip', x: 82, y: 185 },
    { id: 'r_hip', x: 118, y: 185 },
    // Knees
    { id: 'l_knee', x: 80, y: 265 },
    { id: 'r_knee', x: 120, y: 265 },
    // Ankles
    { id: 'l_ankle', x: 78, y: 345 },
    { id: 'r_ankle', x: 122, y: 345 },
    // Heels & Feet
    { id: 'l_heel', x: 74, y: 355 },
    { id: 'r_heel', x: 126, y: 355 },
    { id: 'l_foot_index', x: 70, y: 360 },
    { id: 'r_foot_index', x: 130, y: 360 },
  ];

  const connections = [
    ['left_ear', 'left_eye'], ['left_eye', 'nose'], ['nose', 'right_eye'], ['right_eye', 'right_ear'],
    ['l_shoulder', 'r_shoulder'],
    ['l_shoulder', 'l_elbow'], ['l_elbow', 'l_wrist'],
    ['l_wrist', 'l_pinky'], ['l_wrist', 'l_index'], ['l_wrist', 'l_thumb'],
    ['r_shoulder', 'r_elbow'], ['r_elbow', 'r_wrist'],
    ['r_wrist', 'r_pinky'], ['r_wrist', 'r_index'], ['r_wrist', 'r_thumb'],
    ['l_shoulder', 'l_hip'], ['r_shoulder', 'r_hip'],
    ['l_hip', 'r_hip'],
    ['l_hip', 'l_knee'], ['l_knee', 'l_ankle'], ['l_ankle', 'l_heel'], ['l_ankle', 'l_foot_index'],
    ['r_hip', 'r_knee'], ['r_knee', 'r_ankle'], ['r_ankle', 'r_heel'], ['r_ankle', 'r_foot_index'],
  ];

  const pointMap = Object.fromEntries(points.map((p) => [p.id, p]));

  return (
    <svg viewBox="0 0 200 380" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Connectors */}
      {connections.map(([start, end], i) => {
        const p1 = pointMap[start];
        const p2 = pointMap[end];
        if (!p1 || !p2) return null;
        return (
          <line
            key={`conn-${i}`}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke={color}
            strokeWidth="1.2"
            strokeOpacity="0.4"
            strokeDasharray="2 3"
          />
        );
      })}

      {/* Landmarks */}
      {points.map((p) => (
        <circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          r="2.8"
          fill={color}
          className="filter drop-shadow-[0_0_4px_rgba(255,90,54,0.8)]"
        />
      ))}
    </svg>
  );
}

/**
 * Runner Skeleton (Athletic running pose with trailing blur motion lines)
 */
export function DottedSkeletonRunner({ className = '', color = '#ff5a36' }) {
  const points = [
    { id: 'nose', x: 155, y: 40 },
    { id: 'l_shoulder', x: 125, y: 70 },
    { id: 'r_shoulder', x: 145, y: 65 },
    { id: 'l_elbow', x: 95, y: 95 },
    { id: 'l_wrist', x: 110, y: 130 },
    { id: 'r_elbow', x: 175, y: 90 },
    { id: 'r_wrist', x: 195, y: 65 },
    { id: 'l_hip', x: 110, y: 165 },
    { id: 'r_hip', x: 125, y: 160 },
    { id: 'l_knee', x: 70, y: 220 },
    { id: 'l_ankle', x: 50, y: 290 },
    { id: 'r_knee', x: 170, y: 210 },
    { id: 'r_ankle', x: 195, y: 260 },
  ];

  const connections = [
    ['l_shoulder', 'r_shoulder'],
    ['l_shoulder', 'l_elbow'], ['l_elbow', 'l_wrist'],
    ['r_shoulder', 'r_elbow'], ['r_elbow', 'r_wrist'],
    ['l_shoulder', 'l_hip'], ['r_shoulder', 'r_hip'],
    ['l_hip', 'r_hip'],
    ['l_hip', 'l_knee'], ['l_knee', 'l_ankle'],
    ['r_hip', 'r_knee'], ['r_knee', 'r_ankle'],
  ];

  const pointMap = Object.fromEntries(points.map((p) => [p.id, p]));

  return (
    <svg viewBox="0 0 240 340" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="motion-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
        </filter>
        <linearGradient id="trail-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="100%" stopColor={color} stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Motion trails behind the runner */}
      <g opacity="0.3" filter="url(#motion-blur)">
        <path d="M20 70 L125 70" stroke="url(#trail-grad)" strokeWidth="3" />
        <path d="M10 95 L95 95" stroke="url(#trail-grad)" strokeWidth="3" />
        <path d="M0 165 L110 165" stroke="url(#trail-grad)" strokeWidth="4" />
        <path d="M10 220 L70 220" stroke="url(#trail-grad)" strokeWidth="3" />
        <path d="M50 210 L170 210" stroke="url(#trail-grad)" strokeWidth="3" />
      </g>

      {/* Skeleton Bones */}
      {connections.map(([start, end], i) => {
        const p1 = pointMap[start];
        const p2 = pointMap[end];
        if (!p1 || !p2) return null;
        return (
          <line
            key={`r-conn-${i}`}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke={color}
            strokeWidth="1.6"
            strokeOpacity="0.5"
            strokeDasharray="3 3"
          />
        );
      })}

      {/* Skeleton Dots */}
      {points.map((p) => (
        <circle
          key={`r-${p.id}`}
          cx={p.x}
          cy={p.y}
          r="3"
          fill={color}
          className="filter drop-shadow-[0_0_5px_rgba(255,90,54,0.9)]"
        />
      ))}
    </svg>
  );
}

/**
 * BackgroundSkeletons
 * Decorative skeletons for left and right of the features section
 * Features:
 * - Floating up and down slowly
 * - Parallax tracking mouse movement (max 12px)
 * - Pointer-events-none, respect reduced motion
 */
export default function BackgroundSkeletons({ mouseX = 0, mouseY = 0 }) {
  const shouldReduceMotion = useReducedMotion();

  // Parallax offsets (max 12px)
  const leftX = shouldReduceMotion ? 0 : mouseX * -12;
  const leftY = shouldReduceMotion ? 0 : mouseY * -10;
  const rightX = shouldReduceMotion ? 0 : mouseX * 12;
  const rightY = shouldReduceMotion ? 0 : mouseY * 10;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Ambient faint orange radial glow behind the section */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-96 h-96 bg-coral/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-coral/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Left Skeleton: Standing Dotted Pose (25% opacity, floating) */}
      <motion.div
        className="absolute -left-10 lg:left-6 top-1/2 -translate-y-1/2 w-48 sm:w-60 md:w-72 opacity-25"
        animate={
          shouldReduceMotion
            ? { x: 0, y: 0 }
            : {
              x: leftX,
              y: [leftY - 8, leftY + 8, leftY - 8],
            }
        }
        transition={
          shouldReduceMotion
            ? {}
            : {
              y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
              x: { duration: 0.3, ease: 'easeOut' },
            }
        }
        aria-hidden="true"
      >
        <DottedSkeletonStanding className="w-full h-auto" />
      </motion.div>

      {/* Right Skeleton: Running Pose with Trail (25% opacity, parallax) */}
      <motion.div
        className="absolute -right-12 lg:right-4 top-1/2 -translate-y-1/2 w-56 sm:w-72 md:w-80 opacity-25"
        animate={
          shouldReduceMotion
            ? { x: 0, y: 0 }
            : {
              x: rightX,
              y: [rightY + 6, rightY - 6, rightY + 6],
            }
        }
        transition={
          shouldReduceMotion
            ? {}
            : {
              y: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
              x: { duration: 0.3, ease: 'easeOut' },
            }
        }
        aria-hidden="true"
      >
        <DottedSkeletonRunner className="w-full h-auto" />
      </motion.div>
    </div>
  );
}
