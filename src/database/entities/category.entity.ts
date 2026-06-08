import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { ItemEntity } from './item.entity';
@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) name: string;
  @Column({ default: '#6B7280' }) color: string;
  @Column({ nullable: true }) description: string;
  @OneToMany(() => ItemEntity, (i) => i.category) items: ItemEntity[];
  @CreateDateColumn() createdAt: Date;
}
