import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SuppliersService, CreateSupplierDto } from './suppliers.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../database/entities/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';
@ApiTags('Suppliers') @ApiBearerAuth() @UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private svc: SuppliersService) {}
  @Get() @ApiOperation({ summary: 'List suppliers' }) findAll(@Query() q: PaginationDto) { return this.svc.findAll(q); }
  @Get(':id') findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.findOne(id); }
  @Post() @Roles(UserRole.ADMIN) create(@Body() dto: CreateSupplierDto) { return this.svc.create(dto); }
  @Patch(':id') @Roles(UserRole.ADMIN) update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateSupplierDto>) { return this.svc.update(id, dto); }
  @Delete(':id') @Roles(UserRole.ADMIN) @HttpCode(HttpStatus.NO_CONTENT) remove(@Param('id', ParseUUIDPipe) id: string) { return this.svc.remove(id); }
}
