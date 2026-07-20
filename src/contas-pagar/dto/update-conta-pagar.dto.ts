// src/financeiro/contas-pagar/dto/update-conta-pagar.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateContaPagarDto {
  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  fornecedorId?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  ordemServicoId?: number;

  @ApiPropertyOptional({ example: 'Alteração de descrição' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ example: 3500 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  valorOriginal?: number;

  @ApiPropertyOptional({ example: '2026-09-10' })
  @IsOptional()
  @IsDateString()
  dataVencimento?: string;

  @ApiPropertyOptional({ example: '2026-07-15' })
  @IsOptional()
  @IsDateString()
  dataEmissao?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  contaFinanceiraId?: number;
}