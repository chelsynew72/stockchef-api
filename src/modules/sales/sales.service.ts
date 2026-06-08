import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SaleEntity } from '../../database/entities/sale.entity';
import { SaleItemEntity } from '../../database/entities/sale-item.entity';
import { StockMovementEntity } from '../../database/entities/stock-movement.entity';
import { ItemEntity } from '../../database/entities/item.entity';
import { MovementType } from '../../database/entities/enums';
import { CreateSaleDto } from './dto/sale.dto';
import { PaginationDto, Paginated } from '../../common/dto/pagination.dto';
import { ItemsService } from '../items/items.service';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);
  constructor(
    @InjectRepository(SaleEntity) private saleRepo: Repository<SaleEntity>,
    @InjectRepository(SaleItemEntity) private saleItemRepo: Repository<SaleItemEntity>,
    private dataSource: DataSource,
    private itemsService: ItemsService,
  ) {}

  async findAll(pagination: PaginationDto): Promise<Paginated<SaleEntity>> {
    const { page = 1, limit = 20 } = pagination;
    const [data, total] = await this.saleRepo.findAndCount({
      order: { createdAt: 'DESC' }, skip: (page - 1) * limit, take: limit,
      relations: { items: { item: true }, createdBy: true },
      select: { createdBy: { id: true, name: true, email: true } },
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async create(dto: CreateSaleDto, userId: string): Promise<SaleEntity> {
    const totalAmount = dto.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    let savedSale!: SaleEntity;

    await this.dataSource.transaction(async (manager) => {
      const sale = await manager.save(SaleEntity, manager.create(SaleEntity, { totalAmount, notes: dto.notes, createdById: userId }));
      const saleItems = dto.items.map(i => manager.create(SaleItemEntity, { saleId: sale.id, itemId: i.itemId, quantity: i.quantity, unitPrice: i.unitPrice }));
      await manager.save(SaleItemEntity, saleItems);

      // Deduct stock + log movements in same transaction
      for (const i of dto.items) {
        const item = await manager.findOne(ItemEntity, { where: { id: i.itemId } });
        if (item) {
          item.quantity = Number(item.quantity) - Number(i.quantity);
          await manager.save(ItemEntity, item);
          await manager.save(StockMovementEntity, manager.create(StockMovementEntity, {
            itemId: i.itemId, type: MovementType.OUT, quantity: i.quantity,
            reason: 'Sale', reference: sale.id, createdById: userId,
          }));
        }
      }
      savedSale = sale;
    });

    // Check low stock after sale
    for (const i of dto.items) {
      await this.itemsService.adjustStock(i.itemId, 0); // triggers alert check
    }

    this.logger.log(`Sale recorded: $${totalAmount.toFixed(2)}`);
    return savedSale;
  }
}
