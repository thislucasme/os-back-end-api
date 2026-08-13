import { ApiProperty } from "@nestjs/swagger";
import { CreateFiscalServiceDto, UpdateCompanyFiscalDto } from "./company-fiscal.dto";

export class FiscalServiceResponseDto extends CreateFiscalServiceDto {
  @ApiProperty({ description: 'ID único do serviço (UUID)' })
  id!: string;

  @ApiProperty({ description: 'UID da empresa vinculada' })
  companyUid!: string;
}

export class CompanyFiscalSettingsResponseDto extends UpdateCompanyFiscalDto {
  @ApiProperty({ description: 'UID da empresa' })
  uid!: string;

  @ApiProperty({ description: 'Nome da empresa' })
  nome!: string;

  @ApiProperty({ description: 'CNPJ da empresa' })
  cnpj!: string;

  @ApiProperty({ 
    description: 'Lista de serviços fiscais cadastrados', 
    type: [FiscalServiceResponseDto] 
  })
  fiscalServices!: FiscalServiceResponseDto[];
}