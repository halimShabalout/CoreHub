import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, DynamicTranslation } from '@prisma/client';
import { wrapResponse, formatSingle, formatList, ApiResponse } from '../../common';
import { CreateDynamicTranslationDto } from './dto/create-dynamic-translation.dto';
import { UpdateDynamicTranslationDto } from './dto/update-dynamic-translation.dto';

@Injectable()
export class DynamicTranslationService {
  private readonly basePath = '/dynamic-translations';

  constructor(private readonly prisma: PrismaService) { }

  // ---------------- CREATE ----------------
  async create(data: CreateDynamicTranslationDto): Promise<ApiResponse<DynamicTranslation>> {

    const translation = await this.prisma.dynamicTranslation.create({ data });

    return wrapResponse(formatSingle(translation, this.basePath));
  }

  // ---------------- READ ALL ----------------
  async findAll(): Promise<ApiResponse<DynamicTranslation[]>> {
    const translations = await this.prisma.dynamicTranslation.findMany();
    const { data, meta, links } = formatList(translations, this.basePath);
    return wrapResponse(data, meta, links);
  }

  // ---------------- READ ONE ----------------
  async findOne(id: number): Promise<ApiResponse<DynamicTranslation>> {
    const translation = await this.prisma.dynamicTranslation.findUnique({ where: { id } });
    if (!translation) throw new NotFoundException(`DynamicTranslation with id ${id} not found`);
    return wrapResponse(formatSingle(translation, this.basePath));
  }

  // ---------------- UPDATE ----------------
  async update(id: number, dto: UpdateDynamicTranslationDto): Promise<ApiResponse<DynamicTranslation>> {
    const translation = await this.prisma.dynamicTranslation.update({
      where: { id },
      data: dto
    });

    return wrapResponse(formatSingle(translation, this.basePath));
  }

  // ---------------- DELETE ----------------
  async remove(id: number): Promise<ApiResponse<DynamicTranslation>> {
    const translation = await this.prisma.dynamicTranslation.delete({ where: { id } });
    return wrapResponse(formatSingle(translation, this.basePath));
  }
}
