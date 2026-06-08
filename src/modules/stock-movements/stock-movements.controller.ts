import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StockMovementsService, CreateMovementDto } from './stock-movements.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserEntity } from '../../database/entities/user.entity';
import { MovementType } from '../../database/entities/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';
@ApiTags('Stock Movements') @ApiBearerAuth() @UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private svc: StockMovementsService) {}
  @Get() @ApiOperation({ summary: 'Full stock movement audit trail' }) findAll(@Query() q: PaginationDto & { itemId?: string; type?: MovementType }) { return this.svc.findAll(q); }
  @Post() @ApiOperation({ summary: 'Record a manual stock movement (admin/staff)' }) create(@Body() dto: CreateMovementDto, @CurrentUser() user: UserEntity) { return this.svc.create(dto, user.id); }
}
