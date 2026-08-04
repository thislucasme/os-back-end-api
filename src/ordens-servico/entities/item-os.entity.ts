import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrdemServico } from './ordem-servico.entity';
import { ProdutoServico } from 'src/produtos-servicos/entities/produto-servico.entity';
import { ItemOsResponsavel } from './item-os-responsavel.entity';

export enum ItemOsLiberacao {
  APOS_RECEBIMENTO = 'APOS_RECEBIMENTO',
  NA_CONCLUSAO_OS = 'NA_CONCLUSAO_OS',
}

export enum ItemOsTipo {
  PRODUTO = 'PRODUTO',
  SERVICO = 'SERVICO',
}

export enum ItemOsOrigem {
  OS = 'OS',
  PROPOSTA = 'PROPOSTA',
}

@Entity('itens_os')
export class ItemOs {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => OrdemServico, (os) => os.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ordem_servico_id' })
  ordemServico!: OrdemServico;

  @Column({ name: 'ordem_servico_id' })
  ordemServicoId!: number;

  @ManyToOne(() => ProdutoServico, { eager: true })
  @JoinColumn({ name: 'produto_servico_id' })
  produtoServico!: ProdutoServico;

  @Column({ name: 'produto_servico_id' })
  produtoServicoId!: number;

  @Column({ type: 'enum', enum: ItemOsTipo })
  tipo!: ItemOsTipo;

  @Column({ length: 255 })
  nome!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valor!: number; // unitário

  @Column({ type: 'int', default: 1 })
  quantidade!: number;

  @Column({ type: 'enum', enum: ItemOsOrigem, default: ItemOsOrigem.OS })
  origem!: ItemOsOrigem;

  // Relação com os responsáveis (cada um com sua comissão)
  @OneToMany(() => ItemOsResponsavel, (ir) => ir.item, { cascade: true, eager: true })
  responsaveis!: ItemOsResponsavel[];

  @Column({
    type: 'enum',
    enum: ItemOsLiberacao,
    default: ItemOsLiberacao.NA_CONCLUSAO_OS,
  })
  liberacao!: ItemOsLiberacao;

  @Column({ type: 'timestamp', nullable: true })
  data_liberacao?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}