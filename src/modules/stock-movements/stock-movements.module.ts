import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockMovementEntity } from '../../database/entities/stock-movement.entity';
import { StockMovementsController } from './stock-movements.controller';
import { StockMovementsService } from './stock-movements.service';
import { ItemsModule } from '../items/items.module';
@Module({ imports: [TypeOrmModule.forFeature([StockMovementEntity]), ItemsModule], controllers: [StockMovementsController], providers: [StockMovementsService] })
export class StockMovementsModule {}
