import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { RolesGuard } from '../../common/guards/roles.guard';
@ApiTags('Reports') @ApiBearerAuth() @UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private svc: ReportsService) {}
  @Get('dashboard') @ApiOperation({ summary: 'Dashboard KPI stats' }) getDashboard() { return this.svc.getDashboardStats(); }
  @Get('low-stock') @ApiOperation({ summary: 'Items below reorder point' }) getLowStock() { return this.svc.getLowStockItems(); }
  @Get('revenue') @ApiOperation({ summary: 'Revenue by day (last 30 days)' }) getRevenue(@Query('days') days: number) { return this.svc.getRevenueByDay(days || 30); }
  @Get('top-items') @ApiOperation({ summary: 'Top moving items' }) getTopItems(@Query('limit') limit: number) { return this.svc.getTopItems(limit || 10); }
  @Get('stock-by-category') @ApiOperation({ summary: 'Stock value breakdown by category' }) getStockByCategory() { return this.svc.getStockValueByCategory(); }
}
