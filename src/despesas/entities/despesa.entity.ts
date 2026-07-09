import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ValueTransformer,
} from 'typeorm';
import { ContaFinanceira } from 'src/financeiro/contas-financeiras/entities/conta-financeira.entity';

export enum StatusDespesa {
  ATIVA = 'ATIVA',
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

@Entity('despesas')
export class Despesa {
  @ApiProperty({
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({
    example: 1,
  })
  @Column({
    name: 'company_id',
    type: 'int',
  })
  companyId!: number;

  @ApiProperty({
    example: 1,
    description: 'ID da conta financeira usada para pagar a despesa.',
  })
  @Column({
    name: 'conta_financeira_id',
    type: 'int',
  })
  contaFinanceiraId!: number;

  @ManyToOne(() => ContaFinanceira, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'conta_financeira_id',
  })
  contaFinanceira!: ContaFinanceira;

  @ApiProperty({
    example: 'Compra de materiais de limpeza',
  })
  @Column({
    type: 'varchar',
    length: 255,
  })
  descricao!: string;

  @ApiPropertyOptional({
    example: 'Limpeza',
  })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  categoria?: string | null;

  @ApiProperty({
    example: 85.5,
    description: 'Valor da despesa.',
  })
  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    transformer: decimalTransformer,
  })
  valor!: number;

  @ApiProperty({
    example: '2026-06-26',
    description: 'Data da despesa.',
  })
  @Column({
    name: 'data_despesa',
    type: 'date',
  })
  dataDespesa!: string;

  @ApiPropertyOptional({
    example: 'PIX',
  })
  @Column({
    name: 'forma_pagamento',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  formaPagamento?: string | null;

  @ApiPropertyOptional({
    example: 'Compra feita no mercado.',
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  observacao?: string | null;

  @ApiProperty({
    enum: StatusDespesa,
    example: StatusDespesa.ATIVA,
  })
  @Column({
    type: 'enum',
    enum: StatusDespesa,
    default: StatusDespesa.ATIVA,
  })
  status!: StatusDespesa;

  @ApiProperty({
    example: '2026-06-26T10:30:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-06-26T10:30:00.000Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}