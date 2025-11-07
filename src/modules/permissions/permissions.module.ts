import { Module } from '@nestjs/common';
import { PermissionService } from './permissions.service';
import { PermissionController } from './permissions.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PermissionService],
  controllers: [PermissionController],
})
export class PermissionsModule {}
