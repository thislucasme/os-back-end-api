import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('nbs_servicos')
export class NbsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, name: 'codigo_nbs' })
  codigoNbs!: string;

  @Column({ type: 'text' })
  descricao!: string;
}