import { IsOptional, IsInt, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ListOrderServiceResponsibleExpenseDto {
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
  @IsBoolean()
  assignToOrderService?: boolean;
}