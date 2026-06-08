import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ItemEntity } from './item.entity';
import { PurchaseOrderEntity } from './purchase-order.entity';
@Entity('suppliers')
export class SupplierEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ unique: true }) email: string;
  @Column({ nullable: true }) phone: string;
  @Column({ nullable: true }) address: string;
  @Column({ default: true }) isActive: boolean;
  @OneToMany(() => ItemEntity, (i) => i.supplier) items: ItemEntity[];
  @OneToMany(() => PurchaseOrderEntity, (o) => o.supplier) orders: PurchaseOrderEntity[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
