import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { OrdemServico } from './ordem-servico.entity';
import { User } from '../../users/user.entity';

export enum CommissionType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

@Index(['orderServiceId', 'employeeId'], { unique: true })
@Entity('order_service_responsibles')
export class OrderServiceResponsible {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  orderServiceId!: number;

  @ManyToOne(() => OrdemServico, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderServiceId' })
  orderService!: OrdemServico;

  @Column()
  employeeId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'employeeId' })
  employee!: User;

  @Column({ type: 'enum', enum: CommissionType, default: CommissionType.PERCENTAGE })
  productCommissionType!: CommissionType;

  @Column({ type: 'enum', enum: CommissionType, default: CommissionType.PERCENTAGE })
  serviceCommissionType!: CommissionType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  productCommissionValue!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  serviceCommissionValue!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}