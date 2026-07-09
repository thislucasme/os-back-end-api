// dto/find-conta-financeira.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { TipoContaFinanceira } from '../enums/tipo-conta-financeira.enum';

export class FindContaFinanceiraDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  ativa?: boolean;

  @ApiPropertyOptional({
    enum: TipoContaFinanceira,
  })
  @IsOptional()
  @IsEnum(TipoContaFinanceira)
  tipo?: TipoContaFinanceira;
}