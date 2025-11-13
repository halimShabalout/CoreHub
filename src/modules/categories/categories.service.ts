import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category } from '@prisma/client';
import { wrapResponse, formatSingle, formatList, ApiResponse } from '../../common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import * as fs from 'fs/promises';
import * as fssync from 'fs';
import * as path from 'path';
import { extname } from 'path';

@Injectable()
export class CategoryService {
  private readonly basePath = '/categories';
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'category');

  constructor(private readonly prisma: PrismaService) {
    if (!fssync.existsSync(this.uploadDir)) {
      fssync.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // ---------------- CREATE ----------------
  async create(
    dto: CreateCategoryDto,
    file?: Express.Multer.File,
  ): Promise<ApiResponse<Category & { translations: Record<string, { name: string; description: string; image_url?: string }> }>> {
    const imageUrl = file ? await this.saveUploadedFile(file) : undefined;

    const category = await this.prisma.$transaction(async tx => {
      const cat = await tx.category.create({ data: {} });
      await this.createDynamicTranslations(cat.id, dto.name, dto.description, imageUrl);
      return cat;
    });

    const translations = await this.getCategoryTranslations(category.id);
    return wrapResponse(formatSingle({ ...category, translations }, this.basePath));
  }

  // ---------------- READ ALL ----------------
  async findAll(): Promise<ApiResponse<(Category & { translations: Record<string, { name: string; description: string; image_url?: string }> })[]>> {
    const categories = await this.prisma.category.findMany();
    const dataWithTranslations = await Promise.all(
      categories.map(async cat => ({ ...cat, translations: await this.getCategoryTranslations(cat.id) }))
    );
    const { data, meta, links } = formatList(dataWithTranslations, this.basePath);
    return wrapResponse(data, meta, links);
  }

  // ---------------- READ ALL BY LANGUAGE ----------------
  async findAllByLanguage(langCode: string): Promise<ApiResponse<(Category & { translated: { name: string; description: string; image_url?: string } })[]>> {
    const language = await this.prisma.language.findUnique({ where: { code: langCode } });
    if (!language) throw new NotFoundException(`Language '${langCode}' not found`);

    const categories = await this.prisma.category.findMany();
    const dataWithTranslation = await Promise.all(
      categories.map(async category => {
        const translations = await this.prisma.dynamicTranslation.findMany({
          where: { tableName: 'Category', rowId: category.id, languageId: language.id },
        });

        const translated = {
          name: translations.find(t => t.field === 'name')?.content || '',
          description: translations.find(t => t.field === 'description')?.content || '',
          image_url: translations.find(t => t.field === 'image_url')?.content || '',
        };

        return { ...category, translated };
      })
    );

    const { data, meta, links } = formatList(dataWithTranslation, this.basePath);
    return wrapResponse(data, meta, links);
  }

  // ---------------- READ ONE ----------------
  async findOne(categoryId: number): Promise<ApiResponse<Category & { translations: Record<string, { name: string; description: string; image_url?: string }> }>> {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new NotFoundException(`Category ${categoryId} not found`);

    const translations = await this.getCategoryTranslations(category.id);
    return wrapResponse(formatSingle({ ...category, translations }, this.basePath));
  }

  // ---------------- UPDATE FULL ----------------
  async update(
    categoryId: number,
    langCode: string,
    dto: UpdateCategoryDto,
    file?: Express.Multer.File,
  ): Promise<ApiResponse<Category & { translations: Record<string, { name: string; description: string; image_url?: string }> }>> {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new NotFoundException(`Category ${categoryId} not found`);

    const language = await this.prisma.language.findUnique({ where: { code: langCode } });
    if (!language) throw new NotFoundException(`Language '${langCode}' not found`);

    let imageUrl: string | undefined;
    if (file) {
      imageUrl = await this.saveUploadedFile(file);
      await this.prisma.dynamicTranslation.upsert({
        where: { tableName_rowId_field_languageId: { tableName: 'Category', rowId: categoryId, field: 'image_url', languageId: language.id } },
        update: { content: imageUrl },
        create: { tableName: 'Category', rowId: categoryId, field: 'image_url', languageId: language.id, content: imageUrl },
      });
    }

    if (dto.name !== undefined) {
      await this.prisma.dynamicTranslation.upsert({
        where: { tableName_rowId_field_languageId: { tableName: 'Category', rowId: categoryId, field: 'name', languageId: language.id } },
        update: { content: dto.name },
        create: { tableName: 'Category', rowId: categoryId, field: 'name', languageId: language.id, content: dto.name },
      });
    }

    if (dto.description !== undefined) {
      await this.prisma.dynamicTranslation.upsert({
        where: { tableName_rowId_field_languageId: { tableName: 'Category', rowId: categoryId, field: 'description', languageId: language.id } },
        update: { content: dto.description },
        create: { tableName: 'Category', rowId: categoryId, field: 'description', languageId: language.id, content: dto.description },
      });
    }

    const translations = await this.getCategoryTranslations(categoryId);
    return wrapResponse(formatSingle({ ...category, translations }, this.basePath));
  }

  // ---------------- DELETE ----------------
  async remove(categoryId: number): Promise<ApiResponse<Category>> {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new NotFoundException(`Category ${categoryId} not found`);

    const translations = await this.prisma.dynamicTranslation.findMany({ where: { tableName: 'Category', rowId: categoryId } });
    for (const t of translations.filter(t => t.field === 'image_url')) await this.deleteImage(t.content);

    await this.prisma.dynamicTranslation.deleteMany({ where: { tableName: 'Category', rowId: categoryId } });
    await this.prisma.category.delete({ where: { id: categoryId } });

    return wrapResponse(formatSingle(category, this.basePath));
  }

  // ---------------- HELPER--------------------

  // ---------------- Save Uploaded File ----------------
  private async saveUploadedFile(file: Express.Multer.File): Promise<string> {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExt = extname(file.originalname);
    const filename = `category-${uniqueSuffix}${fileExt}`;
    const filepath = path.join(this.uploadDir, filename);
    await fs.writeFile(filepath, file.buffer);
    return `/uploads/category/${filename}`;
  }

  // ---------------- Delete Image ----------------
  private async deleteImage(imageUrl?: string | null): Promise<void> {
    if (!imageUrl) return;
    const imagePath = path.join(process.cwd(), imageUrl);
    try {
      await fs.access(imagePath);
      await fs.unlink(imagePath);
    } catch {}
  }

  // ---------------- Create Dynamic Translations ----------------
  private async createDynamicTranslations(
    categoryId: number,
    name: string,
    description?: string,
    imageUrl?: string,
  ) {
    const languages = await this.prisma.language.findMany();
    if (!languages.length) return;

    const translationsData = languages.flatMap(lang => [
      {
        tableName: 'Category',
        rowId: categoryId,
        field: 'name',
        languageId: lang.id,
        content: name,
      },
      {
        tableName: 'Category',
        rowId: categoryId,
        field: 'description',
        languageId: lang.id,
        content: description || '',
      },
      {
        tableName: 'Category',
        rowId: categoryId,
        field: 'image_url',
        languageId: lang.id,
        content: imageUrl || '',
      },
    ]);

    await this.prisma.dynamicTranslation.createMany({
      data: translationsData,
      skipDuplicates: true,
    });
  }

  // ---------------- Get Category Translations ----------------
  private async getCategoryTranslations(categoryId: number) {
    const translations = await this.prisma.dynamicTranslation.findMany({
      where: { tableName: 'Category', rowId: categoryId },
      include: { Language: true },
    });

    const grouped: Record<string, { name: string; description: string; image_url?: string }> = {};

    for (const t of translations) {
      const langCode = t.Language.code;
      if (!grouped[langCode]) grouped[langCode] = { name: '', description: '', image_url: '' };
      if (t.field === 'name') grouped[langCode].name = t.content;
      if (t.field === 'description') grouped[langCode].description = t.content;
      if (t.field === 'image_url') grouped[langCode].image_url = t.content;
    }

    return grouped;
  }
}
