import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  ValueTransformer,
} from 'typeorm';
import { ContaFinanceira } from 'src/financeiro/contas-financeiras/entities/conta-financeira.entity';

const decimalTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | number | null) => {
    if (value === null || value === undefined) {
      return 0;
    }

    return Number(value);
  },
};

@Entity('transferencias')
export class Transferencia {
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
    description: 'ID da conta financeira de origem.',
  })
  @Column({
    name: 'conta_origem_id',
    type: 'int',
  })
  contaOrigemId!: number;

  @ManyToOne(() => ContaFinanceira, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'conta_origem_id',
  })
  contaOrigem!: ContaFinanceira;

  @ApiProperty({
    example: 2,
    description: 'ID da conta financeira de destino.',
  })
  @Column({
    name: 'conta_destino_id',
    type: 'int',
  })
  contaDestinoId!: number;

  @ManyToOne(() => ContaFinanceira, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'conta_destino_id',
  })
  contaDestino!: ContaFinanceira;

  @ApiProperty({
    example: 300,
    description: 'Valor transferido.',
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
    description: 'Data da transferência.',
  })
  @Column({
    name: 'data_transferencia',
    type: 'date',
  })
  dataTransferencia!: string;

  @ApiPropertyOptional({
    example: 'Transferência do caixa para o banco.',
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  descricao?: string | null;

  @ApiProperty({
    example: '2026-06-26T10:30:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;
}