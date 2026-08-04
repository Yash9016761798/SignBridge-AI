import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  BadGatewayException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../database/prisma.service';
import { CreateTranslationSessionDto, TranslateTextDto } from './dto/translation.dto';
import { CreatePracticeSessionDto, SubmitPredictionDto } from './dto/practice.dto';
import { PredictionRequest, PredictionResponse } from './dto/ai.dto';
import { WebcamFrameDto } from './dto/webcam.dto';
import { FrameLandmarks } from './dto/pose.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiServiceUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.aiServiceUrl = this.configService.get('AI_SERVICE_URL', 'http://localhost:8000');
  }

  // ===========================================================================
  // TRANSLATION SESSIONS
  // ===========================================================================

  async createTranslationSession(userId: string, dto: CreateTranslationSessionDto) {
    const session = await this.prisma.translationSession.create({
      data: {
        userId,
        type: dto.type as any,
        status: 'ACTIVE',
      },
    });
    this.logger.log(`Created translation session: ${session.id} (${dto.type})`);
    return session;
  }

  async getTranslationSession(id: string) {
    const session = await this.prisma.translationSession.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 50 } },
    });
    if (!session) throw new NotFoundException('Translation session not found');
    return session;
  }

  async endTranslationSession(id: string) {
    const session = await this.prisma.translationSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Translation session not found');

    const updated = await this.prisma.translationSession.update({
      where: { id },
      data: { endedAt: new Date(), status: 'COMPLETED' },
    });
    this.logger.log(`Ended translation session: ${id}`);
    return updated;
  }

  async translateText(userId: string, dto: TranslateTextDto) {
    if (!dto.frame || !dto.frame.landmarks || dto.frame.landmarks.length === 0) {
      throw new BadRequestException({
        message: 'Pose frame data is required. Provide a frame with landmarks to translate.',
        error: 'BadRequest',
      });
    }

    let sessionId = dto.sessionId;

    if (!sessionId) {
      const session = await this.prisma.translationSession.create({
        data: { userId, type: 'TEXT_TO_SIGN', status: 'ACTIVE' },
      });
      sessionId = session.id;
    }

    const fastApiPayload: FastApiTranslateRequest = {
      frame: {
        landmarks: dto.frame.landmarks,
      },
    };
    if (dto.frame.timestamp !== undefined) {
      fastApiPayload.frame.timestamp = dto.frame.timestamp;
    }

    const result = await this.aiPost<FastApiTranslateResult>('/translate', fastApiPayload);

    const words = result.prediction.text.split(/[\s,]+/).filter((w) => w.length > 0);

    const translation = {
      outputText: result.prediction.text,
      confidence: result.confidence,
      signs: words.map((word) => ({
        word,
        signVideoUrl: null,
        signImageUrl: null,
        duration: 0,
      })),
      totalDuration: Math.round(result.processing_time_ms),
    };

    const history = await this.prisma.translationMessage.create({
      data: {
        sessionId,
        inputText: dto.text || null,
        outputText: translation.outputText,
        confidence: translation.confidence,
        language: dto.targetLanguage || 'en',
      },
    });

    this.logger.log(
      `Translated pose frame in session ${sessionId}: "${translation.outputText.substring(0, 50)}..."`,
    );

    return {
      sessionId,
      translation,
      historyId: history.id,
      metadata: {
        processingTimeMs: result.processing_time_ms,
        modelVersion: result.model_version,
        tokens: result.prediction.tokens,
      },
    };
  }

  async getUserTranslationHistory(userId: string, limit = 20) {
    const sessions = await this.prisma.translationSession.findMany({
      where: { userId },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });
    return sessions;
  }

  // ===========================================================================
  // PRACTICE SESSIONS
  // ===========================================================================

  async createPracticeSession(userId: string, dto: CreatePracticeSessionDto) {
    const session = await this.prisma.practiceSession.create({
      data: {
        userId,
        lessonId: dto.lessonId || null,
      },
    });
    this.logger.log(`Created practice session: ${session.id}`);
    return session;
  }

  async getPracticeSession(id: string) {
    const session = await this.prisma.practiceSession.findUnique({
      where: { id },
      include: { predictions: { orderBy: { createdAt: 'asc' } } },
    });
    if (!session) throw new NotFoundException('Practice session not found');
    return session;
  }

  async submitPrediction(userId: string, dto: SubmitPredictionDto) {
    const session = await this.prisma.practiceSession.findUnique({
      where: { id: dto.sessionId },
    });
    if (!session) throw new NotFoundException('Practice session not found');

    const prediction = await this.prisma.gesturePrediction.create({
      data: {
        practiceSessionId: dto.sessionId,
        predictedGesture: dto.predictedGesture,
        confidence: dto.confidence,
        processingTime: dto.processingTimeMs || 0,
        modelVersion: dto.modelVersion || 'mock-v1.0.0',
      },
    });

    this.logger.log(
      `Prediction: ${dto.predictedGesture} (${dto.confidence}) for session ${dto.sessionId}`,
    );

    return prediction;
  }

  async endPracticeSession(id: string, accuracy?: number, feedback?: string) {
    const session = await this.prisma.practiceSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Practice session not found');

    const predictions = await this.prisma.gesturePrediction.findMany({
      where: { practiceSessionId: id },
    });

    const avgConfidence =
      predictions.length > 0
        ? predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
        : 0;

    const updated = await this.prisma.practiceSession.update({
      where: { id },
      data: {
        confidenceScore: avgConfidence,
        accuracy: accuracy || avgConfidence,
        feedback: feedback || `Completed ${predictions.length} predictions`,
      },
    });

    this.logger.log(
      `Ended practice session: ${id} (${predictions.length} predictions, ${avgConfidence} avg confidence)`,
    );
    return updated;
  }

  async getUserPracticeHistory(userId: string, limit = 20) {
    const sessions = await this.prisma.practiceSession.findMany({
      where: { userId },
      include: {
        predictions: { select: { id: true, predictedGesture: true, confidence: true } },
        lesson: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return sessions;
  }

  // ===========================================================================
  // AI PREDICTION
  // ===========================================================================

  async predict(userId: string, dto: PredictionRequest): Promise<PredictionResponse> {
    const payload = this.buildFastApiPayload(dto);

    this.logger.log(
      `Sending prediction request to AI service: type=${dto.type}, frames=${payload.pose_sequence.length}`,
    );

    const result = await this.aiPost<FastApiPredictionResult>('/predict', payload);

    let sessionId = dto.sessionId;
    if (!sessionId) {
      const session = await this.prisma.practiceSession.create({
        data: { userId },
      });
      sessionId = session.id;
    }

    const prediction = await this.prisma.gesturePrediction.create({
      data: {
        practiceSessionId: sessionId,
        predictedGesture: result.prediction.text,
        confidence: result.confidence,
        processingTime: result.processing_time_ms,
        modelVersion: result.model_version,
      },
    });

    const response: PredictionResponse = {
      success: true,
      message: 'Prediction completed successfully',
      data: {
        gesture: result.prediction.text,
        confidence: result.confidence,
        alternatives: [],
        processingTimeMs: Math.round(result.processing_time_ms),
        modelVersion: result.model_version,
        predictionType: dto.type,
      },
      meta: {
        timestamp: new Date().toISOString(),
        sessionId,
        inputType: dto.inputType,
        predictionId: prediction.id,
      },
    };

    this.logger.log(`Prediction: ${response.data.gesture} (${response.data.confidence})`);

    return response;
  }

  // ===========================================================================
  // WEBCAM STREAMING
  // ===========================================================================

  async webcamFrame(userId: string, dto: WebcamFrameDto) {
    if (!dto.frameData || dto.frameData.length === 0) {
      throw new BadRequestException({
        message: 'Frame data is required. Provide at least one pose frame.',
        error: 'BadRequest',
      });
    }

    const payload: FastApiWebcamRequest = {
      frame_data: dto.frameData,
    };
    let sessionId = dto.sessionId;
    if (dto.sessionId) {
      payload.session_id = dto.sessionId;
    }

    this.logger.log(
      `Sending webcam frame to AI service: frames=${dto.frameData.length}, sessionId=${dto.sessionId || 'auto'}`,
    );

    const result = await this.aiPost<FastApiWebcamResult>('/webcam/frame', payload);

    if (result.session_id && !sessionId) {
      sessionId = result.session_id;
    }

    if (!sessionId) {
      const session = await this.prisma.practiceSession.create({
        data: { userId },
      });
      sessionId = session.id;
    }

    const prediction = await this.prisma.gesturePrediction.create({
      data: {
        practiceSessionId: sessionId,
        predictedGesture: result.prediction.text,
        confidence: result.confidence,
        processingTime: result.processing_time_ms,
        modelVersion: result.model_version,
      },
    });

    const timestamp = new Date().toISOString();

    this.logger.log(`Webcam translation: "${result.prediction.text}" (${result.confidence})`);

    return {
      sessionId,
      predictionId: prediction.id,
      prediction: {
        text: result.prediction.text,
        tokens: result.prediction.tokens,
      },
      confidence: result.confidence,
      processingTimeMs: Math.round(result.processing_time_ms),
      modelVersion: result.model_version,
      timestamp,
    };
  }

  async getAiHealth() {
    try {
      const data = await this.aiGet('/health');
      return {
        backend: { status: 'up', timestamp: new Date().toISOString() },
        aiService: data,
      };
    } catch {
      return {
        backend: { status: 'up', timestamp: new Date().toISOString() },
        aiService: { status: 'unreachable', message: 'AI service is not responding' },
      };
    }
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  private async aiGet<T>(path: string): Promise<T> {
    return this.aiRequest<T>('get', path);
  }

  private async aiPost<T>(path: string, data?: unknown): Promise<T> {
    return this.aiRequest<T>('post', path, data);
  }

  private async aiRequest<T>(method: 'get' | 'post', path: string, data?: unknown): Promise<T> {
    try {
      const response = await this.httpService.axiosRef({ method, url: path, data });
      return response.data as T;
    } catch (error) {
      throw this.handleAiHttpError(error);
    }
  }

  private handleAiHttpError(error: any): Error {
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        this.logger.error(`AI service request timed out: ${error.message}`);
        return new ServiceUnavailableException({
          message: 'AI service request timed out',
          error: error.code,
        });
      }
      this.logger.error(`AI service unreachable: ${error.message}`);
      return new ServiceUnavailableException({
        message: 'AI service is not responding',
        error: error.code || 'UNKNOWN_ERROR',
      });
    }
    this.logger.error(
      `AI service returned error: ${error.response.status} - ${error.response.statusText}`,
    );
    return new BadGatewayException({
      message: error.response?.data?.detail || error.response?.data?.message || 'AI service error',
      statusCode: error.response.status,
      error: error.response.statusText,
    });
  }

  // ===========================================================================
  // FASTAPI INTEGRATION HELPERS
  // ===========================================================================

  private buildFastApiPayload(dto: PredictionRequest): FastApiPredictRequest {
    let poseSequence: number[][][] | undefined;

    if (dto.pose_sequence) {
      poseSequence = dto.pose_sequence;
    } else if (dto.sequence) {
      poseSequence = dto.sequence.frames.map((frame) => this.frameToFlatArray(frame));
    } else if (dto.frames) {
      poseSequence = [this.frameToFlatArray(dto.frames)];
    }

    if (!poseSequence || poseSequence.length === 0) {
      throw new BadRequestException({
        message: 'No pose data provided. Include pose_sequence, frames, or sequence.',
        error: 'BadRequest',
      });
    }

    const payload: FastApiPredictRequest = { pose_sequence: poseSequence };

    if (dto.max_length !== undefined) payload.max_length = dto.max_length;
    if (dto.temperature !== undefined) payload.temperature = dto.temperature;

    return payload;
  }

  private frameToFlatArray(frame: FrameLandmarks): number[][] {
    return frame.pose.map((lm) => [lm.x, lm.y, lm.z, lm.visibility ?? 0, lm.timestamp ?? 0]);
  }
}

interface FastApiPrediction {
  text: string;
  tokens: number[];
}

interface FastApiPredictionResult {
  prediction: FastApiPrediction;
  confidence: number;
  processing_time_ms: number;
  model_version: string;
}

interface FastApiPredictRequest {
  pose_sequence: number[][][];
  max_length?: number;
  temperature?: number;
}

interface FastApiTranslateFrame {
  landmarks: number[][];
  timestamp?: number;
}

interface FastApiTranslateRequest {
  frame: FastApiTranslateFrame;
}

interface FastApiTranslation {
  text: string;
  tokens: number[];
}

interface FastApiTranslateResult {
  prediction: FastApiTranslation;
  confidence: number;
  processing_time_ms: number;
  model_version: string;
}

interface FastApiWebcamRequest {
  frame_data: number[][][];
  session_id?: string;
}

interface FastApiWebcamResult {
  prediction: FastApiTranslation;
  confidence: number;
  processing_time_ms: number;
  model_version: string;
  session_id?: string | null;
}
