import { Module } from '@nestjs/common';
import { ContactInfoService } from './contact-info.service';
import { ContactInfoController } from './contact-info.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ContactInfoService],
  controllers: [ContactInfoController],
  exports: [ContactInfoService],
})
export class ContactInfoModule {}
    