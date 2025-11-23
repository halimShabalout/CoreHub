import { Controller, Post, Get, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ContactInfoService } from './contact-info.service';
import { CreateContactInfoDto } from './dto/create-contact-info.dto';
import { UpdateContactInfoDto } from './dto/update-contact-info.dto';

@Controller('contact-info')
export class ContactInfoController {
  constructor(private readonly contactInfoService: ContactInfoService) {}

  // ---------------- CREATE ----------------
  @Post()
  async create(@Body() dto: CreateContactInfoDto) {
    return this.contactInfoService.create(dto);
  }

  // ---------------- GET (BY LANGUAGE) ----------------
  @Get()
  async get(@Query('lang') lang: string) {
    return this.contactInfoService.getByLanguage(lang);
  }

  // ---------------- UPDATE ----------------
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Query('lang') lang: string,
    @Body() dto: UpdateContactInfoDto,
  ) {
    return this.contactInfoService.update(Number(id), lang, dto);
  }

  // ---------------- DELETE ----------------
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.contactInfoService.remove(Number(id));
  }
}
