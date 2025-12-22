import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Permission } from '@prisma/client';
import { wrapResponse, formatSingle, formatList, ApiResponse } from '../../common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PermissionService {
  private readonly basePath = '/permissions';

  constructor(private readonly prisma: PrismaService) {}

  // ---------------- CREATE ----------------
  async create(dto: CreatePermissionDto, langCode: string): Promise<ApiResponse<Permission & { translations: Record<string, { name: string }> }>> {
    const permission = await this.prisma.$transaction(async tx => {
      const perm = await tx.permission.create({
        data: { endpoint: dto.endpoint },
      });

      await this.createPermissionTranslation(tx, perm.id, langCode, dto.name);

      return perm;
    });

    const translations = await this.getPermissionTranslations(permission.id);
    return wrapResponse(formatSingle({ ...permission, translations }, this.basePath));
  }

  // ---------------- READ ALL ----------------
  async findAllByLanguage(langCode: string): Promise<ApiResponse<(Permission & { translated: { name: string } })[]>> {
    const language = await this.prisma.language.findUnique({ where: { code: langCode } });
    if (!language) throw new NotFoundException(`Language '${langCode}' not found`);

    const permissions = await this.prisma.permission.findMany({ orderBy: { id: 'asc' } });

    const dataWithTranslation = await Promise.all(
      permissions.map(async perm => {
        const translations = await this.prisma.rolePermissionTranslation.findMany({
          where: { tableName: 'Permission', rowId: perm.id, languageId: language.id },
        });

        const translated = {
          name: translations.find(t => t.field === 'name')?.content || '',
        };

        return { ...perm, translated };
      }),
    );

    const { data, meta, links } = formatList(dataWithTranslation, this.basePath);
    return wrapResponse(data, meta, links);
  }

  // ---------------- READ ONE ----------------
  async findOne(id: number, langCode?: string): Promise<ApiResponse<Permission & { translated: { name: string } }>> {
    const permission = await this.prisma.permission.findUnique({ where: { id } });
    if (!permission) throw new NotFoundException(`Permission ${id} not found`);

    const language = await this.prisma.language.findUnique({ where: { code: langCode } });
    if (!language) throw new NotFoundException(`Language '${langCode}' not found`);

    const translations = await this.prisma.rolePermissionTranslation.findMany({
      where: { tableName: 'Permission', rowId: id, languageId: language.id },
    });

    const translated = {
      name: translations.find(t => t.field === 'name')?.content || '',
    };

    return wrapResponse(formatSingle({ ...permission, translated }, this.basePath));
  }

  // ---------------- UPDATE ----------------
  async update(id: number, langCode: string, dto: UpdatePermissionDto): Promise<ApiResponse<Permission & { translations: Record<string, { name: string }> }>> {
    const permission = await this.prisma.permission.findUnique({ where: { id } });
    if (!permission) throw new NotFoundException(`Permission ${id} not found`);

    const updated = await this.prisma.$transaction(async tx => {
      await tx.permission.update({ where: { id }, data: { endpoint: dto.endpoint ?? permission.endpoint } });

      if (dto.name !== undefined) {
        await this.createPermissionTranslation(tx, id, langCode, dto.name);
      }

      return permission;
    });

    const translations = await this.getPermissionTranslations(id);
    return wrapResponse(formatSingle({ ...updated, translations }, this.basePath));
  }

  // ---------------- DELETE ----------------
  async remove(id: number): Promise<ApiResponse<Permission>> {
    const permission = await this.prisma.permission.delete({ where: { id } });
    return wrapResponse(formatSingle(permission, this.basePath));
  }

  // ---------------- HELPERS ----------------
  private async createPermissionTranslation(tx: Prisma.TransactionClient, permissionId: number, langCode: string, name: string) {
    const language = await tx.language.findUnique({ where: { code: langCode } });
    if (!language) return;

    await tx.rolePermissionTranslation.upsert({
      where: { tableName_rowId_field_languageId: { tableName: 'Permission', rowId: permissionId, field: 'name', languageId: language.id } },
      update: { content: name },
      create: { tableName: 'Permission', rowId: permissionId, field: 'name', languageId: language.id, content: name },
    });
  }

  private async getPermissionTranslations(permissionId: number) {
    const translations = await this.prisma.rolePermissionTranslation.findMany({
      where: { tableName: 'Permission', rowId: permissionId },
      include: { Language: true },
    });

    const grouped: Record<string, { name: string }> = {};
    for (const t of translations) {
      const langCode = t.Language.code;
      grouped[langCode] = { name: t.content };
    }

    return grouped;
  }
}
