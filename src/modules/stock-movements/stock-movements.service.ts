import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StockMovementEntity } from '../../database/entities/stock-movement.entity';
import { MovementType } from '../../database/entities/enums';
import { ItemsService } from '../items/items.service';
import { PaginationDto, Paginated } from '../../common/dto/pagination.dto';

export class CreateMovementDto {
  @ApiProperty() @IsUUID() itemId: string;
  @ApiProperty({ enum: MovementType }) @IsEnum(MovementType) type: MovementType;
  @ApiProperty() @IsNumber() @Min(0.01) quantity: number;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reference?: string;
}

@Injectable()
export class StockMovementsService {
  private readonly logger = new Logger(StockMovementsService.name);
  constructor(
    @InjectRepository(StockMovementEntity) private repo: Repository<StockMovementEntity>,
    private itemsService: ItemsService,
  ) {}

  async findAll(pagination: PaginationDto & { itemId?: string; type?: MovementType }): Promise<Paginated<StockMovementEntity>> {
    const { page = 1, limit = 20, itemId, type } = pagination;
    const qb = this.repo.createQueryBuilder('m')
      .leftJoinAndSelect('m.item', 'item')
      .leftJoinAndSelect('m.createdBy', 'createdBy');
    if (itemId) qb.andWhere('m.itemId = :itemId', { itemId });
    if (type)   qb.andWhere('m.type = :type', { type });
    const [data, total] = await qb.orderBy('m.createdAt', 'DESC').skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async create(dto: CreateMovementDto, userId: string): Promise<StockMovementEntity> {
    const delta = dto.type === MovementType.OUT ? -dto.quantity : dto.quantity;
    await this.itemsService.adjustStock(dto.itemId, delta);
    const movement = await this.repo.save(this.repo.create({ ...dto, createdById: userId }));
    this.logger.log(`Stock ${dto.type}: ${dto.quantity} units of item ${dto.itemId}`);
    return movement;
  }
}
