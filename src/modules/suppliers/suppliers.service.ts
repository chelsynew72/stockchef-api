import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { SupplierEntity } from '../../database/entities/supplier.entity';
import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto, Paginated } from '../../common/dto/pagination.dto';

export class CreateSupplierDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
}

@Injectable()
export class SuppliersService {
  constructor(@InjectRepository(SupplierEntity) private repo: Repository<SupplierEntity>) {}

  async findAll(pagination: PaginationDto): Promise<Paginated<SupplierEntity>> {
    const { page = 1, limit = 20, search } = pagination;
    const [data, total] = await this.repo.findAndCount({
      where: search ? [{ name: ILike(`%${search}%`) }, { email: ILike(`%${search}%`) }] : {},
      order: { name: 'ASC' }, skip: (page - 1) * limit, take: limit,
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const s = await this.repo.findOne({ where: { id }, relations: { items: true } });
    if (!s) throw new NotFoundException('Supplier not found');
    return s;
  }

  async create(dto: CreateSupplierDto) { return this.repo.save(this.repo.create(dto)); }

  async update(id: string, dto: Partial<CreateSupplierDto>) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Supplier not found');
    return this.repo.save({ ...s, ...dto });
  }

  async remove(id: string) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Supplier not found');
    await this.repo.remove(s);
  }
}
