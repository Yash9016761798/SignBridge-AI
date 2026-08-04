import { Controller, Get, Post, Body, Param, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { CreateTranslationSessionDto, TranslateTextDto } from './dto/translation.dto';
import { CreatePracticeSessionDto, SubmitPredictionDto } from './dto/practice.dto';
import { PredictionRequest, PredictionResponse } from './dto/ai.dto';
import { WebcamFrameDto } from './dto/webcam.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { UseGuards } from '@nestjs/common';

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
  async createTranslationSession(@Req() req: any, @Body() dto: CreateTranslationSessionDto) {
    return this.aiService.createTranslationSession(req.user.id, dto);
  }

  @Get('translation/session/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Get translation session with history' })
  @ApiResponse({ status: 200, description: 'Translation session details' })
  async getTranslationSession(@Param('id') id: string) {
    return this.aiService.getTranslationSession(id);
  }

  @Post('translation/translate')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Translate text to ISL (creates session if none provided)' })
  @ApiResponse({ status: 200, description: 'Translation result' })
  async translateText(@Req() req: any, @Body() dto: TranslateTextDto) {
    return this.aiService.translateText(req.user.id, dto);
  }

  @Get('translation/history')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Get user translation history' })
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
  async createPracticeSession(@Req() req: any, @Body() dto: CreatePracticeSessionDto) {
    return this.aiService.createPracticeSession(req.user.id, dto);
  }

  @Get('practice/session/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Get practice session with predictions' })
  async getPracticeSession(@Param('id') id: string) {
    return this.aiService.getPracticeSession(id);
  }

  @Post('practice/predict')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Submit a prediction for a practice session' })
  async submitPrediction(@Req() req: any, @Body() dto: SubmitPredictionDto) {
    return this.aiService.submitPrediction(req.user.id, dto);
  }

  @Post('practice/session/:id/end')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End a practice session' })
  async endPracticeSession(
    @Param('id') id: string,
    @Body() body: { accuracy?: number; feedback?: string },
  ) {
    return this.aiService.endPracticeSession(id, body.accuracy, body.feedback);
  }

  @Get('practice/history')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Get user practice history' })
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
  async predict(@Req() req: any, @Body() dto: PredictionRequest) {
    return this.aiService.predict(req.user.id, dto);
  }

  @Get('ai/health')
  @ApiOperation({ summary: 'Check AI service health' })
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
