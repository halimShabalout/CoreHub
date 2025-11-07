import { Module } from '@nestjs/common';
import { TranslationService } from './translations.service';
import { TranslationController } from './translations.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TranslationService],
  controllers: [TranslationController],
})
export class TranslationModule {}
