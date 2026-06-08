import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PurchaseOrderEntity } from './purchase-order.entity';
import { ItemEntity } from './item.entity';
@Entity('purchase_order_items')
export class PurchaseOrderItemEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => PurchaseOrderEntity, (o) => o.items, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'orderId' }) order: PurchaseOrderEntity;
  @Column() orderId: string;
  @ManyToOne(() => ItemEntity) @JoinColumn({ name: 'itemId' }) item: ItemEntity;
  @Column() itemId: string;
  @Column('decimal', { precision: 10, scale: 2 }) quantity: number;
  @Column('decimal', { precision: 10, scale: 2 }) unitPrice: number;
  @Column('decimal', { precision: 10, scale: 2, default: 0 }) receivedQuantity: number;
}
