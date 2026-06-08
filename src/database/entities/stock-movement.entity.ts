import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MovementType } from './enums';
import { ItemEntity } from './item.entity';
import { UserEntity } from './user.entity';
@Entity('stock_movements')
export class StockMovementEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => ItemEntity, (i) => i.movements) @JoinColumn({ name: 'itemId' }) item: ItemEntity;
  @Column() itemId: string;
  @Column({ type: 'enum', enum: MovementType }) type: MovementType;
  @Column('decimal', { precision: 10, scale: 2 }) quantity: number;
  @Column({ nullable: true }) reason: string;
  @Column({ nullable: true }) reference: string;
  @ManyToOne(() => UserEntity) @JoinColumn({ name: 'createdById' }) createdBy: UserEntity;
  @Column() createdById: string;
  @CreateDateColumn() createdAt: Date;
}
