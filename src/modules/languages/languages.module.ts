import { Module } from '@nestjs/common';
import { LanguageService } from './languages.service';
import { LanguageController } from './languages.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LanguageService],
  controllers: [LanguageController]
})
export class LanguagesModule {}
