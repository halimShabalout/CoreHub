import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserRolesModule } from '../user-roles/user-roles.module';

@Module({
  imports: [PrismaModule, UserRolesModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UsersModule {}
