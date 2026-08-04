import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        timeout: 10000,
        maxRedirects: 5,
        baseURL: configService.get('AI_SERVICE_URL', 'http://localhost:8000'),
      }),
    }),
    AuthModule,
    DatabaseModule,
  ],
  controllers: [AiController],
  providers: [AiService, FirebaseAuthGuard],
  exports: [AiService],
})
export class AiModule {}
