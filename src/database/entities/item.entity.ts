import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ItemUnit } from './enums';
import { CategoryEntity } from './category.entity';
import { SupplierEntity } from './supplier.entity';
import { StockMovementEntity } from './stock-movement.entity';
@Entity('items')
export class ItemEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column() name: string;
  @Column({ unique: true }) sku: string;
  @Column({ nullable: true }) description: string;
  @Column({ type: 'enum', enum: ItemUnit, default: ItemUnit.PIECE }) unit: ItemUnit;
  @Column('decimal', { precision: 10, scale: 2, default: 0 }) quantity: number;
  @Column('decimal', { precision: 10, scale: 2, default: 0 }) minQuantity: number;
  @Column('decimal', { precision: 10, scale: 2, default: 0 }) costPrice: number;
  @Column('decimal', { precision: 10, scale: 2, default: 0 }) sellingPrice: number;
  @Column({ default: true }) isActive: boolean;
  @ManyToOne(() => CategoryEntity, (c) => c.items, { nullable: true }) @JoinColumn({ name: 'categoryId' }) category: CategoryEntity;
  @Column({ nullable: true }) categoryId: string;
  @ManyToOne(() => SupplierEntity, (s) => s.items, { nullable: true }) @JoinColumn({ name: 'supplierId' }) supplier: SupplierEntity;
  @Column({ nullable: true }) supplierId: string;
  @OneToMany(() => StockMovementEntity, (m) => m.item) movements: StockMovementEntity[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
