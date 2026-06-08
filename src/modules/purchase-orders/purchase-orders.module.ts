import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrderEntity } from '../../database/entities/purchase-order.entity';
import { PurchaseOrderItemEntity } from '../../database/entities/purchase-order-item.entity';
import { StockMovementEntity } from '../../database/entities/stock-movement.entity';
import { ItemEntity } from '../../database/entities/item.entity';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';
import { ItemsModule } from '../items/items.module';
@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrderEntity, PurchaseOrderItemEntity, StockMovementEntity, ItemEntity]), ItemsModule],
  controllers: [PurchaseOrdersController], providers: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}
