// src/ordens-servico/entities/ordem-servico-item.entity.ts
import { ProdutoServico } from 'src/produtos-servicos/entities/produto-servico.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrdemServico } from './ordem-servico.entity';

@Entity('ordens_servico_itens')
export class OrdemServicoItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  ordemServicoId!: number;

  @ManyToOne(() => OrdemServico, (os) => os.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ordemServicoId' })
  ordemServico!: OrdemServico;

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