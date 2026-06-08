import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { CreateItemDto, UpdateItemDto } from './dto/item.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../database/entities/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';
@ApiTags('Items') @ApiBearerAuth() @UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('items')
export class ItemsController {
  constructor(private svc: ItemsService) {}
  @Get() @ApiQuery({ name: 'categoryId', required: false }) @ApiQuery({ name: 'lowStock', required: false, type: Boolean }) @ApiOperation({ summary: 'List items (searchable, filterable)' })
  findAll(@Query() q: PaginationDto & { categoryId?: string; lowStock?: string }) {
    return this.svc.findAll({ ...q, lowStock: q.lowStock === 'true' });
  }
  @Get(':id') findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.findOne(id); }
  @Post() @Roles(UserRole.ADMIN) @ApiOperation({ summary: 'Create item (admin)' }) create(@Body() dto: CreateItemDto) { return this.svc.create(dto); }
  @Patch(':id') @Roles(UserRole.ADMIN) update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateItemDto) { return this.svc.update(id, dto); }
  @Delete(':id') @Roles(UserRole.ADMIN) @HttpCode(HttpStatus.NO_CONTENT) remove(@Param('id', ParseUUIDPipe) id: string) { return this.svc.remove(id); }
}
