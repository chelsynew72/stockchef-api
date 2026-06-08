import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { OrderStatus } from './enums';
import { SupplierEntity } from './supplier.entity';
import { PurchaseOrderItemEntity } from './purchase-order-item.entity';
@Entity('purchase_orders')
export class PurchaseOrderEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) orderNumber: string;
  @ManyToOne(() => SupplierEntity, (s) => s.orders) @JoinColumn({ name: 'supplierId' }) supplier: SupplierEntity;
  @Column() supplierId: string;
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.DRAFT }) status: OrderStatus;
  @Column('decimal', { precision: 10, scale: 2, default: 0 }) totalAmount: number;
  @Column({ nullable: true }) notes: string;
  @Column({ nullable: true, type: 'timestamptz' }) expectedDate: Date;
  @Column({ nullable: true, type: 'timestamptz' }) receivedAt: Date;
  @OneToMany(() => PurchaseOrderItemEntity, (i) => i.order, { cascade: true }) items: PurchaseOrderItemEntity[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
