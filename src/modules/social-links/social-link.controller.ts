import { Controller, Post, Get, Patch, Delete, Body, Param } from '@nestjs/common';
import { SocialLinkService } from './social-link.service';
import { CreateSocialLinkDto } from './dto/create-social-link.dto';
import { UpdateSocialLinkDto } from './dto/update-social-link.dto';

@Controller('social-links')
export class SocialLinkController {
  constructor(private readonly socialLinkService: SocialLinkService) {}

  @Post()
  async create(@Body() dto: CreateSocialLinkDto) {
    return this.socialLinkService.create(dto);
  }

  @Get()
  async findAll() {
    return this.socialLinkService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.socialLinkService.findOne(Number(id));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSocialLinkDto) {
    return this.socialLinkService.update(Number(id), dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.socialLinkService.remove(Number(id));
  }
}