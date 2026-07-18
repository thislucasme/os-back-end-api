// src/ordens-servico/entities/ordem-servico.entity.ts
import { ClienteFornecedor } from 'src/clientes-fornecedores/entities/cliente-fornecedor.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from 'src/companies/ company.entity';
import { Proposta } from './proposta.entity';
import { OrdemServicoItem } from './ordem-servico-item.entity';
import { OrdemServicoAnexo } from './ordem-servico-anexo.entity';

export enum OrdemServicoStatus {
  RECEBIDO = 'Recebido',
  EM_ANALISE = 'Em análise',
  AGUARDANDO_APROVACAO = 'Aguardando aprovação',
  APROVADO = 'Aprovado',
  EM_EXECUCAO = 'Em execução',
  EM_TESTES = 'Em testes',
  PRONTO = 'Pronto',
  ENTREGUE = 'Entregue',
}

export enum OrdemServicoPrioridade {
  BAIXA = 'Baixa',
  MEDIA = 'Média',
  ALTA = 'Alta',
  URGENTE = 'Urgente',
}

@Index(['companyId', 'numero'], { unique: true })
@Entity('ordens_servico')
@Entity('ordens_servico')
export class OrdemServico {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column()
  companyId!: number;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @Column({ nullable: true })
  clienteId!: number | null;

  @ManyToOne(() => ClienteFornecedor, { nullable: true })
  @JoinColumn({ name: 'clienteId' })
  cliente!: ClienteFornecedor | null;

  @Column({ nullable: true })
  responsavelId!: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'responsavelId' })
  responsavel!: User | null;

  @Column()
  numero!: string;

  @Column()
  titulo!: string;

  @Column({ nullable: true })
  equipamento!: string;

  @Column({ type: 'text', nullable: true })
  defeitoRelatado!: string;

  @Column({ type: 'text', nullable: true })
  diagnosticoTecnico!: string;

  @Column({
    type: 'enum',
    enum: OrdemServicoStatus,
    default: OrdemServicoStatus.RECEBIDO,
  })
  status!: OrdemServicoStatus;

  @Column({
    type: 'enum',
    enum: OrdemServicoPrioridade,
    default: OrdemServicoPrioridade.MEDIA,
  })
  prioridade!: OrdemServicoPrioridade;

  @Column({ type: 'simple-array', nullable: true })
  etiquetas!: string[];

  @Column({ type: 'date', nullable: true })
  dataEntrada!: string | null;

  @Column({ type: 'date', nullable: true })
  dataPrevisao!: string | null;

  @Column({ type: 'date', nullable: true })
  dataEntrega!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorTotal!: number;

  @Column({ nullable: true })
  garantia!: string;

  @Column({ nullable: true })
  mensagemFinal!: string;

  @Column({ type: 'text', nullable: true })
  observacoesInternas!: string;

  @OneToMany(() => OrdemServicoItem, (item) => item.ordemServico, {
    cascade: true,
  })
  itens!: OrdemServicoItem[];

  @OneToMany(() => OrdemServicoAnexo, (anexo) => anexo.ordemServico, {
    cascade: true,
  })
  anexos!: OrdemServicoAnexo[];

  @OneToMany(() => Proposta, (proposta) => proposta.ordemServico)
  propostas!: Proposta[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}