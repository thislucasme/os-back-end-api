// src/propostas/entities/proposta-item.entity.ts
import { ProdutoServico } from 'src/produtos-servicos/entities/produto-servico.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Proposta } from './proposta.entity';

@Entity('propostas_itens')
export class PropostaItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  propostaId!: number;

  @ManyToOne(() => Proposta, (proposta) => proposta.itens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'propostaId' })
  proposta!: Proposta;

  @Column()
  produtoServicoId!: number;

  @ManyToOne(() => ProdutoServico)
  @JoinColumn({ name: 'produtoServicoId' })
  produtoServico!: ProdutoServico;

  @Column({ type: 'text', nullable: true })
  descricao!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  quantidade!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorUnitario!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorTotal!: number;
}