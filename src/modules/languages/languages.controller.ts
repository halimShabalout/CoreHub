import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { LanguageService } from './languages.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';

@Controller('languages')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  // ---------------- CREATE ----------------
  @Post()
  async create(@Body() data: CreateLanguageDto) {
    return this.languageService.create(data);
  }

  // ---------------- READ ALL ----------------
  @Get()
  async findAll() {
    return this.languageService.findAll();
  }

  // ---------------- READ ONE ----------------
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.languageService.findOne(Number(id));
  }

  // ---------------- UPDATE ----------------
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateLanguageDto) {
    return this.languageService.update(Number(id), data);
  }

  // ---------------- DELETE ----------------
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.languageService.remove(Number(id));
  }
}
