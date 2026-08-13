import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ItemOsLiberacao } from 'src/ordens-servico/entities/item-os.entity';

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

  @IsOptional()
  @IsEnum(ItemOsLiberacao)
  liberacao?: ItemOsLiberacao = ItemOsLiberacao.NA_CONCLUSAO_OS;
}