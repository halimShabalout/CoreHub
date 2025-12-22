import { Controller, Get } from '@nestjs/common'
import { DashboardService } from './dashboard.service'

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // ---------------- GET STATS ----------------
  @Get('stats')
  async findStats() {
    return this.dashboardService.getStats()
  }
}
