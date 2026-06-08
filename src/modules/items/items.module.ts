import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ItemEntity } from '../../database/entities/item.entity';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
@Module({ imports: [TypeOrmModule.forFeature([ItemEntity]), BullModule.registerQueue({ name: 'alerts' })], controllers: [ItemsController], providers: [ItemsService], exports: [ItemsService] })
export class ItemsModule {}
