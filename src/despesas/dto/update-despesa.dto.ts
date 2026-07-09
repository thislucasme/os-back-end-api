import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateDespesaDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'ID da conta financeira.',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  contaFinanceiraId?: number;

  @ApiPropertyOptional({
    example: 'Compra de materiais de limpeza',
  })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({
    example: 'Limpeza',
  })
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional({
    example: 85.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  valor?: number;

  @ApiPropertyOptional({
    example: '2026-06-26',
  })
  @IsOptional()
  @IsDateString()
  dataDespesa?: string;

  @ApiPropertyOptional({
    example: 'PIX',
  })
  @IsOptional()
  @IsString()
  formaPagamento?: string;

  @ApiPropertyOptional({
    example: 'Compra feita no mercado.',
  })
  @IsOptional()
  @IsString()
  observacao?: string;
}