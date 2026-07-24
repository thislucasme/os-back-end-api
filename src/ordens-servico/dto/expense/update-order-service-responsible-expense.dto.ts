import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateOrderServiceResponsibleExpenseDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  expenseTypeId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  assignToOrderService?: boolean;
}