import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/sale.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserEntity } from '../../database/entities/user.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
@ApiTags('Sales') @ApiBearerAuth() @UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private svc: SalesService) {}
  @Get() @ApiOperation({ summary: 'List all sales' }) findAll(@Query() q: PaginationDto) { return this.svc.findAll(q); }
  @Post() @ApiOperation({ summary: 'Record a sale (auto-deducts stock)' }) create(@Body() dto: CreateSaleDto, @CurrentUser() user: UserEntity) { return this.svc.create(dto, user.id); }
}
