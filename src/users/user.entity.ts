
import { Company } from 'src/companies/ company.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name!: string | null;

  @Column({ type: 'int', nullable: true })
  companyId!: number | null;

  @ManyToOne(() => Company, (company) => company.users, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'companyId' })
  company!: Company | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cpf!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  rg!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  whatsapp!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  position!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  registrationNumber!: string | null;

  @Column({ type: 'date', nullable: true })
  birthDate!: Date | null;

  @Column({ type: 'date', nullable: true })
  admissionDate!: Date | null;

  @Column({ type: 'date', nullable: true })
  resignationDate!: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city!: string | null;

  @Column({ type: 'varchar', length: 2, nullable: true })
  state!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  zipCode!: string | null;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ type: 'text', nullable: true })
  observations!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salarioBase!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}