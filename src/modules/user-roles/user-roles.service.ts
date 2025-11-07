import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { wrapResponse, formatSingle, formatList, ApiResponse } from '../../common';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class UserRoleService {
  private readonly basePath = '/user-roles';

  constructor(private readonly prisma: PrismaService) { }

  // ---------------- CREATE ----------------
  async create(data: CreateUserRoleDto): Promise<ApiResponse<UserRole>> {
    const userRole = await this.prisma.userRole.create({
      data,
    });
    return wrapResponse(formatSingle(userRole, this.basePath));
  }

  // ---------------- READ ALL ----------------
  async findAll(): Promise<ApiResponse<UserRole[]>> {
    const items = await this.prisma.userRole.findMany({
      include: { user: true, role: true },
    });

    const sanitizedItems = items.map(item => ({
      ...item,
      user: {
        ...item.user,
        password: undefined,
      },
    }));

    const { data, meta, links } = formatList(sanitizedItems, this.basePath);
    return wrapResponse(data, meta, links);
  }

  // ---------------- READ ONE ----------------
  async findOne(id: number): Promise<ApiResponse<UserRole>> {
    const item = await this.prisma.userRole.findUnique({
      where: { id },
      include: { user: true, role: true },
    });
    if (!item) throw new NotFoundException(`UserRole with id ${id} not found`);
    return wrapResponse(formatSingle(item, this.basePath));
  }

  // ---------------- UPDATE ----------------
  async update(id: number, data: UpdateUserRoleDto): Promise<ApiResponse<UserRole>> {
    const existing = await this.prisma.userRole.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`UserRole with id ${id} not found`);

    const updated = await this.prisma.userRole.update({
      where: { id },
      data,
    });

    return wrapResponse(formatSingle(updated, this.basePath));
  }

  // ---------------- DELETE ----------------
  async remove(id: number): Promise<ApiResponse<UserRole>> {
    const item = await this.prisma.userRole.delete({
      where: { id },
    });
    return wrapResponse(formatSingle(item, this.basePath));
  }

}
