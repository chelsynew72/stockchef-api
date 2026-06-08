import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, LessThanOrEqual } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ItemEntity } from '../../database/entities/item.entity';
import { CreateItemDto, UpdateItemDto } from './dto/item.dto';
import { PaginationDto, Paginated } from '../../common/dto/pagination.dto';

@Injectable()
export class ItemsService {
  private readonly logger = new Logger(ItemsService.name);
  constructor(
    @InjectRepository(ItemEntity) private repo: Repository<ItemEntity>,
    @InjectQueue('alerts') private alertsQueue: Queue,
  ) {}

  async findAll(pagination: PaginationDto & { categoryId?: string; lowStock?: boolean }): Promise<Paginated<ItemEntity>> {
    const { page = 1, limit = 20, search, categoryId, lowStock } = pagination;
    const qb = this.repo.createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoinAndSelect('item.supplier', 'supplier')
      .where('item.isActive = :active', { active: true });
    if (search)     qb.andWhere('(item.name ILIKE :s OR item.sku ILIKE :s)', { s: `%${search}%` });
    if (categoryId) qb.andWhere('item.categoryId = :categoryId', { categoryId });
    if (lowStock)   qb.andWhere('item.quantity <= item.minQuantity');
    const [data, total] = await qb.orderBy('item.name', 'ASC').skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id }, relations: { category: true, supplier: true } });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async create(dto: CreateItemDto) {
    if (await this.repo.findOne({ where: { sku: dto.sku } })) throw new ConflictException('SKU already exists');
    const item = await this.repo.save(this.repo.create(dto));
    this.logger.log(`Item created: ${item.id} (${item.name})`);
    return item;
  }

  async update(id: string, dto: UpdateItemDto) {
    const item = await this.findOne(id);
    const updated = await this.repo.save({ ...item, ...dto });
    return updated;
  }

  async adjustStock(id: string, quantityDelta: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    item.quantity = Number(item.quantity) + quantityDelta;
    const saved = await this.repo.save(item);
    // Queue low-stock alert if quantity dropped at or below reorder point
    if (quantityDelta < 0 && saved.quantity <= saved.minQuantity) {
      await this.alertsQueue.add('low-stock', { itemId: saved.id, itemName: saved.name, quantity: saved.quantity, minQuantity: saved.minQuantity, unit: saved.unit }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
    }
    return saved;
  }

  async getLowStockCount() {
    return this.repo.createQueryBuilder('item')
      .where('item.isActive = true')
      .andWhere('item.quantity <= item.minQuantity')
      .getCount();
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    await this.repo.save({ ...item, isActive: false });
  }
}
