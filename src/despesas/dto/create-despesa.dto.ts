import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateDespesaDto {
  @ApiProperty({
    example: 1,
    description: 'ID da conta financeira de onde o dinheiro vai sair.',
  })
  @IsNumber()
  @Type(() => Number)
  contaFinanceiraId!: number;

  @ApiProperty({
    example: 'Compra de materiais de limpeza',
  })
  @IsString()
  @IsNotEmpty()
  descricao!: string;

  @ApiPropertyOptional({
    example: 'Limpeza',
  })
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiProperty({
    example: 85.5,
    description: 'Valor da despesa.',
  })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  valor!: number;

  @ApiPropertyOptional({
    example: '2026-06-26',
    description: 'Data da despesa. Se não informar, usa a data atual.',
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