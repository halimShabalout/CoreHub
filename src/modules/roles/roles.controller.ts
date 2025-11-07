import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { RoleService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // ---------------- CREATE ----------------
  @Post()
  async create(@Body() data: CreateRoleDto) {
    return this.roleService.create(data);
  }

  // ---------------- READ ALL ----------------
  @Get()
  async findAll() {
    return this.roleService.findAll();
  }

  // ---------------- READ ONE ----------------
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.findOne(id);
  }

  // ---------------- UPDATE ----------------
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateRoleDto) {
    return this.roleService.update(id, data);
  }

  // ---------------- DELETE ----------------
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.remove(id);
  }

  // ---------------- GET ROLE PERMISSIONS ----------------
  @Get(':id/permissions')
  async getRolePermissions(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.getRolePermissions(id);
  }

  // ---------------- UPDATE ROLE PERMISSIONS ----------------
  @Patch(':id/permissions')
  async updateRolePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body('permissionIds') permissionIds: number[],
  ) {
    return this.roleService.updateRolePermissions(id, permissionIds);
  }
}
