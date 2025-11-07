import { Module } from '@nestjs/common';
import { DynamicTranslationService } from './dynamic-translations.service';
import { DynamicTranslationController } from './dynamic-translation.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DynamicTranslationService],
  controllers: [DynamicTranslationController],
})
export class DynamicTranslationModule {}
