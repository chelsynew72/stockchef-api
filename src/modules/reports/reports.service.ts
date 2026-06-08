import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemEntity } from '../../database/entities/item.entity';
import { SaleEntity } from '../../database/entities/sale.entity';
import { PurchaseOrderEntity } from '../../database/entities/purchase-order.entity';
import { StockMovementEntity } from '../../database/entities/stock-movement.entity';
import { OrderStatus } from '../../database/entities/enums';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ItemEntity) private itemRepo: Repository<ItemEntity>,
    @InjectRepository(SaleEntity) private saleRepo: Repository<SaleEntity>,
    @InjectRepository(PurchaseOrderEntity) private orderRepo: Repository<PurchaseOrderEntity>,
    @InjectRepository(StockMovementEntity) private movementRepo: Repository<StockMovementEntity>,
  ) {}

  async getDashboardStats() {
    const [totalItems, lowStockItems, totalSuppliers, pendingOrders] = await Promise.all([
      this.itemRepo.count({ where: { isActive: true } }),
      this.itemRepo.createQueryBuilder('i').where('i.isActive = true').andWhere('i.quantity <= i.minQuantity').getCount(),
      this.itemRepo.createQueryBuilder().select('COUNT(DISTINCT "supplierId")').where('"supplierId" IS NOT NULL').getRawOne(),
      this.orderRepo.count({ where: [{ status: OrderStatus.DRAFT }, { status: OrderStatus.SENT }] }),
    ]);

    const stockValue = await this.itemRepo.createQueryBuilder('i')
      .select('SUM(i.quantity * i.costPrice)', 'value')
      .where('i.isActive = true').getRawOne<{ value: string }>();

    const revenueToday = await this.saleRepo.createQueryBuilder('s')
      .select('COALESCE(SUM(s.totalAmount), 0)', 'revenue')
      .where('DATE(s.createdAt) = CURRENT_DATE').getRawOne<{ revenue: string }>();

    const revenueThisMonth = await this.saleRepo.createQueryBuilder('s')
      .select('COALESCE(SUM(s.totalAmount), 0)', 'revenue')
      .where("DATE_TRUNC('month', s.createdAt) = DATE_TRUNC('month', CURRENT_DATE)").getRawOne<{ revenue: string }>();

    return {
      totalItems,
      lowStockItems,
      pendingOrders,
      stockValue: parseFloat(stockValue?.value ?? '0'),
      revenueToday: parseFloat(revenueToday?.revenue ?? '0'),
      revenueThisMonth: parseFloat(revenueThisMonth?.revenue ?? '0'),
    };
  }

  async getLowStockItems() {
    return this.itemRepo.createQueryBuilder('i')
      .leftJoinAndSelect('i.category', 'category')
      .leftJoinAndSelect('i.supplier', 'supplier')
      .where('i.isActive = true')
      .andWhere('i.quantity <= i.minQuantity')
      .orderBy('i.quantity', 'ASC')
      .getMany();
  }

  async getRevenueByDay(days = 30) {
    const rows = await this.saleRepo.createQueryBuilder('s')
      .select("TO_CHAR(s.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('COALESCE(SUM(s.totalAmount), 0)', 'revenue')
      .addSelect('COUNT(s.id)', 'sales')
      .where("s.createdAt >= NOW() - INTERVAL ':days days'", { days })
      .groupBy("TO_CHAR(s.createdAt, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(s.createdAt, 'YYYY-MM-DD')", 'ASC')
      .getRawMany();
    return rows.map(r => ({ date: r.date, revenue: parseFloat(r.revenue), sales: parseInt(r.sales) }));
  }

  async getTopItems(limit = 10) {
    return this.movementRepo.createQueryBuilder('m')
      .select('m.itemId', 'itemId')
      .addSelect('item.name', 'name')
      .addSelect('item.unit', 'unit')
      .addSelect('SUM(m.quantity)', 'totalMoved')
      .leftJoin('m.item', 'item')
      .where("m.type = 'OUT'")
      .groupBy('m.itemId').addGroupBy('item.name').addGroupBy('item.unit')
      .orderBy('SUM(m.quantity)', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getStockValueByCategory() {
    return this.itemRepo.createQueryBuilder('i')
      .select('category.name', 'category')
      .addSelect('category.color', 'color')
      .addSelect('SUM(i.quantity * i.costPrice)', 'value')
      .addSelect('COUNT(i.id)', 'itemCount')
      .leftJoin('i.category', 'category')
      .where('i.isActive = true')
      .groupBy('category.name').addGroupBy('category.color')
      .getRawMany();
  }
}
