// folha-pagamento.entity.ts
import { User } from 'src/users/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';


export enum FolhaStatus {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  CANCELADO = 'CANCELADO',
}

@Entity('folha_pagamento')
export class FolhaPagamento {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  usuarioId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuarioId' })
  usuario!: User;

  @Column({ type: 'int' })
  mes!: number;

  @Column({ type: 'int' })
  ano!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salarioBase!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  comissaoTotal!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  descontos!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalLiquido!: number;

  @Column({ type: 'enum', enum: FolhaStatus, default: FolhaStatus.PENDENTE })
  status!: FolhaStatus;

  @Column({ type: 'timestamp', nullable: true })
  dataUltimaLiberacao!: Date | null;

  @Column({ type: 'text', nullable: true })
  observacoes!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}