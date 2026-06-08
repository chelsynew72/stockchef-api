import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
@ApiTags('Health') @Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  @Get() @ApiOperation({ summary: 'System health check' })
  check() {
    const mem = process.memoryUsage();
    return { status: this.dataSource.isInitialized ? 'ok' : 'degraded', uptime: Math.floor(process.uptime()), checks: { database: this.dataSource.isInitialized ? 'up' : 'down', memory: { heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024), heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024) } } };
  }
}
