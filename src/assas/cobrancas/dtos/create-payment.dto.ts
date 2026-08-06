import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsBoolean, IsOptional, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

class DiscountDto {
  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  dueDateLimitDays?: number;

  @ApiPropertyOptional({ example: 'PERCENTAGE' })
  @IsOptional()
  @IsString()
  type?: 'PERCENTAGE' | 'FIXED';
}

class InterestDto {
  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsNumber()
  value?: number | null;
}

class FineDto {
  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsNumber()
  value?: number | null;

  @ApiPropertyOptional({ example: 'FIXED' })
  @IsOptional()
  @IsString()
  type?: 'FIXED' | 'PERCENTAGE';
}

class SplitDto {
  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsString()
  walletId?: string | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsNumber()
  fixedValue?: number | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsNumber()
  percentualValue?: number | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsNumber()
  totalFixedValue?: number | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsString()
  externalReference?: string | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsString()
  description?: string | null;
}

class CallbackDto {
  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsString()
  successUrl?: string | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsBoolean()
  autoRedirect?: boolean | null;
}

export class CreatePaymentDto {
  @ApiProperty({ example: 'cus_G7Dvo4iphUNk' })
  @IsString()
  customer!: string;

  @ApiProperty({ example: 'BOLETO', enum: ['BOLETO', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD'] })
  @IsString()
  billingType!: string;

  @ApiProperty({ example: 129.9 })
  @IsNumber()
  value!: number;

  @ApiProperty({ example: '2017-06-10' })
  @IsDateString()
  dueDate!: string;

  @ApiPropertyOptional({ example: 'Pedido 056984' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  daysAfterDueDateToRegistrationCancellation?: number;

  @ApiPropertyOptional({ example: '056984' })
  @IsOptional()
  @IsString()
  externalReference?: string;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsNumber()
  installmentCount?: number | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsNumber()
  totalValue?: number | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsNumber()
  installmentValue?: number | null;

  @ApiPropertyOptional({ type: DiscountDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DiscountDto)
  discount?: DiscountDto;

  @ApiPropertyOptional({ type: InterestDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => InterestDto)
  interest?: InterestDto;

  @ApiPropertyOptional({ type: FineDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FineDto)
  fine?: FineDto;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  postalService?: boolean;

  @ApiPropertyOptional({ type: [SplitDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SplitDto)
  split?: SplitDto[];

  @ApiPropertyOptional({ type: CallbackDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CallbackDto)
  callback?: CallbackDto;

  @ApiPropertyOptional({ example: '89060430-aceb-447c-a981-07ee15daf00c' })
  @IsOptional()
  @IsUUID()
  pixAutomaticAuthorizationId?: string;
}