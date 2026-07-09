import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTransferenciaDto {
  @ApiProperty({
    example: 1,
    description: 'ID da conta financeira de origem.',
  })
  @IsNumber()
  @Type(() => Number)
  contaOrigemId!: number;

  @ApiProperty({
    example: 2,
    description: 'ID da conta financeira de destino.',
  })
  @IsNumber()
  @Type(() => Number)
  contaDestinoId!: number;

  @ApiProperty({
    example: 300,
    description: 'Valor da transferência.',
  })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  valor!: number;

  @ApiPropertyOptional({
    example: '2026-06-26',
    description: 'Data da transferência. Se não informar, usa a data atual.',
  })
  @IsOptional()
  @IsDateString()
  dataTransferencia?: string;

  @ApiPropertyOptional({
    example: 'Transferência do caixa para o banco.',
    description: 'Descrição ou observação da transferência.',
  })
  @IsOptional()
  @IsString()
  descricao?: string;
}