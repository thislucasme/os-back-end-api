// src/ordens-servico/entities/ordem-servico-anexo.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrdemServico } from './ordem-servico.entity';

export enum OrdemServicoAnexoTipo {
  IMAGEM = 'IMAGEM',
  PDF = 'PDF',
  OUTRO = 'OUTRO',
}

@Entity('ordens_servico_anexos')
export class OrdemServicoAnexo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  ordemServicoId!: number;

  @ManyToOne(() => OrdemServico, (os) => os.anexos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ordemServicoId' })
  ordemServico!: OrdemServico;

  @Column()
  url!: string;

  @Column()
  filename!: string;

  @Column({ nullable: true })
  originalName!: string;

  @Column({ nullable: true })
  mimeType!: string;

  @Column({
    type: 'enum',
    enum: OrdemServicoAnexoTipo,
    default: OrdemServicoAnexoTipo.IMAGEM,
  })
  tipo!: OrdemServicoAnexoTipo;

  @CreateDateColumn()
  createdAt!: Date;
}