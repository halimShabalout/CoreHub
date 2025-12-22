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
import { PermissionService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  // ---------------- CREATE ----------------
  @Post()
  async create(@Body() dto: CreatePermissionDto, @Query('lang') lang: string) {
    return this.permissionService.create(dto, lang);
  }

  // ---------------- READ ALL BY LANGUAGE ----------------
  @Get()
  async findAllByLanguage(@Query('lang') lang: string) {
    return this.permissionService.findAllByLanguage(lang);
  }

  // ---------------- READ ONE ----------------
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Query('lang') lang?: string) {
    return this.permissionService.findOne(id, lang);
  }

  // ---------------- UPDATE ----------------
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang: string,
    @Body() dto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(id, lang, dto);
  }

  // ---------------- DELETE ----------------
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.remove(id);
  }
}
