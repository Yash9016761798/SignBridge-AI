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
 */

import { poseLandmarkerService, type PoseLandmarkerResult } from './pose-landmarker';

export const NUM_LANDMARKS = 33;
export const NUM_FEATURES = 5;

/**
 * Extract pose landmarks from a canvas ImageData object using MediaPipe PoseLandmarker.
 *
 * @param imageData - Raw image data from canvas
 * @param timestamp - Optional timestamp for the frame
 * @returns Array of shape (33, 5) with [x, y, z, visibility, timestamp] per landmark
 */
export async function extractPoseLandmarks(
  imageData: ImageData,
  timestamp: number = 0,
): Promise<number[][]> {
  const result = await detectPoseFromImageData(imageData, timestamp);
  return result.landmarks;
}

/**
 * Extract pose landmarks directly from a video element using MediaPipe PoseLandmarker.
 *
 * @param video - HTMLVideoElement to capture from
 * @param timestamp - Optional timestamp
 * @returns Array of shape (33, 5) or null if capture/pose detection fails
 */
export async function extractPoseFromVideo(
  video: HTMLVideoElement,
  timestamp: number = 0,
): Promise<number[][] | null> {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    return null;
  }

  try {
    const result = await detectPoseFromVideo(video, timestamp);
    return result.landmarks;
  } catch (error) {
    console.error('[PoseExtraction] Failed to extract pose from video:', error);
    return null;
  }
}

/**
 * Create a zero/empty pose frame (all landmarks at center with low visibility).
 * Useful as a fallback or padding when pose detection fails.
 */
export function createEmptyPoseFrame(): number[][] {
  const frame: number[][] = [];
  for (let i = 0; i < NUM_LANDMARKS; i++) {
    frame.push([0.5, 0.5, 0, 0, 0]);
  }
  return frame;
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

async function detectPoseFromVideo(
  video: HTMLVideoElement,
  timestamp: number,
): Promise<PoseLandmarkerResult> {
  await ensureInitialized();
  return poseLandmarkerService.detectForVideo(video, timestamp);
}

async function detectPoseFromImageData(
  imageData: ImageData,
  timestamp: number,
): Promise<PoseLandmarkerResult> {
  await ensureInitialized();

  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context for pose detection');
  }
  ctx.putImageData(imageData, 0, 0);

  // Create an HTMLVideoElement from the canvas to reuse detectForVideo
  // Alternatively, we could use detect() with an ImageBitmap, but detectForVideo
  // is optimized for sequential frames. We create a temporary video-like flow.
  const result = await detectPoseFromCanvas(canvas, timestamp);
  return result;
}

async function detectPoseFromCanvas(
  canvas: HTMLCanvasElement,
  timestamp: number,
): Promise<PoseLandmarkerResult> {
  await ensureInitialized();

  // Use detect() for static images/canvas (IMAGE mode)
  const result = poseLandmarkerService.detect(canvas, timestamp);

  if (!result.landmarks || result.landmarks.length === 0) {
    throw new Error('No pose detected in canvas frame');
  }

  return result;
}

async function ensureInitialized(): Promise<void> {
  if (!poseLandmarkerService.isInitialized()) {
    await poseLandmarkerService.initialize();
  }
}
