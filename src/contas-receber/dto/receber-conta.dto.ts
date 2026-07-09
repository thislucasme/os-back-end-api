import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ReceberContaDto {
  @ApiProperty({
    example: 150,
    description: 'Valor recebido. Pode ser parcial ou total.',
  })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  valor!: number;

  @ApiPropertyOptional({
    example: '2026-06-25',
    description: 'Data em que o valor foi recebido.',
  })
  @IsOptional()
  @IsDateString()
  dataRecebimento?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID da conta financeira onde o valor entrou.',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  contaFinanceiraId?: number;

  @ApiPropertyOptional({
    example: 'PIX',
    description: 'Forma de pagamento utilizada no recebimento.',
  })
  @IsOptional()
  @IsString()
  formaPagamento?: string;

  @ApiPropertyOptional({
    example: 'Recebimento parcial da parcela.',
    description: 'Observação sobre o recebimento.',
  })
  @IsOptional()
  @IsString()
  observacao?: string;
}