import { BODY_CONNECTIONS, BODY_LANDMARK_INDICES } from './poseConnections';

/**
 * Draws the gamer-aesthetic skeleton on the canvas over the webcam stream.
 * Matches FitNova visual style:
 * - Coral-Orange (#ff5a36) joint nodes with bright core
 * - Cool Blue (#3b82f6) skeleton bones
 *
 * @param {CanvasRenderingContext2D} ctx - 2D context of the overlay canvas
 * @param {Array} landmarks - Detected landmarks in normalized coordinates (0..1)
 * @param {number} width - Canvas pixel width
 * @param {number} height - Canvas pixel height
 */
export function drawSkeleton(ctx, landmarks, width, height) {
  if (!ctx || !landmarks || landmarks.length === 0) return;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // 1. Draw Skeleton Bones (Cool Blue #3b82f6)
  for (const [startIndex, endIndex] of BODY_CONNECTIONS) {
    const startPoint = landmarks[startIndex];
    const endPoint = landmarks[endIndex];

    if (!startPoint || !endPoint) continue;

    const startVis = startPoint.visibility !== undefined ? startPoint.visibility : 1.0;
    const endVis = endPoint.visibility !== undefined ? endPoint.visibility : 1.0;

    // Skip connections with low visibility
    if (startVis < 0.5 || endVis < 0.5) continue;

    const x1 = startPoint.x * width;
    const y1 = startPoint.y * height;
    const x2 = endPoint.x * width;
    const y2 = endPoint.y * height;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = '#3b82f6'; // Cool blue bone line
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.restore();
  }

  // 2. Draw Body Landmarks / Joint Dots (Coral Orange #ff5a36)
  for (const index of BODY_LANDMARK_INDICES) {
    const point = landmarks[index];
    if (!point) continue;

    const vis = point.visibility !== undefined ? point.visibility : 1.0;
    if (vis < 0.5) continue;

    const cx = point.x * width;
    const cy = point.y * height;

    // Outer glow ring (Coral Orange)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, 2 * Math.PI);
    ctx.fillStyle = '#ff5a36';
    ctx.shadowColor = '#ff5a36';
    ctx.shadowBlur = 12;
    ctx.fill();

    // Inner bright white core
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
  }
}
