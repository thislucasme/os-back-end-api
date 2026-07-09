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

export class CreateContaReceberDto {
  @ApiProperty({
    example: 'João da Silva',
    description: 'Nome do cliente ou responsável pela conta a receber.',
  })
  @IsString()
  @IsNotEmpty()
  clienteNome!: string;

  @ApiPropertyOptional({
    example: '12345678900',
    description: 'CPF ou CNPJ do cliente.',
  })
  @IsOptional()
  @IsString()
  clienteDocumento?: string;

  @ApiPropertyOptional({
    example: 'Venda de produto ou prestação de serviço.',
    description: 'Descrição da conta a receber.',
  })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({
    example: 350.75,
    description: 'Valor original da conta a receber.',
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
    description: 'ID da conta financeira vinculada ao recebimento.',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  contaFinanceiraId?: number;
}