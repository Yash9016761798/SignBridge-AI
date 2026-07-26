/**
 * Pose Extraction Utility
 *
 * Converts video/image frames into MediaPipe-compatible pose landmarks
 * with shape (33, 5) — 33 body landmarks, each with [x, y, z, visibility, timestamp].
 *
 * MediaPipe Pose landmark indices:
 *   0=nose, 11=left_shoulder, 12=right_shoulder,
 *   13=left_elbow, 14=right_elbow, 15=left_wrist, 16=right_wrist,
 *   17-22=hand landmarks, 23=left_hip, 24=right_hip, etc.
 *
 * This implementation uses canvas-based brightness analysis to detect
 * the hand/body region and maps it onto a standard body template.
 */

const NUM_LANDMARKS = 33;
const NUM_FEATURES = 5;

/**
 * Standard body template — approximate normalized positions for each
 * MediaPipe Pose landmark when the user is centered in frame.
 * Coordinates are [x, y] in [0,1] range.
 */
const BODY_TEMPLATE: [number, number][] = [
  [0.5, 0.12],  // 0: nose
  [0.5, 0.10],  // 1: left_eye_inner
  [0.5, 0.10],  // 2: left_eye
  [0.48, 0.10], // 3: left_eye_outer
  [0.52, 0.10], // 4: right_eye_inner
  [0.5, 0.10],  // 5: right_eye
  [0.5, 0.10],  // 6: right_eye_outer
  [0.46, 0.12], // 7: left_ear
  [0.54, 0.12], // 8: right_ear
  [0.5, 0.14],  // 9: mouth_left
  [0.5, 0.14],  // 10: mouth_right
  [0.38, 0.28], // 11: left_shoulder
  [0.62, 0.28], // 12: right_shoulder
  [0.32, 0.42], // 13: left_elbow
  [0.68, 0.42], // 14: right_elbow
  [0.28, 0.55], // 15: left_wrist
  [0.72, 0.55], // 16: right_wrist
  [0.26, 0.58], // 17: left_pinky
  [0.74, 0.58], // 18: right_pinky
  [0.27, 0.56], // 19: left_index
  [0.73, 0.56], // 20: right_index
  [0.29, 0.55], // 21: left_thumb
  [0.71, 0.55], // 22: right_thumb
  [0.40, 0.62], // 23: left_hip
  [0.60, 0.62], // 24: right_hip
  [0.38, 0.78], // 25: left_knee
  [0.62, 0.78], // 26: right_knee
  [0.36, 0.92], // 27: left_ankle
  [0.64, 0.92], // 28: right_ankle
  [0.34, 0.95], // 29: left_heel
  [0.66, 0.95], // 30: right_heel
  [0.35, 0.96], // 31: left_foot_index
  [0.65, 0.96], // 32: right_foot_index
];

/**
 * Find the brightest (most active) region in the canvas image data.
 * This is a heuristic for hand/body detection without MediaPipe.
 */
function findBrightestRegion(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): { cx: number; cy: number; brightness: number } {
  const gridSize = 8;
  const cellW = Math.floor(width / gridSize);
  const cellH = Math.floor(height / gridSize);

  let bestCx = width / 2;
  let bestCy = height / 2;
  let bestScore = 0;

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      let sumBrightness = 0;
      let count = 0;

      const startX = gx * cellW;
      const startY = gy * cellH;
      const endX = Math.min(startX + cellW, width);
      const endY = Math.min(startY + cellH, height);

      for (let y = startY; y < endY; y += 3) {
        for (let x = startX; x < endX; x += 3) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];
          if (a > 128) {
            sumBrightness += (r + g + b) / 3;
            count++;
          }
        }
      }

      if (count > 0) {
        const avgBrightness = sumBrightness / count;
        if (avgBrightness > bestScore) {
          bestScore = avgBrightness;
          bestCx = (gx + 0.5) * cellW;
          bestCy = (gy + 0.5) * cellH;
        }
      }
    }
  }

  return {
    cx: bestCx / width,
    cy: bestCy / height,
    brightness: bestScore / 255,
  };
}

/**
 * Extract pose landmarks from a canvas ImageData object.
 *
 * Returns a (33, 5) array compatible with the SignBridge AI model.
 *
 * @param imageData - Raw image data from canvas
 * @param timestamp - Optional timestamp for the frame
 * @returns Array of shape (33, 5) with [x, y, z, visibility, timestamp] per landmark
 */
export function extractPoseLandmarks(
  imageData: ImageData,
  timestamp: number = 0,
): number[][] {
  const { data, width, height } = imageData;

  const region = findBrightestRegion(data, width, height);

  const landmarks: number[][] = [];

  for (let i = 0; i < NUM_LANDMARKS; i++) {
    const template = BODY_TEMPLATE[i];

    let x = template[0];
    let y = template[1];

    if (i >= 15 && i <= 22) {
      const handOffsetX = (region.cx - 0.5) * 0.6;
      const handOffsetY = (region.cy - 0.5) * 0.6;
      x = Math.max(0, Math.min(1, x + handOffsetX));
      y = Math.max(0, Math.min(1, y + handOffsetY));
    } else if (i >= 11 && i <= 14) {
      const shoulderOffsetX = (region.cx - 0.5) * 0.3;
      x = Math.max(0, Math.min(1, x + shoulderOffsetX));
    }

    const z = 0;
    const visibility = region.brightness > 0.1 ? 0.9 : 0.3;

    landmarks.push([x, y, z, visibility, timestamp]);
  }

  return landmarks;
}

/**
 * Extract pose landmarks directly from a video element.
 *
 * @param video - HTMLVideoElement to capture from
 * @param timestamp - Optional timestamp
 * @returns Array of shape (33, 5) or null if capture fails
 */
export function extractPoseFromVideo(
  video: HTMLVideoElement,
  timestamp: number = 0,
): number[][] | null {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return null;

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  return extractPoseLandmarks(imageData, timestamp);
}

/**
 * Create a zero/empty pose frame (all landmarks at center).
 * Useful as a fallback or padding.
 */
export function createEmptyPoseFrame(): number[][] {
  const frame: number[][] = [];
  for (let i = 0; i < NUM_LANDMARKS; i++) {
    frame.push([0.5, 0.5, 0, 0, 0]);
  }
  return frame;
}

export { NUM_LANDMARKS, NUM_FEATURES };
