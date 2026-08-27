import { Company } from 'src/companies/ company.entity';
import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';

@Entity('company_fiscal_settings')
export class CompanyFiscalSettings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true })
  companyUid!: string;


@Column({ type: 'uuid', nullable: true })
  nfseEmitenteUid?: string;

  @OneToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyUid', referencedColumnName: 'uid' })
  company!: Company;

  @Column({ nullable: true })
  opcaoSimplesNacional?: string;

  @Column({ nullable: true })
  regimeApuracaoSimplesNacional?: string;

  @Column({ nullable: true })
  regimeEspecialTributacao?: string;

  @Column({ nullable: true })
  inscricaoMunicipal?: string;

  @Column({ nullable: true })
  codigoMunicipio?: string;

  @Column({ nullable: true })
  municipioNome?: string;

  @Column({ nullable: true })
  ambiente?: string;

  @Column({ nullable: true })
  serieDps?: string;

  @Column({ nullable: true })
  serie?: string;
}