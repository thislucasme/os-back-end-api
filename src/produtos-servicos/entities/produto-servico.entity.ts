
import { Company } from 'src/companies/ company.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TipoItem {
  PRODUTO = 'PRODUTO',
  SERVICO = 'SERVICO',
}

export enum CondicaoItem {
  NOVO = 'NOVO',
  USADO = 'USADO',
  RECONDICIONADO = 'RECONDICIONADO',
  NAO_APLICAVEL = 'NAO_APLICAVEL',
}

export enum UnidadeMedida {
  UN = 'UN',
  KG = 'KG',
  M = 'M',
  L = 'L',
  HORA = 'HORA',
  SERVICO = 'SERVICO',
}

@Entity('produtos_servicos')
export class ProdutoServico {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  companyId!: number;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @Column({
    type: 'enum',
    enum: TipoItem,
    default: TipoItem.PRODUTO,
  })
  tipo!: TipoItem;

  @Column()
  nome!: string;

  @Column({ nullable: true })
  sku!: string;

  @Column({ nullable: true })
  marca!: string;

  @Column({ nullable: true })
  categoria!: string;

  @Column({
    type: 'enum',
    enum: CondicaoItem,
    default: CondicaoItem.NOVO,
  })
  condicao!: CondicaoItem;

  @Column({
    type: 'enum',
    enum: UnidadeMedida,
    default: UnidadeMedida.UN,
  })
  unidade!: UnidadeMedida;

  @Column({ type: 'text', nullable: true })
  descricao!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  estoqueMinimo!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  estoqueMaximo!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  saldoInicial!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  quantidade!: number;

  @Column({ nullable: true })
  deposito!: string;

  @Column({ nullable: true })
  localizacao!: string;

  @Column({ nullable: true })
  fornecedor!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precoCompraUnitario!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  custoCompraUnitario!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precoVenda!: number;

  @Column({ type: 'text', nullable: true })
  observacoes!: string;

  @Column({ default: true })
  ativo!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}