import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service';
import { wrapResponse, formatList, formatSingle } from '../../common';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------- GET STATS ----------------
  async getStats() {
    const [
      totalCategories,
      totalProducts,
      totalUsers,
      totalContactRequests,
    ] = await Promise.all([
      this.prisma.category.count(),
      this.prisma.product.count(),
      this.prisma.user.count(),
      this.prisma.contactRequest.count(),
    ])

    return wrapResponse({
      totalCategories,
      totalProducts,
      totalUsers,
      totalContactRequests,
    })
  }
}
