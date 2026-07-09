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

export class CreateContaPagarDto {
  @ApiProperty({
    example: 'Fornecedor ABC',
    description: 'Nome do fornecedor ou responsável pela conta.',
  })
  @IsString()
  @IsNotEmpty()
  fornecedorNome!: string;

  @ApiPropertyOptional({
    example: '12345678000199',
    description: 'CPF ou CNPJ do fornecedor.',
  })
  @IsOptional()
  @IsString()
  fornecedorDocumento?: string;

  @ApiPropertyOptional({
    example: 'Compra de materiais para escritório.',
    description: 'Descrição da conta a pagar.',
  })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({
    example: 500,
    description: 'Valor original da conta a pagar.',
  })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  valorOriginal!: number;

  @ApiProperty({
    example: '2026-06-30',
    description: 'Data de vencimento da conta.',
  })
  @IsDateString()
  dataVencimento!: string;

  @ApiPropertyOptional({
    example: '2026-06-25',
    description: 'Data de emissão da conta.',
  })
  @IsOptional()
  @IsDateString()
  dataEmissao?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID da conta financeira padrão para pagamento.',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  contaFinanceiraId?: number;
}