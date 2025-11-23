import { Module } from '@nestjs/common';
import { SocialLinkService } from './social-link.service';
import { SocialLinkController } from './social-link.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SocialLinkService],
  controllers: [SocialLinkController],
  exports: [SocialLinkService],
})
export class SocialLinkModule {}
