
import { Company } from 'src/companies/ company.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';

@Entity('certificates') 
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  certificadoPfxCriptografado?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  certificadoSenhaCriptografada?: string;

@Column({ type: 'int' })
  companyId!: number;

  @OneToOne(() => Company, (company) => company.certificate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId', referencedColumnName: 'id' })
  company!: Company;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}