// src/financeiro/contas-pagar/entities/conta-pagar.entity.ts
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
import { ContaFinanceira } from 'src/financeiro/contas-financeiras/entities/conta-financeira.entity';
import { ClienteFornecedor } from 'src/clientes-fornecedores/entities/cliente-fornecedor.entity';
import { OrdemServico } from 'src/ordens-servico/entities/ordem-servico.entity';
import { ContaPagarParcela } from './conta-pagar-parcela.entity';

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
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 1 })
  @Column({ name: 'company_id' })
  companyId!: number;

  // ========== FORNECEDOR (obrigatório) ==========
  @ApiProperty({ example: 1 })
  @Column({ name: 'fornecedor_id' })
  fornecedorId!: number;

  @ManyToOne(() => ClienteFornecedor, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'fornecedor_id' })
  fornecedor!: ClienteFornecedor;

  // ========== ORDEM DE SERVIÇO (opcional) ==========
  @ApiPropertyOptional({ example: 1 })
  @Column({ name: 'ordem_servico_id', nullable: true })
  ordemServicoId?: number | null;

  @ManyToOne(() => OrdemServico, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'ordem_servico_id' })
  ordemServico?: OrdemServico | null;

  // ========== CONTA FINANCEIRA PADRÃO (opcional) ==========
  @ApiPropertyOptional({ example: 1 })
  @Column({ name: 'conta_financeira_id', nullable: true })
  contaFinanceiraId?: number | null;

  @ManyToOne(() => ContaFinanceira, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'conta_financeira_id' })
  contaFinanceira?: ContaFinanceira | null;

  // ========== DESCRIÇÃO ==========
  @ApiPropertyOptional({ example: 'Compra de materiais' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  descricao?: string | null;

  // ========== VALORES ==========
  @ApiProperty({ example: 3000 })
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: decimalTransformer,
  })
  valorOriginal!: number;

  @ApiProperty({ example: 0 })
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  valorPago!: number;

  // ========== DATAS ==========
  @ApiProperty({ example: '2026-08-10' })
  @Column({ type: 'date' })
  dataVencimento!: string; // primeiro vencimento

  @ApiPropertyOptional({ example: '2026-07-15' })
  @Column({ type: 'date', nullable: true })
  dataEmissao?: string | null;

  // ========== STATUS ==========
  @ApiProperty({ enum: StatusContaPagar, example: StatusContaPagar.ABERTA })
  @Column({
    type: 'enum',
    enum: StatusContaPagar,
    default: StatusContaPagar.ABERTA,
  })
  status!: StatusContaPagar;

  // ========== PARCELAS ==========
  @OneToMany(
    () => ContaPagarParcela,
    parcela => parcela.contaPagar,
    { cascade: true },
  )
  parcelas!: ContaPagarParcela[];

  // ========== TIMESTAMPS ==========
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}