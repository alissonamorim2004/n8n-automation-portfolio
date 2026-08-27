import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TokenUsageService } from './token-usage.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('token-usage')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class TokenUsageController {
  constructor(private tokenUsageService: TokenUsageService) {}

  @Get('stats')
  getStats(@Query('dateRange') dateRange?: '7d' | '30d' | '90d' | 'all') {
    return this.tokenUsageService.getStats(dateRange);
  }
}
