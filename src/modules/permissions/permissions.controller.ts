import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { PermissionService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  // ---------------- CREATE ----------------
  @Post()
  async create(@Body() data: CreatePermissionDto) {
    return this.permissionService.create(data);
  }

  // ---------------- READ ALL ----------------
  @Get()
  async findAll() {
    return this.permissionService.findAll();
  }

  // ---------------- READ ONE ----------------
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.permissionService.findOne(Number(id));
  }

  // ---------------- UPDATE ----------------
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdatePermissionDto) {
    return this.permissionService.update(Number(id), data);
  }

  // ---------------- DELETE ----------------
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.permissionService.remove(Number(id));
  }
}
