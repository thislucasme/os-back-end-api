// src/modules/ordens-servico/entities/item-os.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrdemServico } from './ordem-servico.entity';
import { ProdutoServico } from 'src/produtos-servicos/entities/produto-servico.entity';
import { User } from 'src/users/user.entity';

export enum ItemOsTipo {
  PRODUTO = 'PRODUTO',
  SERVICO = 'SERVICO',
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
  valor!: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'responsavel_id' })
  responsavel!: User | null;

  @Column({ name: 'responsavel_id', nullable: true })
  responsavelId!: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  comissao!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}