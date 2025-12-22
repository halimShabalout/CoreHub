import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { RoleService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  // ---------------- CREATE ----------------
  @Post()
  async create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  // ---------------- READ ALL BY LANGUAGE ----------------
  @Get()
  async findAllByLanguage(@Query('lang') lang: string) {
    return this.roleService.findAllByLanguage(lang);
  }

  // ---------------- READ ONE ----------------
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang?: string
  ) {
    return this.roleService.findOne(id, lang);
  }

  // ---------------- UPDATE ----------------
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.roleService.update(id, lang, dto);
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
