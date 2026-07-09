import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ValueTransformer,
} from 'typeorm';
import { Recebimento } from './recebimento.entity';
import { ContaFinanceira } from 'src/financeiro/contas-financeiras/entities/conta-financeira.entity';

export enum StatusContaReceber {
  ABERTA = 'ABERTA',
  PARCIAL = 'PARCIAL',
  RECEBIDA = 'RECEBIDA',
  CANCELADA = 'CANCELADA',
}

const decimalTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | number | null) => {
    if (value === null || value === undefined) {
      return 0;
    }

    return Number(value);
  },
};

@Entity('contas_receber')
export class ContaReceber {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'company_id',
  })
  companyId!: number;

  @Column({
    name: 'conta_financeira_id',
    nullable: true,
  })
  contaFinanceiraId?: number | null;

  @ManyToOne(() => ContaFinanceira, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'conta_financeira_id',
  })
  contaFinanceira?: ContaFinanceira | null;

  @Column({
    length: 150,
  })
  clienteNome!: string;

  @Column({
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  clienteDocumento?: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  descricao?: string | null;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: decimalTransformer,
  })
  valorOriginal!: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  valorRecebido!: number;

  @Column({
    type: 'date',
  })
  dataVencimento!: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  dataEmissao?: string | null;

  @Column({
    type: 'enum',
    enum: StatusContaReceber,
    default: StatusContaReceber.ABERTA,
  })
  status!: StatusContaReceber;

  @OneToMany(
    () => Recebimento,
    recebimento => recebimento.contaReceber,
  )
  recebimentos!: Recebimento[];

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}