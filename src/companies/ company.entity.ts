import { ClienteFornecedor } from 'src/clientes-fornecedores/entities/cliente-fornecedor.entity';
import { User } from 'src/users/user.entity';
import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToMany(() => User, (user) => user.company)
  users!: User[];

  @OneToMany(
    () => ClienteFornecedor,
    (clienteFornecedor) => clienteFornecedor.company,
  )
  clientesFornecedores!: ClienteFornecedor[];

  @Column()
  name!: string;

  @Column({ nullable: true })
  corporateName!: string;

  @Column({ nullable: true })
  cnpj!: string;

  @Column({ nullable: true })
  companyEmail!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  whatsapp!: string;

  @Column({ nullable: true })
  instagram!: string;

  @Column({ nullable: true })
  website!: string;

  @Column({ nullable: true })
  address!: string;

  @Column({ nullable: true })
  city!: string;

  @Column({ nullable: true })
  state!: string;

  @Column({ nullable: true })
  zipCode!: string;

  @Column({ type: 'text', nullable: true })
  observations!: string;

  @Column({ nullable: true })
  logoUrl!: string;
}