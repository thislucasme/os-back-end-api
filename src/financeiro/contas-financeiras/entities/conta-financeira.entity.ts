import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ValueTransformer,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoContaFinanceira } from '../enums/tipo-conta-financeira.enum';
import { Company } from 'src/companies/ company.entity';


const decimalTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | number | null) => {
    if (value === null || value === undefined) {
      return 0;
    }

    return Number(value);
  },
};

@Entity('contas_financeiras')
export class ContaFinanceira {
  @ApiProperty({
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({
    example: 1,
  })
  @Column({
    type: 'int',
  })
  companyId!: number;

  @ManyToOne(() => Company)
  company!: Company;

  @ApiProperty({
    example: 'Banco Inter',
  })
  @Column({
    type: 'varchar',
    length: 255,
  })
  nome!: string;

  @ApiPropertyOptional({
    example: 'Inter',
  })
  @Column({
    type: 'varchar',
    nullable: true,
    length: 255,
  })
  banco?: string | null;

  @ApiPropertyOptional({
    example: '0001',
  })
  @Column({
    type: 'varchar',
    nullable: true,
    length: 20,
  })
  agencia?: string | null;

  @ApiPropertyOptional({
    example: '123456-7',
  })
  @Column({
    type: 'varchar',
    nullable: true,
    length: 30,
  })
  conta?: string | null;

  @ApiProperty({
    enum: TipoContaFinanceira,
    example: TipoContaFinanceira.CORRENTE,
  })
  @Column({
    type: 'enum',
    enum: TipoContaFinanceira,
    default: TipoContaFinanceira.CORRENTE,
  })
  tipo!: TipoContaFinanceira;

  @ApiProperty({
    example: 1000,
    description: 'Saldo inicial informado na criação da conta.',
  })
  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  saldoInicial!: number;

  @ApiProperty({
    example: 1000,
    description: 'Saldo atual da conta financeira.',
  })
  @Column({
    name: 'saldo_atual',
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  saldoAtual!: number;

  @ApiProperty({
    example: true,
  })
  @Column({
    type: 'boolean',
    default: true,
  })
  ativa!: boolean;

  @ApiProperty({
    example: '2026-06-26T10:30:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-06-26T10:30:00.000Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}