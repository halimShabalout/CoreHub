import { Module } from '@nestjs/common';
import { UserRoleService } from './user-roles.service';
import { UserRoleController } from './user-roles.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UserRoleService],
  controllers: [UserRoleController],
  exports: [UserRoleService],
})
export class UserRolesModule {}
