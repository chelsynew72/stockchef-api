import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity';
import { SaleItemEntity } from './sale-item.entity';
@Entity('sales')
export class SaleEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('decimal', { precision: 10, scale: 2 }) totalAmount: number;
  @Column({ nullable: true }) notes: string;
  @ManyToOne(() => UserEntity) @JoinColumn({ name: 'createdById' }) createdBy: UserEntity;
  @Column() createdById: string;
  @OneToMany(() => SaleItemEntity, (i) => i.sale, { cascade: true }) items: SaleItemEntity[];
  @CreateDateColumn() createdAt: Date;
}
