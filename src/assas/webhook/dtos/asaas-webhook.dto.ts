import { IsString, IsNumber, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AccountDto {
  @ApiPropertyOptional({ example: '5f2f76ed-36e8-4c63-93e1-969774f67bdf', nullable: true })
  @IsOptional()
  @IsString()
  id?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  ownerId?: string | null;
}

class DiscountDto {
  @ApiPropertyOptional({ example: 0.0, nullable: true })
  @IsOptional()
  @IsNumber()
  value?: number | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  limitDate?: string | null;

  @ApiPropertyOptional({ example: 0, nullable: true })
  @IsOptional()
  @IsNumber()
  dueDateLimitDays?: number | null;

  @ApiPropertyOptional({ example: 'FIXED', nullable: true })
  @IsOptional()
  @IsString()
  type?: string | null;
}

class FineDto {
  @ApiPropertyOptional({ example: 10.0, nullable: true })
  @IsOptional()
  @IsNumber()
  value?: number | null;

  @ApiPropertyOptional({ example: 'FIXED', nullable: true })
  @IsOptional()
  @IsString()
  type?: string | null;
}

class InterestDto {
  @ApiPropertyOptional({ example: 1.0, nullable: true })
  @IsOptional()
  @IsNumber()
  value?: number | null;

  @ApiPropertyOptional({ example: 'PERCENTAGE', nullable: true })
  @IsOptional()
  @IsString()
  type?: string | null;
}

export class PaymentDto {
  @ApiPropertyOptional({ example: 'payment', nullable: true })
  @IsOptional()
  @IsString()
  object?: string;

  @ApiPropertyOptional({ example: 'pay_xjnxx4bosq4eswom', nullable: true })
  @IsOptional()
  @IsString()
  id!: string | null;

  @ApiPropertyOptional({ example: '2026-08-06', nullable: true })
  @IsOptional()
  @IsString()
  dateCreated?: string | null;

  @ApiPropertyOptional({ example: 'cus_000008587878', nullable: true })
  @IsOptional()
  @IsString()
  customer?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  checkoutSession?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  paymentLink?: string | null;

  @ApiPropertyOptional({ example: 15015.0, nullable: true })
  @IsOptional()
  @IsNumber()
  value?: number | null;

  @ApiPropertyOptional({ example: 15014.01, nullable: true })
  @IsOptional()
  @IsNumber()
  netValue?: number | null;

  @ApiPropertyOptional({ example: 15000.0, nullable: true })
  @IsOptional()
  @IsNumber()
  originalValue?: number | null;

  @ApiPropertyOptional({ example: 15.0, nullable: true })
  @IsOptional()
  @IsNumber()
  interestValue?: number | null;

  @ApiPropertyOptional({ example: 'Custos da os undefined - Parcela 1/2', nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ example: 'BOLETO', nullable: true })
  @IsOptional()
  @IsString()
  billingType?: string | null;

  @ApiPropertyOptional({ example: true, nullable: true })
  @IsOptional()
  @IsBoolean()
  canBePaidAfterDueDate?: boolean | null;

  @ApiPropertyOptional({ example: '2026-08-07', nullable: true })
  @IsOptional()
  @IsString()
  confirmedDate?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  pixTransaction?: any | null;

  @ApiPropertyOptional({ example: 'RECEIVED', nullable: true })
  @IsOptional()
  @IsString()
  status?: string | null;

  @ApiPropertyOptional({ example: '2026-08-06', nullable: true })
  @IsOptional()
  @IsString()
  dueDate?: string | null;

  @ApiPropertyOptional({ example: '2026-08-06', nullable: true })
  @IsOptional()
  @IsString()
  originalDueDate?: string | null;

  @ApiPropertyOptional({ example: '2026-08-07', nullable: true })
  @IsOptional()
  @IsString()
  paymentDate?: string | null;

  @ApiPropertyOptional({ example: '2026-08-07', nullable: true })
  @IsOptional()
  @IsString()
  clientPaymentDate?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @IsNumber()
  installmentNumber?: number | null;

  @ApiPropertyOptional({ example: 'https://sandbox.asaas.com/i/xjnxx4bosq4eswom', nullable: true })
  @IsOptional()
  @IsString()
  invoiceUrl?: string | null;

  @ApiPropertyOptional({ example: '16423710', nullable: true })
  @IsOptional()
  @IsString()
  invoiceNumber?: string | null;

  @ApiPropertyOptional({ example: 'conta-12-parcela-1', nullable: true })
  @IsOptional()
  @IsString()
  externalReference?: string | null;

  @ApiPropertyOptional({ example: false, nullable: true })
  @IsOptional()
  @IsBoolean()
  deleted?: boolean | null;

  @ApiPropertyOptional({ example: false, nullable: true })
  @IsOptional()
  @IsBoolean()
  anticipated?: boolean | null;

  @ApiPropertyOptional({ example: false, nullable: true })
  @IsOptional()
  @IsBoolean()
  anticipable?: boolean | null;

  @ApiPropertyOptional({ example: '2026-08-07', nullable: true })
  @IsOptional()
  @IsString()
  creditDate?: string | null;

  @ApiPropertyOptional({ example: '2026-08-07', nullable: true })
  @IsOptional()
  @IsString()
  estimatedCreditDate?: string | null;

  @ApiPropertyOptional({ example: 'https://sandbox.asaas.com/comprovantes/...', nullable: true })
  @IsOptional()
  @IsString()
  transactionReceiptUrl?: string | null;

  @ApiPropertyOptional({ example: '12884673', nullable: true })
  @IsOptional()
  @IsString()
  nossoNumero?: string | null;

  @ApiPropertyOptional({ example: 'https://sandbox.asaas.com/b/pdf/...', nullable: true })
  @IsOptional()
  @IsString()
  bankSlipUrl?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @IsString()
  lastInvoiceViewedDate?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @IsString()
  lastBankSlipViewedDate?: string | null;

  @ApiPropertyOptional({ type: () => DiscountDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => DiscountDto)
  discount?: DiscountDto | null;

  @ApiPropertyOptional({ type: () => FineDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => FineDto)
  fine?: FineDto | null;

  @ApiPropertyOptional({ type: () => InterestDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => InterestDto)
  interest?: InterestDto | null;

  @ApiPropertyOptional({ example: false, nullable: true })
  @IsOptional()
  @IsBoolean()
  postalService?: boolean | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  escrow?: any | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  refunds?: any | null;
}

export class AsaasWebhookDto {
  @ApiPropertyOptional({ example: 'evt_d26e303b238e509335ac9ba210e51b0f&17840498', nullable: true })
  @IsOptional()
  @IsString()
  id?: string | null;

  @ApiPropertyOptional({ example: 'PAYMENT_RECEIVED', nullable: true })
  @IsOptional()
  @IsString()
  event?: string | null;

  @ApiPropertyOptional({ example: '2026-08-07 11:25:07', nullable: true })
  @IsOptional()
  @IsString()
  dateCreated?: string | null;

  @ApiPropertyOptional({ type: () => AccountDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => AccountDto)
  account?: AccountDto | null;

  @ApiPropertyOptional({ type: () => PaymentDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentDto)
  payment?: PaymentDto | null;
}