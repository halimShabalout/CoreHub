import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';

import { TranslationKeyService } from './translation-keys.service';
import { CreateTranslationKeyDto } from './dto/create-translation-key.dto';
import { UpdateTranslationKeyDto } from './dto/update-translation-key.dto';

@Controller('translation-keys')
export class TranslationKeyController {
  constructor(private readonly translationKeyService: TranslationKeyService) { }

  // ---------------- CREATE ----------------
  @Post()
  async create(@Body() data: CreateTranslationKeyDto) {
    return this.translationKeyService.create(data);
  }

  // ---------------- READ ALL ----------------
  @Get()
  async findAll() {
    return this.translationKeyService.findAll();
  }

  // ---------------- READ ONE ----------------
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.translationKeyService.findOne(Number(id));
  }

  // ---------------- UPDATE ----------------
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateTranslationKeyDto) {
    return this.translationKeyService.update(Number(id), data);
  }

  // ---------------- DELETE ----------------
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.translationKeyService.remove(Number(id));
  }
}
