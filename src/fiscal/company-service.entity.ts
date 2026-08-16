import { Company } from 'src/companies/ company.entity';
import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    JoinColumn,
} from 'typeorm';

@Entity('company_fiscal_services')
export class CompanyFiscalService {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    companyUid!: string;

    @ManyToOne(() => Company, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'companyUid', referencedColumnName: 'uid' })
    company!: Company;

    @Column()
    nome!: string;

    @Column()
    cTribNac!: string;

    @Column({ type: 'text', nullable: true })
    cTribNacDescricao: string | undefined;

    @Column()
    cNBS!: string;

    @Column({ type: 'text', nullable: true })
    cNBSDescricao: string | undefined;

    @Column({ type: 'text', nullable: true })
    descricaoServico!: string;

    @Column()
    possuiNaoTributacao!: string;

    @Column({ nullable: true })
    motivoNaoTributacao?: string;

    @Column({ nullable: true })
    tipoImunidade?: string;

    // Campos tributários movidos para o nível de serviço
    @Column({ nullable: true })
    aliquotaIss?: string;

    @Column({ nullable: true })
    percentualTributosSimples?: string;

    @Column({ nullable: true })
    percentualTributosFederal?: string;

    @Column({ nullable: true })
    percentualTributosEstadual?: string;

    @Column({ nullable: true })
    percentualTributosMunicipal?: string;

    @Column({ nullable: true })
    situacaoTributariaPisCofins?: string;

    @Column({ nullable: true })
    aliquotaInssRetido?: string;

    @Column({ nullable: true })
    aliquotaIrRetido?: string;
}