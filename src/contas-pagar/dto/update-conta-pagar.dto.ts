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
import { StatusContaPagar } from '../entities/conta-pagar.entity';

export class UpdateContaPagarDto {
  @ApiPropertyOptional({
    example: 'Fornecedor ABC',
  })
  @IsOptional()
  @IsString()
  fornecedorNome?: string;

  @ApiPropertyOptional({
    example: '12345678000199',
  })
  @IsOptional()
  @IsString()
  fornecedorDocumento?: string;

  @ApiPropertyOptional({
    example: 'Atualização da descrição da conta.',
  })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({
    example: 750,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  valorOriginal?: number;

  @ApiPropertyOptional({
    example: '2026-07-10',
  })
  @IsOptional()
  @IsDateString()
  dataVencimento?: string;

  @ApiPropertyOptional({
    example: '2026-06-25',
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

  @ApiPropertyOptional({
    enum: StatusContaPagar,
    example: StatusContaPagar.ABERTA,
  })
  @IsOptional()
  @IsEnum(StatusContaPagar)
  status?: StatusContaPagar;
}