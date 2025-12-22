import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role, RolePermission } from '@prisma/client';
import { wrapResponse, formatSingle, formatList, ApiResponse } from '../../common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  private readonly basePath = '/roles';

  constructor(private readonly prisma: PrismaService) { }

  // ---------------- CREATE ----------------
  async create(
    dto: CreateRoleDto
  ): Promise<ApiResponse<Role & { translations: Record<string, { name: string; description?: string }> }>> {

    const role = await this.prisma.$transaction(async tx => {
      const newRole = await tx.role.create({
        data: {},
      });

      await this.createDynamicTranslations(newRole.id, dto.name, dto.description);
      return newRole;
    });

    const translations = await this.getRoleTranslations(role.id);
    return wrapResponse(formatSingle({ ...role, translations }, this.basePath));
  }

  // ---------------- READ ALL BY LANGUAGE ----------------
  async findAllByLanguage(langCode: string): Promise<ApiResponse<(Role & { translated: { name: string; description?: string } })[]>> {
    const language = await this.prisma.language.findUnique({ where: { code: langCode } });
    if (!language) throw new NotFoundException(`Language '${langCode}' not found`);

    const roles = await this.prisma.role.findMany({ orderBy: { id: 'asc' } });

    const dataWithTranslation = await Promise.all(
      roles.map(async role => {
        const translations = await this.prisma.rolePermissionTranslation.findMany({
          where: { tableName: 'Role', rowId: role.id, languageId: language.id },
        });

        return {
          ...role,
          translated: {
            name: translations.find(t => t.field === 'name')?.content || '',
            description: translations.find(t => t.field === 'description')?.content || '',
          }
        };
      }),
    );

    const { data, meta, links } = formatList(dataWithTranslation, this.basePath);
    return wrapResponse(data, meta, links);
  }

  // ---------------- READ ONE ----------------
  async findOne(
    id: number,
    langCode?: string
  ): Promise<ApiResponse<Role & { translated?: { name: string; description?: string } }>> {

    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException(`Role with id ${id} not found`);

    if (!langCode) {
      return wrapResponse(formatSingle(role, this.basePath));
    }

    const language = await this.prisma.language.findUnique({ where: { code: langCode } });
    if (!language) throw new NotFoundException(`Language '${langCode}' not found`);

    const translations = await this.prisma.rolePermissionTranslation.findMany({
      where: { tableName: 'Role', rowId: role.id, languageId: language.id },
    });

    return wrapResponse(formatSingle({
      ...role,
      translated: {
        name: translations.find(t => t.field === 'name')?.content || '',
        description: translations.find(t => t.field === 'description')?.content || '',
      }
    }, this.basePath));
  }

  // ---------------- UPDATE ----------------
  async update(
    id: number,
    langCode: string,
    dto: UpdateRoleDto
  ): Promise<ApiResponse<Role & { translations: Record<string, { name: string; description?: string }> }>> {

    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException(`Role ${id} not found`);

    const language = await this.prisma.language.findUnique({ where: { code: langCode } });
    if (!language) throw new NotFoundException(`Language '${langCode}' not found`);

    if (dto.name !== undefined) {
      await this.prisma.rolePermissionTranslation.upsert({
        where: {
          tableName_rowId_field_languageId: {
            tableName: 'Role',
            rowId: id,
            field: 'name',
            languageId: language.id,
          },
        },
        update: { content: dto.name },
        create: {
          tableName: 'Role',
          rowId: id,
          field: 'name',
          languageId: language.id,
          content: dto.name,
        },
      });
    }

    if (dto.description !== undefined) {
      await this.prisma.rolePermissionTranslation.upsert({
        where: {
          tableName_rowId_field_languageId: {
            tableName: 'Role',
            rowId: id,
            field: 'description',
            languageId: language.id,
          },
        },
        update: { content: dto.description },
        create: {
          tableName: 'Role',
          rowId: id,
          field: 'description',
          languageId: language.id,
          content: dto.description,
        },
      });
    }

    const translations = await this.getRoleTranslations(id);
    return wrapResponse(formatSingle({ ...role, translations }, this.basePath));
  }

  // ---------------- DELETE ----------------
  async remove(id: number): Promise<ApiResponse<Role>> {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException(`Role ${id} not found`);

    await this.prisma.rolePermissionTranslation.deleteMany({
      where: { tableName: 'Role', rowId: id },
    });

    await this.prisma.role.delete({ where: { id } });

    return wrapResponse(formatSingle(role, this.basePath));
  }

  // ---------------- PERMISSIONS ----------------
  async getRolePermissions(roleId: number): Promise<ApiResponse<RolePermission[]>> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: { rolePermissions: true },
    });
    if (!role) throw new NotFoundException(`Role with id ${roleId} not found`);

    const { data, meta, links } = formatList(
      role.rolePermissions,
      `${this.basePath}/${roleId}/permissions`
    );

    return wrapResponse(data, meta, links);
  }

  async updateRolePermissions(roleId: number, permissionIds: number[]): Promise<ApiResponse<RolePermission[]>> {
    const roleExists = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!roleExists) throw new NotFoundException(`Role with id ${roleId} not found`);

    await this.prisma.rolePermission.deleteMany({ where: { roleId } });

    if (!permissionIds.length) {
      return wrapResponse([], undefined, undefined);
    }

    await this.prisma.rolePermission.createMany({
      data: permissionIds.map(permissionId => ({ roleId, permissionId })),
      skipDuplicates: true,
    });

    const permissions = await this.prisma.rolePermission.findMany({ where: { roleId } });
    const { data, meta, links } = formatList(permissions, `${this.basePath}/${roleId}/permissions`);

    return wrapResponse(data, meta, links);
  }

  // ---------------- HELPERS ----------------
  private async createDynamicTranslations(
    roleId: number,
    name: string,
    description?: string
  ) {
    const languages = await this.prisma.language.findMany();
    if (!languages.length) return;

    const data = languages.flatMap(lang => [
      {
        tableName: 'Role',
        rowId: roleId,
        field: 'name',
        languageId: lang.id,
        content: name,
      },
      {
        tableName: 'Role',
        rowId: roleId,
        field: 'description',
        languageId: lang.id,
        content: description || '',
      },
    ]);

    await this.prisma.rolePermissionTranslation.createMany({
      data,
      skipDuplicates: true,
    });
  }

  private async getRoleTranslations(roleId: number) {
    const translations = await this.prisma.rolePermissionTranslation.findMany({
      where: { tableName: 'Role', rowId: roleId },
      include: { Language: true },
    });

    const grouped: Record<string, { name: string; description?: string }> = {};
    for (const t of translations) {
      const code = t.Language.code;
      if (!grouped[code]) grouped[code] = { name: '', description: '' };
      if (t.field === 'name') grouped[code].name = t.content;
      if (t.field === 'description') grouped[code].description = t.content;
    }

    return grouped;
  }
}
