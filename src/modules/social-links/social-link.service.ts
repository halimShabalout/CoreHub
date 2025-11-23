import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSocialLinkDto } from './dto/create-social-link.dto';
import { UpdateSocialLinkDto } from './dto/update-social-link.dto';
import { wrapResponse, formatSingle, formatList } from '../../common';

@Injectable()
export class SocialLinkService {
  private readonly basePath = '/social-links';

  constructor(private readonly prisma: PrismaService) {}

  // ----------- CREATE -----------
  async create(dto: CreateSocialLinkDto) {
    const created = await this.prisma.socialLink.create({ data: dto });
    return wrapResponse(formatSingle(created, this.basePath));
  }

  // ----------- GET ALL -----------
  async findAll() {
    const links = await this.prisma.socialLink.findMany({
      orderBy: { order: 'asc' },
    });

    const { data, meta, links: pagination } = formatList(links, this.basePath);
    return wrapResponse(data, meta, pagination);
  }

  // ----------- GET ONE -----------
  async findOne(id: number) {
    const link = await this.prisma.socialLink.findUnique({ where: { id } });
    if (!link) throw new NotFoundException('Social Link not found');

    return wrapResponse(formatSingle(link, this.basePath));
  }

  // ----------- UPDATE -----------
  async update(id: number, dto: UpdateSocialLinkDto) {
    const link = await this.prisma.socialLink.findUnique({ where: { id } });
    if (!link) throw new NotFoundException('Social Link not found');

    const updated = await this.prisma.socialLink.update({
      where: { id },
      data: dto,
    });

    return wrapResponse(formatSingle(updated, this.basePath));
  }

  // ----------- DELETE -----------
  async remove(id: number) {
    const link = await this.prisma.socialLink.findUnique({ where: { id } });
    if (!link) throw new NotFoundException('Social Link not found');

    await this.prisma.socialLink.delete({ where: { id } });

    return wrapResponse(formatSingle(link, this.basePath));
  }
}