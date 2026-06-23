
import { Company } from 'src/companies/ company.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TipoCadastro {
  CLIENTE = 'CLIENTE',
  FORNECEDOR = 'FORNECEDOR',
}

export enum TipoPessoa {
  PF = 'PF',
  PJ = 'PJ',
}

@Entity('clientes_fornecedores')
export class ClienteFornecedor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  companyId!: number;

  @ManyToOne(() => Company, (company) => company.clientesFornecedores, {
    onDelete: 'CASCADE',
  })
  company!: Company;

  @Column({
    type: 'enum',
    enum: TipoCadastro,
    default: TipoCadastro.CLIENTE,
  })
  tipoCadastro!: TipoCadastro;

  @Column({
    type: 'enum',
    enum: TipoPessoa,
    default: TipoPessoa.PF,
  })
  tipoPessoa!: TipoPessoa;

  @Column()
  nome!: string;

  @Column()
  documento!: string;

  @Column({ nullable: true })
  telefone!: string;

  @Column({ nullable: true })
  whatsapp!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ nullable: true })
  endereco!: string;

  @Column({ type: 'text', nullable: true })
  observacoes!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}