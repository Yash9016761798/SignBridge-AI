export type TranslationType = 'TEXT_TO_SIGN' | 'SPEECH_TO_SIGN' | 'SIGN_TO_TEXT';
export type PredictionInputType = 'image' | 'video' | 'landmarks';

export interface TranslationSession {
  id: string;
  type: TranslationType;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startedAt: string;
  endedAt: string | null;
  userId: string;
  messages: TranslationMessage[];
}

export interface TranslationMessage {
  id: string;
  inputText: string | null;
  outputText: string | null;
  confidence: number | null;
  language: string;
  createdAt: string;
}

export interface TranslationResult {
  sessionId: string;
  translation: {
    outputText: string;
    confidence: number;
    signs: Array<{
      word: string;
      signVideoUrl: string | null;
      signImageUrl: string | null;
      duration: number;
    }>;
    totalDuration: number;
  };
  historyId: string;
}

export interface PracticeSession {
  id: string;
  confidenceScore: number | null;
  accuracy: number | null;
  feedback: string | null;
  duration: number | null;
  createdAt: string;
  userId: string;
  lessonId: string | null;
  predictions: GesturePrediction[];
  lesson?: { title: string } | null;
}

export interface GesturePrediction {
  id: string;
  predictedGesture: string;
  confidence: number;
  processingTime: number;
  modelVersion: string | null;
  createdAt: string;
}

export interface PredictionResult {
  gesture: string;
  confidence: number;
  alternatives: Array<{ gesture: string; confidence: number }>;
  processingTimeMs: number;
  modelVersion: string;
  predictionType: string;
}

export interface AiHealthStatus {
  backend: { status: string; timestamp: string };
  aiService: { status: string; message?: string; data?: Record<string, unknown> };
}

export interface ModelInfo {
  name: string;
  version: string;
  status: string;
  type: string;
  framework: string;
  input_types: string[];
  num_classes: number;
  supported_gestures: string[];
  confidence_threshold: number;
  description: string;
}
