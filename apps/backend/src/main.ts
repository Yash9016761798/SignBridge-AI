import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const port = configService.get<number>('app.port', 3001);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
  const corsOrigin = configService.get<string>('app.corsOrigin', 'http://localhost:3000');

  const aiServiceUrl = configService.get<string>('AI_SERVICE_URL');
  if (!aiServiceUrl) {
    logger.error(
      'AI_SERVICE_URL environment variable is not configured. ' +
        'The backend cannot communicate with the AI service. ' +
        'Set AI_SERVICE_URL in your .env file ' +
        '(e.g., http://localhost:8000 for local development or http://ai-service:8000 for Docker).',
    );
    await app.close();
    process.exit(1);
  }
  logger.log(`AI service URL: ${aiServiceUrl}`);

  app.setGlobalPrefix(apiPrefix);

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  setupSwagger(app, configService);

  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`API prefix: ${apiPrefix}`);
  logger.log(`Swagger documentation: http://localhost:${port}/api/docs`);
  logger.log(`Environment: ${configService.get('app.nodeEnv')}`);

  const shutdownSignals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
  for (const signal of shutdownSignals) {
    process.on(signal, async () => {
      logger.log(`Received ${signal}, shutting down gracefully...`);
      await app.close();
      process.exit(0);
    });
  }
}

bootstrap();
