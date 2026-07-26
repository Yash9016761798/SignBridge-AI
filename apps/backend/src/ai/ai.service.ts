import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTranslationSessionDto, TranslateTextDto } from './dto/translation.dto';
import { CreatePracticeSessionDto, SubmitPredictionDto } from './dto/practice.dto';
import { PredictGestureDto } from './dto/ai.dto';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiServiceUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
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
    let sessionId = dto.sessionId;

    if (!sessionId) {
      const session = await this.prisma.translationSession.create({
        data: { userId, type: 'TEXT_TO_SIGN', status: 'ACTIVE' },
      });
      sessionId = session.id;
    }

    // Mock translation response (will be replaced with FastAPI call)
    const mockTranslation = this.generateMockTranslation(dto.text);

    const history = await this.prisma.translationMessage.create({
      data: {
        sessionId,
        inputText: dto.text,
        outputText: mockTranslation.outputText,
        confidence: mockTranslation.confidence,
        language: dto.targetLanguage || 'isl',
      },
    });

    this.logger.log(`Translated text in session ${sessionId}: "${dto.text.substring(0, 50)}..."`);

    return {
      sessionId,
      translation: mockTranslation,
      historyId: history.id,
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

    const avgConfidence = predictions.length > 0
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

    this.logger.log(`Ended practice session: ${id} (${predictions.length} predictions, ${avgConfidence} avg confidence)`);
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
  // AI PREDICTION (STUB)
  // ===========================================================================

  async predict(userId: string, dto: PredictGestureDto) {
    // Mock prediction - will be replaced with FastAPI call
    const mockResult = {
      gesture: 'Hello',
      confidence: 0.92,
      alternatives: [
        { gesture: 'Thank You', confidence: 0.78 },
        { gesture: 'Yes', confidence: 0.65 },
      ],
      processingTimeMs: 120,
      modelVersion: 'mock-v1.0.0',
      predictionType: dto.type,
    };

    this.logger.log(`Mock prediction: ${mockResult.gesture} (${mockResult.confidence})`);

    return {
      success: true,
      message: 'Mock prediction (AI model not yet integrated)',
      data: mockResult,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  async getAiHealth() {
    try {
      const response = await fetch(`${this.aiServiceUrl}/api/v1/health/`);
      const data = await response.json();
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

  private generateMockTranslation(text: string) {
    // Mock translation - will be replaced with actual ISL translation
    const wordCount = text.split(' ').length;
    return {
      outputText: `[ISL Translation of: ${text}]`,
      confidence: 0.85 + Math.random() * 0.15,
      signs: text.split(' ').map((word) => ({
        word,
        signVideoUrl: null,
        signImageUrl: null,
        duration: Math.floor(Math.random() * 3) + 1,
      })),
      totalDuration: wordCount * 2,
    };
  }
}
