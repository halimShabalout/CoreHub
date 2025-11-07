import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolePermission } from '@prisma/client';
import { wrapResponse, formatSingle, formatList, ApiResponse } from '../../common';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';

@Injectable()
export class RolePermissionService {
  private readonly basePath = '/role-permissions';

  constructor(private readonly prisma: PrismaService) { }

  // ---------------- CREATE ----------------
  async create(data: CreateRolePermissionDto): Promise<ApiResponse<RolePermission>> {
    const rolePermission = await this.prisma.rolePermission.create({
      data: {
        role: { connect: { id: data.roleId } },
        permission: { connect: { id: data.permissionId } },
      },
    });

    return wrapResponse(formatSingle(rolePermission, this.basePath));
  }

  // ---------------- READ ALL ----------------
  async findAll(): Promise<ApiResponse<RolePermission[]>> {
    const items = await this.prisma.rolePermission.findMany({
      include: { role: true, permission: true },
    });
    const { data, meta, links } = formatList(items, this.basePath);
    return wrapResponse(data, meta, links);
  }

  // ---------------- READ ONE ----------------
  async findOne(id: number): Promise<ApiResponse<RolePermission>> {
    const item = await this.prisma.rolePermission.findUnique({
      where: { id },
      include: { role: true, permission: true },
    });
    if (!item) throw new NotFoundException(`RolePermission with id ${id} not found`);
    return wrapResponse(formatSingle(item, this.basePath));
  }

  // ---------------- DELETE ----------------
  async remove(id: number): Promise<ApiResponse<RolePermission>> {
    const item = await this.prisma.rolePermission.delete({ where: { id } });
    return wrapResponse(formatSingle(item, this.basePath));
  }

  // ---------------- FIND BY ROLE ----------------
  async findByRole(roleId: number): Promise<RolePermission[]> {
    return this.prisma.rolePermission.findMany({
      where: { roleId },
    });
  }
}
