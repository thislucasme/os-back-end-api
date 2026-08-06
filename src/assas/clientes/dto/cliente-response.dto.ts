import { ApiPropertyOptional } from '@nestjs/swagger';

export class ClienteResponseDto {
  @ApiPropertyOptional()
  object?: string;

  @ApiPropertyOptional()
  id?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  mobilePhone?: string;

  @ApiPropertyOptional()
  cpfCnpj?: string;

  @ApiPropertyOptional()
  postalCode?: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  addressNumber?: string;

  @ApiPropertyOptional()
  complement?: string;

  @ApiPropertyOptional()
  province?: string;

  @ApiPropertyOptional()
  externalReference?: string;

  @ApiPropertyOptional()
  notificationDisabled?: boolean;

  @ApiPropertyOptional()
  additionalEmails?: string;

  @ApiPropertyOptional()
  municipalInscription?: string;

  @ApiPropertyOptional()
  stateInscription?: string;

  @ApiPropertyOptional()
  observations?: string;

  @ApiPropertyOptional()
  groupName?: string | null;

  @ApiPropertyOptional()
  company?: string | null;

  @ApiPropertyOptional()
  foreignCustomer?: boolean;

  @ApiPropertyOptional()
  dateCreated?: string;
}