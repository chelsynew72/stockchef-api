import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CategoriesService, CreateCategoryDto } from './categories.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../database/entities/enums';
@ApiTags('Categories') @ApiBearerAuth() @UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private svc: CategoriesService) {}
  @Get() @ApiOperation({ summary: 'List all categories' }) findAll() { return this.svc.findAll(); }
  @Post() @Roles(UserRole.ADMIN) @ApiOperation({ summary: 'Create category (admin)' }) create(@Body() dto: CreateCategoryDto) { return this.svc.create(dto); }
  @Patch(':id') @Roles(UserRole.ADMIN) update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateCategoryDto>) { return this.svc.update(id, dto); }
  @Delete(':id') @Roles(UserRole.ADMIN) @HttpCode(HttpStatus.NO_CONTENT) remove(@Param('id', ParseUUIDPipe) id: string) { return this.svc.remove(id); }
}
