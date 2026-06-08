import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemEntity } from '../../database/entities/item.entity';
import { SaleEntity } from '../../database/entities/sale.entity';
import { PurchaseOrderEntity } from '../../database/entities/purchase-order.entity';
import { StockMovementEntity } from '../../database/entities/stock-movement.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
@Module({ imports: [TypeOrmModule.forFeature([ItemEntity, SaleEntity, PurchaseOrderEntity, StockMovementEntity])], controllers: [ReportsController], providers: [ReportsService] })
export class ReportsModule {}
