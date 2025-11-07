import { Module } from '@nestjs/common';
import { RoleService } from './roles.service';
import { RoleController } from './roles.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RoleService],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RolesModule {}
