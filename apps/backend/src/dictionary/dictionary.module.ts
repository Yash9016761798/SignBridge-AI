import { Module } from '@nestjs/common';
import { DictionaryController } from './dictionary.controller';
import { DictionaryService } from './dictionary.service';

import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [DictionaryController],
  providers: [DictionaryService, FirebaseAuthGuard],
  exports: [DictionaryService],
})
export class DictionaryModule {}
