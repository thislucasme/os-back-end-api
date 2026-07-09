import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class PagarContaDto {
  @ApiProperty({
    example: 150,
    description: 'Valor pago. Pode ser parcial ou total.',
  })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  valor!: number;

  @ApiPropertyOptional({
    example: '2026-06-25',
    description: 'Data em que o pagamento foi realizado.',
  })
  @IsOptional()
  @IsDateString()
  dataPagamento?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID da conta financeira de onde o valor saiu.',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  contaFinanceiraId?: number;

  @ApiPropertyOptional({
    example: 'PIX',
    description: 'Forma de pagamento utilizada.',
  })
  @IsOptional()
  @IsString()
  formaPagamento?: string;

  @ApiPropertyOptional({
    example: 'Pagamento parcial da conta.',
  })
  @IsOptional()
  @IsString()
  observacao?: string;
}