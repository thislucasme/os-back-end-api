// src/financeiro/contas-pagar/entities/conta-pagar-parcela.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  ValueTransformer,
} from 'typeorm';
import { ContaPagar } from './conta-pagar.entity';
import { Pagamento } from './pagamento.entity';

const decimalTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | number | null) => {
    if (value === null || value === undefined) {
      return 0;
    }
    return Number(value);
  },
};

@Entity('contas_pagar_parcelas')
export class ContaPagarParcela {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'conta_pagar_id' })
  contaPagarId!: number;

  @ManyToOne(
    () => ContaPagar,
    conta => conta.parcelas,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'conta_pagar_id' })
  contaPagar!: ContaPagar;

  @Column()
  numero!: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: decimalTransformer,
  })
  valor!: number;

  @Column({ type: 'date' })
  vencimento!: string;

  @Column({ default: false })
  paga!: boolean;

  @OneToMany(
    () => Pagamento,
    pagamento => pagamento.parcela,
  )
  pagamentos!: Pagamento[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}