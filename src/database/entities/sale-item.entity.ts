import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SaleEntity } from './sale.entity';
import { ItemEntity } from './item.entity';
@Entity('sale_items')
export class SaleItemEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => SaleEntity, (s) => s.items, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'saleId' }) sale: SaleEntity;
  @Column() saleId: string;
  @ManyToOne(() => ItemEntity) @JoinColumn({ name: 'itemId' }) item: ItemEntity;
  @Column() itemId: string;
  @Column('decimal', { precision: 10, scale: 2 }) quantity: number;
  @Column('decimal', { precision: 10, scale: 2 }) unitPrice: number;
}
