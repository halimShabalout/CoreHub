import { Module } from '@nestjs/common';
import { TranslationKeyService } from './translation-keys.service';
import { TranslationKeyController } from './translation-keys.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TranslationKeyService],
  controllers: [TranslationKeyController],
})
export class TranslationKeyModule {}
