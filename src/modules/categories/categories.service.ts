import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../../database/entities/category.entity';
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional({ default: '#6B7280' }) @IsOptional() @IsString() color?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(CategoryEntity) private repo: Repository<CategoryEntity>) {}
  async findAll() { return this.repo.find({ order: { name: 'ASC' } }); }
  async create(dto: CreateCategoryDto) {
    if (await this.repo.findOne({ where: { name: dto.name } })) throw new ConflictException('Category already exists');
    return this.repo.save(this.repo.create(dto));
  }
  async update(id: string, dto: Partial<CreateCategoryDto>) {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return this.repo.save({ ...cat, ...dto });
  }
  async remove(id: string) {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    await this.repo.remove(cat);
  }
}
