import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemOsDto {
  @IsNumber()
  ordemServicoId!: number;

  @IsNumber()
  produtoServicoId!: number;

  @IsString()
  @IsOptional()
  nome?: string;

  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  valor!: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  responsavelId?: number | null;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  comissao!: number;
}