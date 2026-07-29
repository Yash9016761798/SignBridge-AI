import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [AiController],
  providers: [AiService, FirebaseAuthGuard],
  exports: [AiService],
})
export class AiModule {}
