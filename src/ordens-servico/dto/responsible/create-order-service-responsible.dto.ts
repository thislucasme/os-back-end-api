import { IsEnum, IsInt, IsNumber, Min } from 'class-validator';
import { CommissionType } from 'src/ordens-servico/entities/order-service-responsible.entity';

export class CreateOrderServiceResponsibleDto {
  @IsInt()
  @Min(1)
  employeeId!: number;

  @IsEnum(CommissionType)
  productCommissionType: CommissionType = CommissionType.PERCENTAGE;

  @IsNumber()
  @Min(0)
  productCommissionValue: number = 0;

  @IsEnum(CommissionType)
  serviceCommissionType: CommissionType = CommissionType.PERCENTAGE;

  @IsNumber()
  @Min(0)
  serviceCommissionValue: number = 0;
}