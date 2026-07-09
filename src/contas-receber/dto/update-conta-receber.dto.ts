import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { StatusContaReceber } from '../entities/conta-receber.entity';

export class UpdateContaReceberDto {
  @ApiPropertyOptional({
    example: 'João da Silva',
    description: 'Nome do cliente ou responsável pela conta a receber.',
  })
  @IsOptional()
  @IsString()
  clienteNome?: string;

  @ApiPropertyOptional({
    example: '12345678900',
    description: 'CPF ou CNPJ do cliente.',
  })
  @IsOptional()
  @IsString()
  clienteDocumento?: string;

  @ApiPropertyOptional({
    example: 'Atualização da descrição da conta.',
    description: 'Descrição da conta a receber.',
  })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({
    example: 500,
    description: 'Valor original da conta a receber.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  valorOriginal?: number;

  @ApiPropertyOptional({
    example: '2026-07-10',
    description: 'Data de vencimento da conta.',
  })
  @IsOptional()
  @IsDateString()
  dataVencimento?: string;

  @ApiPropertyOptional({
    example: '2026-06-25',
    description: 'Data de emissão da conta.',
  })
  @IsOptional()
  @IsDateString()
  dataEmissao?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID da conta financeira vinculada.',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  contaFinanceiraId?: number;

  @ApiPropertyOptional({
    enum: StatusContaReceber,
    example: StatusContaReceber.ABERTA,
    description: 'Status da conta a receber.',
  })
  @IsOptional()
  @IsEnum(StatusContaReceber)
  status?: StatusContaReceber;
}