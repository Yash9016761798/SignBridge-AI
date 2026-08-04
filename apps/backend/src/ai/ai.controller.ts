import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { CreateTranslationSessionDto, TranslateTextDto } from './dto/translation.dto';
import { CreatePracticeSessionDto, SubmitPredictionDto } from './dto/practice.dto';
import { PredictionRequest, PredictionResponse } from './dto/ai.dto';
import { WebcamFrameDto } from './dto/webcam.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';

@ApiTags('AI & Translation')
@Controller()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // ===========================================================================
  // TRANSLATION
  // ===========================================================================

  @Post('translation/session')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Create a new translation session' })
  @ApiResponse({ status: 201, description: 'Translation session created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createTranslationSession(@Req() req: any, @Body() dto: CreateTranslationSessionDto) {
    return this.aiService.createTranslationSession(req.user.id, dto);
  }

  @Get('translation/session/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Get translation session with history' })
  @ApiResponse({ status: 200, description: 'Translation session details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getTranslationSession(@Req() req: any, @Param('id') id: string) {
    return this.aiService.getTranslationSession(req.user.id, id);
  }

  @Post('translation/translate')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Translate pose landmarks to text via AI service' })
  @ApiResponse({ status: 200, description: 'Translation result' })
  @ApiResponse({ status: 400, description: 'Missing or invalid frame data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 502, description: 'AI service error' })
  @ApiResponse({ status: 503, description: 'AI service unreachable' })
  async translateText(@Req() req: any, @Body() dto: TranslateTextDto) {
    return this.aiService.translateText(req.user.id, dto);
  }

  @Get('translation/history')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Get user translation history' })
  @ApiResponse({ status: 200, description: 'Translation history' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTranslationHistory(@Req() req: any) {
    return this.aiService.getUserTranslationHistory(req.user.id);
  }

  // ===========================================================================
  // PRACTICE
  // ===========================================================================

  @Post('practice/session')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Create a new practice session' })
  @ApiResponse({ status: 201, description: 'Practice session created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPracticeSession(@Req() req: any, @Body() dto: CreatePracticeSessionDto) {
    return this.aiService.createPracticeSession(req.user.id, dto);
  }

  @Get('practice/session/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Get practice session with predictions' })
  @ApiResponse({ status: 200, description: 'Practice session details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getPracticeSession(@Req() req: any, @Param('id') id: string) {
    return this.aiService.getPracticeSession(req.user.id, id);
  }

  @Post('practice/predict')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Submit a prediction for a practice session' })
  @ApiResponse({ status: 201, description: 'Prediction submitted' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Practice session not found' })
  async submitPrediction(@Req() req: any, @Body() dto: SubmitPredictionDto) {
    return this.aiService.submitPrediction(req.user.id, dto);
  }

  @Post('practice/session/:id/end')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End a practice session' })
  @ApiResponse({ status: 200, description: 'Practice session ended' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Practice session not found' })
  async endPracticeSession(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { accuracy?: number; feedback?: string },
  ) {
    return this.aiService.endPracticeSession(req.user.id, id, body.accuracy, body.feedback);
  }

  @Get('practice/history')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Get user practice history' })
  @ApiResponse({ status: 200, description: 'Practice history' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPracticeHistory(@Req() req: any) {
    return this.aiService.getUserPracticeHistory(req.user.id);
  }

  // ===========================================================================
  // AI PREDICTION
  // ===========================================================================

  @Post('ai/predict')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Make a gesture prediction from pose landmarks' })
  @ApiResponse({ status: 200, description: 'Prediction result', type: PredictionResponse })
  @ApiResponse({ status: 400, description: 'Invalid or missing pose data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 502, description: 'AI service error' })
  @ApiResponse({ status: 503, description: 'AI service unreachable' })
  async predict(@Req() req: any, @Body() dto: PredictionRequest) {
    return this.aiService.predict(req.user.id, dto);
  }

  @Get('ai/health')
  @ApiOperation({ summary: 'Check AI service health' })
  @ApiResponse({ status: 200, description: 'Health check result' })
  async getAiHealth() {
    return this.aiService.getAiHealth();
  }

  // ===========================================================================
  // WEBCAM
  // ===========================================================================

  @Post('webcam/frame')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Process a webcam frame for real-time sign-to-text translation' })
  @ApiResponse({ status: 201, description: 'Webcam translation result' })
  @ApiResponse({ status: 400, description: 'Invalid frame data' })
  @ApiResponse({ status: 502, description: 'AI service error (BadGateway)' })
  @ApiResponse({ status: 503, description: 'AI service unreachable (ServiceUnavailable)' })
  async webcamFrame(@Req() req: any, @Body() dto: WebcamFrameDto) {
    return this.aiService.webcamFrame(req.user.id, dto);
  }
}
