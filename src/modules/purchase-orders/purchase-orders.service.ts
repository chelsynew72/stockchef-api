import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PurchaseOrderEntity } from '../../database/entities/purchase-order.entity';
import { PurchaseOrderItemEntity } from '../../database/entities/purchase-order-item.entity';
import { StockMovementEntity } from '../../database/entities/stock-movement.entity';
import { ItemEntity } from '../../database/entities/item.entity';
import { OrderStatus, MovementType } from '../../database/entities/enums';
import { CreatePurchaseOrderDto } from './dto/purchase-order.dto';
import { PaginationDto, Paginated } from '../../common/dto/pagination.dto';
import { ItemsService } from '../items/items.service';

@Injectable()
export class PurchaseOrdersService {
  private readonly logger = new Logger(PurchaseOrdersService.name);
  private orderCounter = 1;

  constructor(
    @InjectRepository(PurchaseOrderEntity) private orderRepo: Repository<PurchaseOrderEntity>,
    @InjectRepository(PurchaseOrderItemEntity) private orderItemRepo: Repository<PurchaseOrderItemEntity>,
    @InjectRepository(StockMovementEntity) private movementRepo: Repository<StockMovementEntity>,
    @InjectRepository(ItemEntity) private itemRepo: Repository<ItemEntity>,
    private dataSource: DataSource,
    private itemsService: ItemsService,
  ) {}

  private async generateOrderNumber(): Promise<string> {
    const count = await this.orderRepo.count();
    return `PO-${String(count + 1).padStart(5, '0')}`;
  }

  async findAll(pagination: PaginationDto & { status?: string; supplierId?: string }): Promise<Paginated<PurchaseOrderEntity>> {
    const { page = 1, limit = 20, status, supplierId } = pagination;
    const qb = this.orderRepo.createQueryBuilder('order')
      .leftJoinAndSelect('order.supplier', 'supplier')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.item', 'item');
    if (status)     qb.andWhere('order.status = :status', { status });
    if (supplierId) qb.andWhere('order.supplierId = :supplierId', { supplierId });
    const [data, total] = await qb.orderBy('order.createdAt', 'DESC').skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const order = await this.orderRepo.findOne({ where: { id }, relations: { supplier: true, items: { item: { category: true } } } });
    if (!order) throw new NotFoundException('Purchase order not found');
    return order;
  }

  async create(dto: CreatePurchaseOrderDto): Promise<PurchaseOrderEntity> {
    const orderNumber = await this.generateOrderNumber();
    const totalAmount = dto.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const order = await this.orderRepo.save(this.orderRepo.create({
      orderNumber, supplierId: dto.supplierId, notes: dto.notes,
      expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
      totalAmount,
    }));
    const orderItems = dto.items.map(i => this.orderItemRepo.create({ orderId: order.id, itemId: i.itemId, quantity: i.quantity, unitPrice: i.unitPrice }));
    await this.orderItemRepo.save(orderItems);
    this.logger.log(`Purchase order created: ${order.orderNumber}`);
    return this.findOne(order.id);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<PurchaseOrderEntity> {
    const order = await this.findOne(id);
    if (order.status === OrderStatus.RECEIVED) throw new BadRequestException('Order already received');
    if (order.status === OrderStatus.CANCELLED) throw new BadRequestException('Cannot update cancelled order');
    order.status = status;
    return this.orderRepo.save(order);
  }

  // Receive order → update stock via transaction
  async receive(id: string, userId: string): Promise<PurchaseOrderEntity> {
    const order = await this.findOne(id);
    if (order.status !== OrderStatus.SENT && order.status !== OrderStatus.DRAFT)
      throw new BadRequestException('Only DRAFT or SENT orders can be received');

    await this.dataSource.transaction(async (manager) => {
      for (const oi of order.items) {
        const item = await manager.findOne(ItemEntity, { where: { id: oi.itemId } });
        if (!item) continue;
        item.quantity = Number(item.quantity) + Number(oi.quantity);
        item.costPrice = Number(oi.unitPrice); // update cost price from latest PO
        await manager.save(ItemEntity, item);

        const movement = manager.create(StockMovementEntity, {
          itemId: oi.itemId, type: MovementType.IN,
          quantity: oi.quantity, reason: 'Purchase order received',
          reference: order.orderNumber, createdById: userId,
        });
        await manager.save(StockMovementEntity, movement);
      }
      order.status = OrderStatus.RECEIVED;
      order.receivedAt = new Date();
      await manager.save(PurchaseOrderEntity, order);
    });

    this.logger.log(`Order ${order.orderNumber} received — stock updated`);
    return this.findOne(id);
  }

  async cancel(id: string): Promise<PurchaseOrderEntity> {
    const order = await this.findOne(id);
    if (order.status === OrderStatus.RECEIVED) throw new BadRequestException('Cannot cancel received order');
    order.status = OrderStatus.CANCELLED;
    return this.orderRepo.save(order);
  }
}
