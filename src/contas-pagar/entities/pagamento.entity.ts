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
import { ContaPagar } from './conta-pagar.entity';
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

@Entity('pagamentos')
export class Pagamento {
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
  })
  companyId!: number;

  @ApiProperty({
    example: 1,
  })
  @Column({
    name: 'conta_pagar_id',
  })
  contaPagarId!: number;

  @ManyToOne(
    () => ContaPagar,
    contaPagar => contaPagar.pagamentos,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'conta_pagar_id',
  })
  contaPagar!: ContaPagar;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID da conta financeira de onde saiu o dinheiro.',
  })
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

  @ApiProperty({
    example: 150,
    description: 'Valor pago.',
  })
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: decimalTransformer,
  })
  valor!: number;

  @ApiProperty({
    example: '2026-06-25',
    description: 'Data do pagamento.',
  })
  @Column({
    type: 'date',
  })
  dataPagamento!: string;

  @ApiPropertyOptional({
    example: 'PIX',
    description: 'Forma de pagamento utilizada.',
  })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  formaPagamento?: string | null;

  @ApiPropertyOptional({
    example: 'Pagamento parcial da conta.',
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  observacao?: string | null;

  @ApiProperty({
    example: '2026-06-25T10:30:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;
}