import apiClient from './api';
import type {
  TranslationSession,
  TranslationResult,
  PracticeSession,
  GesturePrediction,
  PredictionResult,
  AiHealthStatus,
  ModelInfo,
} from '@/types/ai';

export const aiApi = {
  // ===========================================================================
  // TRANSLATION
  // ===========================================================================

  async createTranslationSession(type: string): Promise<TranslationSession> {
    return apiClient.post('/translation/session', { type });
  },

  async getTranslationSession(id: string): Promise<TranslationSession> {
    return apiClient.get(`/translation/session/${id}`);
  },

  async translateText(text: string, sessionId?: string): Promise<TranslationResult> {
    return apiClient.post('/translation/translate', { text, sessionId });
  },

  async getTranslationHistory(): Promise<TranslationSession[]> {
    return apiClient.get('/translation/history');
  },

  // ===========================================================================
  // PRACTICE
  // ===========================================================================

  async createPracticeSession(lessonId?: string): Promise<PracticeSession> {
    return apiClient.post('/practice/session', { lessonId });
  },

  async getPracticeSession(id: string): Promise<PracticeSession> {
    return apiClient.get(`/practice/session/${id}`);
  },

  async submitPrediction(data: {
    sessionId: string;
    predictedGesture: string;
    confidence: number;
    processingTimeMs?: number;
    modelVersion?: string;
  }): Promise<GesturePrediction> {
    return apiClient.post('/practice/predict', data);
  },

  async endPracticeSession(
    id: string,
    accuracy?: number,
    feedback?: string,
  ): Promise<PracticeSession> {
    return apiClient.post(`/practice/session/${id}/end`, { accuracy, feedback });
  },

  async getPracticeHistory(): Promise<PracticeSession[]> {
    return apiClient.get('/practice/history');
  },

  // ===========================================================================
  // AI
  // ===========================================================================

  async predict(type: string, pose_sequence?: number[][][]): Promise<PredictionResult> {
    const payload: any = { type };
    if (pose_sequence) {
      payload.pose_sequence = pose_sequence;
    }
    return apiClient.post('/ai/predict', payload);
  },

  async getAiHealth(): Promise<AiHealthStatus> {
    return apiClient.get('/ai/health');
  },

  async getModelInfo(): Promise<ModelInfo> {
    return apiClient.get('/ai/model/info', {
      baseURL: process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000',
    });
  },
};
