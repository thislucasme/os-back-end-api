// src/propostas/entities/proposta.entity.ts
import { ClienteFornecedor } from 'src/clientes-fornecedores/entities/cliente-fornecedor.entity';
import { Company } from 'src/companies/ company.entity';
import { OrdemServico } from 'src/ordens-servico/entities/ordem-servico.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PropostaItem } from './proposta-item.entity';

export enum PropostaStatus {
  RASCUNHO = 'Rascunho',
  ENVIADA = 'Enviada',
  APROVADA = 'Aprovada',
  RECUSADA = 'Recusada',
  CANCELADA = 'Cancelada',
}

@Entity('propostas')
export class Proposta {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  companyId!: number;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @Column({ nullable: true })
  ordemServicoId!: number | null;

  @ManyToOne(() => OrdemServico, (os) => os.propostas, { nullable: true })
  @JoinColumn({ name: 'ordemServicoId' })
  ordemServico!: OrdemServico | null;

  @Column({ nullable: true })
  clienteId!: number | null;

  @ManyToOne(() => ClienteFornecedor, { nullable: true })
  @JoinColumn({ name: 'clienteId' })
  cliente!: ClienteFornecedor | null;

  @Column({ unique: true })
  numero!: string;

  @Column()
  titulo!: string;

  @Column({ type: 'text', nullable: true })
  descricao!: string;

  @Column({
    type: 'enum',
    enum: PropostaStatus,
    default: PropostaStatus.RASCUNHO,
  })
  status!: PropostaStatus;

  @Column({ type: 'date', nullable: true })
  dataEmissao!: string | null;

  @Column({ type: 'date', nullable: true })
  validade!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  desconto!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorTotal!: number;

  @Column({ nullable: true })
  condicoesPagamento!: string;

  @Column({ nullable: true })
  garantia!: string;

  @Column({ type: 'text', nullable: true })
  observacoes!: string;

  @Column({ type: 'text', nullable: true })
  mensagemFinal!: string;

  @OneToMany(() => PropostaItem, (item) => item.proposta, {
    cascade: true,
  })
  itens!: PropostaItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}