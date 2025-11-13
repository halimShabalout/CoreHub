import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';

import { DynamicTranslationService } from './dynamic-translations.service';
import { CreateDynamicTranslationDto } from './dto/create-dynamic-translation.dto';
import { UpdateDynamicTranslationDto } from './dto/update-dynamic-translation.dto';


@Controller('dynamic-translations')
export class DynamicTranslationController {
  constructor(private readonly dynamicTranslationService: DynamicTranslationService) { }

  @Post()
  async create(@Body() data: CreateDynamicTranslationDto) {
    return this.dynamicTranslationService.create(data);
  }

  @Get()
  async findAll() {
    return this.dynamicTranslationService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.dynamicTranslationService.findOne(Number(id));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateDynamicTranslationDto) {
    return this.dynamicTranslationService.update(Number(id), data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.dynamicTranslationService.remove(Number(id));
  }
}

