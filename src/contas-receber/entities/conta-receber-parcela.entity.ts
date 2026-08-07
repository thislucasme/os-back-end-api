import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ContaReceber } from './conta-receber.entity';
import { Recebimento } from './recebimento.entity';



@Entity('contas_receber_parcelas')
export class ContaReceberParcela {


  @PrimaryGeneratedColumn()
  id!: number;



  @Column({
    name: 'conta_receber_id'
  })
  contaReceberId!: number;



  @ManyToOne(
    () => ContaReceber,
    conta => conta.parcelas,
    {
      onDelete: 'CASCADE'
    }
  )
  @JoinColumn({
    name: 'conta_receber_id'
  })
  contaReceber!: ContaReceber;




  @Column()
  numero!: number;




  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2
  })
  valor!: number;




  @Column({
    type: 'date'
  })
  vencimento!: string;




  @Column({
    default: false
  })
  paga!: boolean;




  @OneToMany(
    () => Recebimento,
    recebimento => recebimento.parcela
  )
  recebimentos!: Recebimento[];




  @CreateDateColumn({
    name: 'created_at'
  })
  createdAt!: Date;

  @Column({
    name: 'asaas_payment_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  asaasPaymentId?: string | null;

  @Column({
    name: 'boleto_url',
    type: 'text',
    nullable: true,
  })
  boletoUrl?: string | null;

}