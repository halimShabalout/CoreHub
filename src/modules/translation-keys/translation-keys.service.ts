import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, TranslationKey } from '@prisma/client';
import { wrapResponse, formatSingle, formatList, ApiResponse } from '../../common';

@Injectable()
export class TranslationKeyService {
  private readonly basePath = '/translation-keys';

  constructor(private readonly prisma: PrismaService) { }

  // ---------------- CREATE ----------------
  async create(data: Prisma.TranslationKeyCreateInput): Promise<ApiResponse<TranslationKey>> {
    const translationKey = await this.prisma.translationKey.create({ data });

    await this.createTranslationsForAllLanguages(translationKey.id);

    return wrapResponse(formatSingle(translationKey, this.basePath));
  }

  // ---------------- READ ALL ----------------
  async findAll(): Promise<ApiResponse<TranslationKey[]>> {
    const keys = await this.prisma.translationKey.findMany({ include: { translations: true } });
    const { data, meta, links } = formatList(keys, this.basePath);
    return wrapResponse(data, meta, links);
  }

  // ---------------- READ ONE ----------------
  async findOne(id: number): Promise<ApiResponse<TranslationKey>> {
    const key = await this.prisma.translationKey.findUnique({ where: { id } });
    if (!key) throw new NotFoundException(`TranslationKey with id ${id} not found`);
    return wrapResponse(formatSingle(key, this.basePath));
  }

  // ---------------- UPDATE ----------------
  async update(id: number, data: Prisma.TranslationKeyUpdateInput): Promise<ApiResponse<TranslationKey>> {
    const key = await this.prisma.translationKey.update({ where: { id }, data });
    return wrapResponse(formatSingle(key, this.basePath));
  }

  // ---------------- DELETE ----------------
  async remove(id: number): Promise<ApiResponse<TranslationKey>> {
    const key = await this.prisma.translationKey.delete({ where: { id } });
    return wrapResponse(formatSingle(key, this.basePath));
  }

  // ---------------- HELPER ----------------
  private async createTranslationsForAllLanguages(keyId: number) {
    const languages = await this.prisma.language.findMany();
    if (languages.length === 0) return;

    const translationsData = languages.map(lang => ({
      translationKeyId: keyId,
      languageId: lang.id,
      value: '',
    }));

    await this.prisma.translation.createMany({ data: translationsData, skipDuplicates: true });
  }
}
