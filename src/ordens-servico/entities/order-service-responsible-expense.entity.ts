import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderServiceResponsible } from './order-service-responsible.entity';
import { ItemOsLiberacao, ItemOsStatusPagamento } from './item-os.entity';

@Entity('order_service_responsible_expenses')
export class OrderServiceResponsibleExpense {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  orderServiceResponsibleId!: number;

  @ManyToOne(() => OrderServiceResponsible, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderServiceResponsibleId' })
  responsible!: OrderServiceResponsible;

  @Column()
  expenseTypeId!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string | null;

  @Column({ type: 'boolean', default: true })
  assignToOrderService!: boolean;

  @Column({
    type: 'enum',
    enum: ItemOsLiberacao,
    default: ItemOsLiberacao.NA_CONCLUSAO_OS,
  })
  liberacao!: ItemOsLiberacao;

  @Column({ type: 'timestamp', nullable: true })
  data_liberacao?: Date;

  @Column({
    name: 'status_debito',
    type: 'enum',
    enum: ItemOsStatusPagamento,
    default: ItemOsStatusPagamento.PENDENTE,
  })
  statusDebito!: ItemOsStatusPagamento;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}