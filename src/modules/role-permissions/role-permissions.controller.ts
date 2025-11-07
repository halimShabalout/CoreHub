import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { RolePermissionService } from './role-permissions.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';

@Controller('role-permissions')
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  // ---------------- CREATE ----------------
  @Post()
  async create(@Body() data: CreateRolePermissionDto) {
    return this.rolePermissionService.create(data);
  }

  // ---------------- READ ALL ----------------
  @Get()
  async findAll() {
    return this.rolePermissionService.findAll();
  }

  // ---------------- READ ONE ----------------
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolePermissionService.findOne(id);
  }

  // ---------------- DELETE ----------------
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolePermissionService.remove(id);
  }
}
