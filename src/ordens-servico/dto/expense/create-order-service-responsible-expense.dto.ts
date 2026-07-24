import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOrderServiceResponsibleExpenseDto {
  @IsInt()
  @Min(1)
  expenseTypeId!: number;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  assignToOrderService: boolean = true;
}