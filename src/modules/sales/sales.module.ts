import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleEntity } from '../../database/entities/sale.entity';
import { SaleItemEntity } from '../../database/entities/sale-item.entity';
import { StockMovementEntity } from '../../database/entities/stock-movement.entity';
import { ItemEntity } from '../../database/entities/item.entity';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { ItemsModule } from '../items/items.module';
@Module({ imports: [TypeOrmModule.forFeature([SaleEntity, SaleItemEntity, StockMovementEntity, ItemEntity]), ItemsModule], controllers: [SalesController], providers: [SalesService] })
export class SalesModule {}
