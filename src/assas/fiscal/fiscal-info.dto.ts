import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FiscalInfoQueryDto {
  @ApiPropertyOptional({ description: 'Posição inicial da listagem (paginação)', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ description: 'Quantidade máxima de registros retornados (máx: 100)', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'Filtro por código ou descrição (legado)', example: 'desenvolvimento' })
  @IsOptional()
  @IsString()
  codeDescription?: string;

  @ApiPropertyOptional({ description: 'Filtro por descrição', example: 'engenharia' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Filtro por código exato', example: '070101' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Termo genérico de busca (código ou texto)', example: '070101' })
  @IsOptional()
  @IsString()
  termo?: string;
}

export class FiscalInfoItemDto {
  @ApiProperty({ example: '115022000' })
  id?: string;

  @ApiProperty({ example: '115022000 - Serviços de desenvolvimento de software' })
  description?: string;
}

export class FiscalInfoResponseDto {
  @ApiProperty({ example: 'list' })
  object?: string;

  @ApiProperty({ example: false })
  hasMore?: boolean;

  @ApiProperty({ example: 1 })
  totalCount?: number;

  @ApiProperty({ type: [FiscalInfoItemDto] })
  data?: FiscalInfoItemDto[];
}