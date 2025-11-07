import { Module } from '@nestjs/common';
import { RolePermissionService } from './role-permissions.service';
import { RolePermissionController } from './role-permissions.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RolePermissionService],
  controllers: [RolePermissionController],
})
export class RolePermissionModule { }
