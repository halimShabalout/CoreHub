import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Permission } from '@prisma/client';
import { wrapResponse, formatSingle, formatList, ApiResponse } from '../../common';

@Injectable()
export class PermissionService {
  private readonly basePath = '/permissions';

  constructor(private readonly prisma: PrismaService) {}

  // ---------------- CREATE ----------------
  async create(data: Prisma.PermissionCreateInput): Promise<ApiResponse<Permission>> {
    const permission = await this.prisma.permission.create({ data });
    return wrapResponse(formatSingle(permission, this.basePath));
  }

  // ---------------- READ ALL ----------------
  async findAll(): Promise<ApiResponse<Permission[]>> {
    const permissions = await this.prisma.permission.findMany();
    const { data, meta, links } = formatList(permissions, this.basePath);
    return wrapResponse(data, meta, links);
  }

  // ---------------- READ ONE ----------------
  async findOne(id: number): Promise<ApiResponse<Permission>> {
    const permission = await this.prisma.permission.findUnique({ where: { id } });
    if (!permission) throw new NotFoundException(`Permission with id ${id} not found`);
    return wrapResponse(formatSingle(permission, this.basePath));
  }

  // ---------------- UPDATE ----------------
  async update(id: number, data: Prisma.PermissionUpdateInput): Promise<ApiResponse<Permission>> {
    const permission = await this.prisma.permission.update({ where: { id }, data });
    return wrapResponse(formatSingle(permission, this.basePath));
  }

  // ---------------- DELETE ----------------
  async remove(id: number): Promise<ApiResponse<Permission>> {
    const permission = await this.prisma.permission.delete({ where: { id } });
    return wrapResponse(formatSingle(permission, this.basePath));
  }
}
