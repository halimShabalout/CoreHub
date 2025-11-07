import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { UserRoleService } from './user-roles.service';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('user-roles')
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) { }

  @Post()
  async create(@Body() data: CreateUserRoleDto) {
    return this.userRoleService.create(data);
  }

  @Get()
  async findAll() {
    return this.userRoleService.findAll();
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateUserRoleDto) {
    return this.userRoleService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userRoleService.remove(id);
  }
}
