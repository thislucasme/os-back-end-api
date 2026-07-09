import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContaFinanceira } from 'src/financeiro/contas-financeiras/entities/conta-financeira.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  ValueTransformer,
} from 'typeorm';

export enum TipoMovimentacaoFinanceira {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
  TRANSFERENCIA_ENTRADA = 'TRANSFERENCIA_ENTRADA',
  TRANSFERENCIA_SAIDA = 'TRANSFERENCIA_SAIDA',
  AJUSTE = 'AJUSTE',
}

export enum OrigemMovimentacaoFinanceira {
  CONTA_RECEBER = 'CONTA_RECEBER',
  CONTA_PAGAR = 'CONTA_PAGAR',
  TRANSFERENCIA = 'TRANSFERENCIA',
  DESPESA = 'DESPESA',
  MANUAL = 'MANUAL',
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

@Entity('movimentacoes_financeiras')
export class MovimentacaoFinanceira {
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
    description: 'ID da conta financeira movimentada.',
  })
  @Column({
    name: 'conta_financeira_id',
    type: 'int',
  })
  contaFinanceiraId!: number;

  @ManyToOne(() => ContaFinanceira, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'conta_financeira_id',
  })
  contaFinanceira!: ContaFinanceira;

  @ApiProperty({
    enum: TipoMovimentacaoFinanceira,
    example: TipoMovimentacaoFinanceira.ENTRADA,
  })
  @Column({
    type: 'enum',
    enum: TipoMovimentacaoFinanceira,
  })
  tipo!: TipoMovimentacaoFinanceira;

  @ApiProperty({
    enum: OrigemMovimentacaoFinanceira,
    example: OrigemMovimentacaoFinanceira.CONTA_RECEBER,
  })
  @Column({
    type: 'enum',
    enum: OrigemMovimentacaoFinanceira,
  })
  origem!: OrigemMovimentacaoFinanceira;

  @ApiPropertyOptional({
    example: 10,
    description: 'ID do registro que originou a movimentação. Pode ser pagamento, recebimento ou transferência.',
  })
  @Column({
    name: 'referencia_id',
    type: 'int',
    nullable: true,
  })
  referenciaId?: number | null;

  @ApiProperty({
    example: 250,
    description: 'Valor da movimentação.',
  })
  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    transformer: decimalTransformer,
  })
  valor!: number;

  @ApiPropertyOptional({
    example: 'Recebimento de conta a receber.',
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  descricao?: string | null;

  @ApiProperty({
    example: '2026-06-26',
    description: 'Data da movimentação financeira.',
  })
  @Column({
    name: 'data_movimentacao',
    type: 'date',
  })
  dataMovimentacao!: string;

  @ApiProperty({
    example: '2026-06-26T02:30:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;
}