import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TipoContaFinanceira } from '../enums/tipo-conta-financeira.enum';

export class CreateContaFinanceiraDto {
  @ApiProperty({
    example: 'Sicredi Principal',
  })
  @IsString()
  @MaxLength(255)
  nome!: string;

  @ApiProperty({
    example: 'Sicredi',
    required: false,
  })
  @IsOptional()
  @IsString()
  banco?: string;

  @ApiProperty({
    example: '1234',
    required: false,
  })
  @IsOptional()
  @IsString()
  agencia?: string;

  @ApiProperty({
    example: '12345-6',
    required: false,
  })
  @IsOptional()
  @IsString()
  conta?: string;

  @ApiProperty({
    enum: TipoContaFinanceira,
    example: TipoContaFinanceira.CORRENTE,
  })
  @IsEnum(TipoContaFinanceira)
  tipo!: TipoContaFinanceira;

  @ApiProperty({
    example: 5000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  saldoInicial?: number;

  @ApiProperty({
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  ativa?: boolean;
}