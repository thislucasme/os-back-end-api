import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
import { Pagamento } from './pagamento.entity';
import { ContaFinanceira } from 'src/financeiro/contas-financeiras/entities/conta-financeira.entity';

export enum StatusContaPagar {
  ABERTA = 'ABERTA',
  PARCIAL = 'PARCIAL',
  PAGA = 'PAGA',
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

@Entity('contas_pagar')
export class ContaPagar {
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

  @ApiPropertyOptional({
    example: 1,
    description: 'ID da conta financeira usada para pagamento.',
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
    example: 'Fornecedor ABC',
    description: 'Nome do fornecedor ou responsável pela conta.',
  })
  @Column({
    length: 150,
  })
  fornecedorNome!: string;

  @ApiPropertyOptional({
    example: '12345678000199',
    description: 'CPF ou CNPJ do fornecedor.',
  })
  @Column({
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  fornecedorDocumento?: string | null;

  @ApiPropertyOptional({
    example: 'Compra de materiais para escritório.',
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  descricao?: string | null;

  @ApiProperty({
    example: 500,
    description: 'Valor original da conta a pagar.',
  })
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: decimalTransformer,
  })
  valorOriginal!: number;

  @ApiProperty({
    example: 200,
    description: 'Valor já pago da conta.',
  })
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  valorPago!: number;

  @ApiProperty({
    example: '2026-06-30',
    description: 'Data de vencimento da conta.',
  })
  @Column({
    type: 'date',
  })
  dataVencimento!: string;

  @ApiPropertyOptional({
    example: '2026-06-25',
    description: 'Data de emissão da conta.',
  })
  @Column({
    type: 'date',
    nullable: true,
  })
  dataEmissao?: string | null;

  @ApiProperty({
    enum: StatusContaPagar,
    example: StatusContaPagar.ABERTA,
  })
  @Column({
    type: 'enum',
    enum: StatusContaPagar,
    default: StatusContaPagar.ABERTA,
  })
  status!: StatusContaPagar;

  @OneToMany(
    () => Pagamento,
    pagamento => pagamento.contaPagar,
  )
  pagamentos!: Pagamento[];

  @ApiProperty({
    example: '2026-06-25T10:30:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-06-25T10:30:00.000Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}