import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ListOrderServiceResponsibleDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string; // busca pelo nome do funcionário
}