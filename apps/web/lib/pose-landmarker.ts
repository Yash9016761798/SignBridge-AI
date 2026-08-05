/**
 * MediaPipe PoseLandmarker Service
 *
 * Singleton wrapper around @mediapipe/tasks-vision PoseLandmarker.
 * Handles lazy initialization, WASM loading, and error propagation.
 */

import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export interface PoseLandmarkerService {
  initialize(): Promise<void>;
  isInitialized(): boolean;
  detectForVideo(video: HTMLVideoElement, timestamp: number): PoseLandmarkerResult;
  detect(
    image: HTMLCanvasElement | HTMLImageElement | ImageBitmap,
    timestamp: number,
  ): PoseLandmarkerResult;
  dispose(): void;
}

export interface PoseLandmarkerResult {
  landmarks: number[][];
  visibility: number;
}

class MediaPipePoseLandmarkerService implements PoseLandmarkerService {
  private static instance: MediaPipePoseLandmarkerService | null = null;
  private poseLandmarker: PoseLandmarker | null = null;
  private initialized = false;
  private initializing = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): MediaPipePoseLandmarkerService {
    if (!MediaPipePoseLandmarkerService.instance) {
      MediaPipePoseLandmarkerService.instance = new MediaPipePoseLandmarkerService();
    }
    return MediaPipePoseLandmarkerService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initializing && this.initPromise) {
      return this.initPromise;
    }

    this.initializing = true;
    this.initPromise = (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
        );

        this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        this.initialized = true;
        console.log('[MediaPipe] PoseLandmarker initialized successfully');
      } catch (error) {
        console.error('[MediaPipe] Failed to initialize PoseLandmarker:', error);
        this.poseLandmarker = null;
        this.initialized = false;
        throw new Error(
          `MediaPipe PoseLandmarker initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      } finally {
        this.initializing = false;
      }
    })();

    return this.initPromise;
  }

  isInitialized(): boolean {
    return this.initialized && this.poseLandmarker !== null;
  }

  detectForVideo(video: HTMLVideoElement, timestamp: number): PoseLandmarkerResult {
    if (!this.poseLandmarker) {
      throw new Error('PoseLandmarker not initialized. Call initialize() first.');
    }

    const result = this.poseLandmarker.detectForVideo(video, timestamp);

    if (!result.landmarks || result.landmarks.length === 0) {
      throw new Error('No pose detected in video frame');
    }

    const landmarks = result.landmarks[0];
    const visibility = this.computeAverageVisibility(landmarks);

    return {
      landmarks: landmarks.map((lm) => [lm.x, lm.y, lm.z, lm.visibility ?? 0, timestamp]),
      visibility,
    };
  }

  detect(
    image: HTMLCanvasElement | HTMLImageElement | ImageBitmap,
    timestamp: number,
  ): PoseLandmarkerResult {
    if (!this.poseLandmarker) {
      throw new Error('PoseLandmarker not initialized. Call initialize() first.');
    }

    const result = this.poseLandmarker.detect(image);

    if (!result.landmarks || result.landmarks.length === 0) {
      throw new Error('No pose detected in image');
    }

    const landmarks = result.landmarks[0];
    const visibility = this.computeAverageVisibility(landmarks);

    return {
      landmarks: landmarks.map((lm) => [lm.x, lm.y, lm.z, lm.visibility ?? 0, timestamp]),
      visibility,
    };
  }

  dispose(): void {
    if (this.poseLandmarker) {
      this.poseLandmarker.close();
      this.poseLandmarker = null;
    }
    this.initialized = false;
    this.initializing = false;
    this.initPromise = null;
  }

  private computeAverageVisibility(landmarks: { visibility?: number }[]): number {
    const visibilities = landmarks
      .filter((lm) => typeof lm.visibility === 'number')
      .map((lm) => lm.visibility as number);

    if (visibilities.length === 0) return 0;
    return visibilities.reduce((sum, v) => sum + v, 0) / visibilities.length;
  }
}

export const poseLandmarkerService = MediaPipePoseLandmarkerService.getInstance();
