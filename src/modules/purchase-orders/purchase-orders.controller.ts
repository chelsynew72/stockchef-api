import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/purchase-order.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, OrderStatus } from '../../database/entities/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserEntity } from '../../database/entities/user.entity';
@ApiTags('Purchase Orders') @ApiBearerAuth() @UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private svc: PurchaseOrdersService) {}
  @Get() @ApiQuery({ name: 'status', required: false, enum: OrderStatus }) findAll(@Query() q: PaginationDto & { status?: string; supplierId?: string }) { return this.svc.findAll(q); }
  @Get(':id') findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.findOne(id); }
  @Post() @Roles(UserRole.ADMIN) @ApiOperation({ summary: 'Create purchase order' }) create(@Body() dto: CreatePurchaseOrderDto) { return this.svc.create(dto); }
  @Patch(':id/send') @Roles(UserRole.ADMIN) @ApiOperation({ summary: 'Mark order as sent to supplier' }) send(@Param('id', ParseUUIDPipe) id: string) { return this.svc.updateStatus(id, OrderStatus.SENT); }
  @Patch(':id/receive') @Roles(UserRole.ADMIN) @ApiOperation({ summary: 'Receive order — auto-updates stock' }) receive(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserEntity) { return this.svc.receive(id, user.id); }
  @Patch(':id/cancel') @Roles(UserRole.ADMIN) @ApiOperation({ summary: 'Cancel order' }) cancel(@Param('id', ParseUUIDPipe) id: string) { return this.svc.cancel(id); }
}
