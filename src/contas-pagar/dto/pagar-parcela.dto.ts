// src/financeiro/contas-pagar/dto/pagar-parcela.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class PagarParcelaDto {
  @ApiProperty({
    example: 1000,
    description: 'Valor pago da parcela.',
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  valor!: number;

  @ApiPropertyOptional({
    example: '2026-08-10',
    description: 'Data do pagamento.',
  })
  @IsOptional()
  @IsDateString()
  dataPagamento?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Conta financeira que realizou o pagamento.',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  contaFinanceiraId?: number;

  @ApiPropertyOptional({
    example: 'PIX',
  })
  @IsOptional()
  @IsString()
  formaPagamento?: string;

  @ApiPropertyOptional({
    example: 'Pagamento referente à primeira parcela.',
  })
  @IsOptional()
  @IsString()
  observacao?: string;
}