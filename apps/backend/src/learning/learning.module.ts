import { Module } from '@nestjs/common';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';

import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [LearningController],
  providers: [LearningService, FirebaseAuthGuard],
  exports: [LearningService],
})
export class LearningModule {}
