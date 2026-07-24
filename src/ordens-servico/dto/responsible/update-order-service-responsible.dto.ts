import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { CommissionType } from 'src/ordens-servico/entities/order-service-responsible.entity';

export class UpdateOrderServiceResponsibleDto {
  @IsOptional()
  @IsEnum(CommissionType)
  productCommissionType?: CommissionType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  productCommissionValue?: number;

  @IsOptional()
  @IsEnum(CommissionType)
  serviceCommissionType?: CommissionType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  serviceCommissionValue?: number;
}