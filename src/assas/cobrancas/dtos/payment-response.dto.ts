import { ApiProperty } from "@nestjs/swagger";

export class PaymentResponseDto {
  @ApiProperty()
  object?: string;

  @ApiProperty()
  id?: string;

  @ApiProperty()
  customer?: string;

  @ApiProperty()
  billingType?: string;

  @ApiProperty()
  value?: number;

  @ApiProperty()
  dueDate?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  externalReference?: string;

  @ApiProperty()
  installmentCount?: number;

  @ApiProperty()
  installmentValue?: number;

  @ApiProperty()
  totalValue?: number;

  @ApiProperty()
  status?: string;

  @ApiProperty()
  transactionReceiptUrl?: string;

  @ApiProperty()
  invoiceUrl?: string;

  @ApiProperty()
  bankSlipUrl?: string;

  @ApiProperty()
  pixQrCodeUrl?: string;

  @ApiProperty()
  creditCardTransactionId?: string;

  @ApiProperty()
  creditCardBrand?: string;

  @ApiProperty()
  creditCardLastDigits?: string;

  @ApiProperty()
  creditCardTransactionDate?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationCode?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationType?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationDate?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationResult?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationReturnCode?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationReturnMessage?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationNsu?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationTid?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirer?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerId?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerName?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnCode?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnMessage?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnDate?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnNsu?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnTid?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnUrl?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnTransactionId?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationId?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationStatus?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationDate?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationValue?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCurrency?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCountry?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardBin?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardLast4?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardBrand?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardType?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardCountry?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuer?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerId?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerName?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerCountry?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerType?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerBrand?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerCountryCode?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerRegion?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerCity?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerState?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerPostalCode?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerAddress?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerNumber?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerComplement?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerDistrict?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerCountryCode2?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerPhone?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerFax?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerEmail?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerWebsite?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerCnpj?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerIe?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerIm?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerCrt?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerCnae?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerLegalNature?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerSize?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerType2?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerClassification?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerSegment?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerSubSegment?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerRisk?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerScore?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerStatus?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerObservation?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerDateCreated?: string;

  @ApiProperty()
  creditCardTransactionAuthorizationAcquirerReturnAuthorizationCardIssuerDateUpdated?: string;

  @ApiProperty()
  dateCreated?: string;

  @ApiProperty()
  dueDateLimitDays?: number;

  @ApiProperty()
  discountValue?: number;

  @ApiProperty()
  discountType?: string;

  @ApiProperty()
  discountDueDateLimitDays?: number;

  @ApiProperty()
  fineValue?: number;

  @ApiProperty()
  fineType?: string;

  @ApiProperty()
  interestValue?: number;

  @ApiProperty()
  postalService?: boolean;

  @ApiProperty()
  confirmedDate?: string;

  @ApiProperty()
  pixTransactionId?: string;

  @ApiProperty()
  pixQrCode?: string;

  @ApiProperty()
 pixExpirationDate?: string;

  @ApiProperty()
  originalValue?: number;

  @ApiProperty()
  paymentLink?: string;

  @ApiProperty()
  creditCardTransaction?: any;

  @ApiProperty()
  split?: any[];
}