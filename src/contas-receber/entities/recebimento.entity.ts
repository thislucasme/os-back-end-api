import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  ValueTransformer,
} from 'typeorm';


import { ContaReceberParcela } from './conta-receber-parcela.entity';

import { ContaFinanceira } from 'src/financeiro/contas-financeiras/entities/conta-financeira.entity';



const decimalTransformer: ValueTransformer = {

  to:(value?:number|null)=>value,

  from:(value?:string|number|null)=>{

    if(value===null || value===undefined){
      return 0;
    }

    return Number(value);

  }

};



@Entity('recebimentos')
export class Recebimento {


  @PrimaryGeneratedColumn()
  id!: number;



  @Column({
    name:'company_id'
  })
  companyId!: number;




  /**
   * PARCELA RECEBIDA
   */
  @Column({
    name:'parcela_id'
  })
  parcelaId!: number;




  @ManyToOne(
    ()=>ContaReceberParcela,
    parcela=>parcela.recebimentos,
    {
      onDelete:'CASCADE'
    }
  )
  @JoinColumn({
    name:'parcela_id'
  })
  parcela!: ContaReceberParcela;





  @Column({
    name:'conta_financeira_id',
    nullable:true
  })
  contaFinanceiraId?: number | null;




  @ManyToOne(
    ()=>ContaFinanceira,
    {
      nullable:true,
      onDelete:'SET NULL'
    }
  )
  @JoinColumn({
    name:'conta_financeira_id'
  })
  contaFinanceira?: ContaFinanceira | null;





  @Column({
    type:'decimal',
    precision:15,
    scale:2,
    transformer:decimalTransformer
  })
  valor!: number;




  @Column({
    type:'date'
  })
  dataRecebimento!: string;




  @Column({
    type:'varchar',
    length:50,
    nullable:true
  })
  formaPagamento?: string | null;





  @Column({
    type:'varchar',
    length:255,
    nullable:true
  })
  observacao?: string | null;




  @CreateDateColumn({
    name:'created_at'
  })
  createdAt!: Date;


}