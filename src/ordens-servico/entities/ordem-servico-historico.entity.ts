import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrdemServico } from './ordem-servico.entity';

@Entity('ordens_servico_historicos')
export class OrdemServicoHistorico {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  ordemServicoId!: number;

  @ManyToOne(() => OrdemServico, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ordemServicoId' })
  ordemServico!: OrdemServico;

  @Column({ nullable: true })
  userId!: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user!: User | null;

  @Column()
  acao!: string;

  @Column({ type: 'text', nullable: true })
  descricao!: string;

  @CreateDateColumn()
  createdAt!: Date;
}