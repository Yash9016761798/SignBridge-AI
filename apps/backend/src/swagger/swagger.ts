import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function setupSwagger(app: INestApplication, configService: ConfigService) {
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  if (nodeEnv === 'production') {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle('SignBridge AI API')
    .setDescription(
      'Breaking Communication Barriers Through Indian Sign Language\n\n' +
        'This API provides endpoints for:\n' +
        '- User authentication and management\n' +
        '- Course and lesson management\n' +
        '- AI practice sessions\n' +
        '- Sign language translation\n' +
        '- Dictionary management\n' +
        '- Institution dashboards',
    )
    .setVersion('1.0')
    .addTag('health', 'Health check endpoints')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('courses', 'Course management endpoints')
    .addTag('lessons', 'Lesson management endpoints')
    .addTag('practice', 'AI practice endpoints')
    .addTag('translation', 'Translation endpoints')
    .addTag('dictionary', 'Dictionary endpoints')
    .addTag('notifications', 'Notification endpoints')
    .addTag('dashboard', 'Dashboard endpoints')
    .addTag('admin', 'Admin endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter Firebase ID token',
      },
      'firebase-auth',
    )
    .addServer('http://localhost:3001', 'Local Development')
    .addServer('https://api.signbridge.ai', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'SignBridge AI API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
    customJs: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  });
}
