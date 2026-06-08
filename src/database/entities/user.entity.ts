import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { UserRole } from './enums';
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Index() @Column({ unique: true }) email: string;
  @Column() password: string;
  @Column({ type: 'enum', enum: UserRole, default: UserRole.STAFF }) role: UserRole;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
