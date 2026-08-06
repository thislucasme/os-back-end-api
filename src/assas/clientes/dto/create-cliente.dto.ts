import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsBoolean, IsOptional, Length } from 'class-validator';

export class CreateClienteDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '24971563792' })
  @IsString()
  @Length(11, 14)
  cpfCnpj!: string;

  @ApiProperty({ example: 'john.doe@asaas.com.br' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '4738010919' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '4799376637' })
  @IsOptional()
  @IsString()
  mobilePhone?: string;

  @ApiPropertyOptional({ example: 'Av. Paulista' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '150' })
  @IsOptional()
  @IsString()
  addressNumber?: string;

  @ApiPropertyOptional({ example: 'Sala 201' })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiPropertyOptional({ example: 'Centro' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ example: '01310-000' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ example: '12987382' })
  @IsOptional()
  @IsString()
  externalReference?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  notificationDisabled?: boolean;

  @ApiPropertyOptional({ example: 'john.doe@asaas.com,john.doe.silva@asaas.com.br' })
  @IsOptional()
  @IsString()
  additionalEmails?: string;

  @ApiPropertyOptional({ example: '46683695908' })
  @IsOptional()
  @IsString()
  municipalInscription?: string;

  @ApiPropertyOptional({ example: '646681195275' })
  @IsOptional()
  @IsString()
  stateInscription?: string;

  @ApiPropertyOptional({ example: 'ótimo pagador, nenhum problema até o momento' })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  groupName?: string | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  company?: string | null;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  foreignCustomer?: boolean;
}