import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateFuncionarioDto {
  @ApiProperty({
    example: 'joao@empresa.com.br',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '123456',
  })
  @IsString()
  password!: string;

  @ApiPropertyOptional({
    example: 'João da Silva',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    example: '12345678900',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  cpf?: string;

  @ApiPropertyOptional({
    example: 'MG1234567',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  rg?: string;

  @ApiPropertyOptional({
    example: '(38)99999-9999',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({
    example: '(38)99999-9999',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsapp?: string;

  @ApiPropertyOptional({
    example: 'Técnico',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @ApiPropertyOptional({
    example: 'Assistência Técnica',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({
    example: 3500.50,
    description: 'Salário base do funcionário em reais',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salarioBase?: number;

  @ApiPropertyOptional({
    example: 'FUNC-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  registrationNumber?: string;

  @ApiPropertyOptional({
    example: '1995-01-15',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    example: '2026-06-24',
  })
  @IsOptional()
  @IsDateString()
  admissionDate?: string;

  @ApiPropertyOptional({
    example: '2027-01-01',
  })
  @IsOptional()
  @IsDateString()
  resignationDate?: string;

  @ApiPropertyOptional({
    example: 'Rua A, 123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({
    example: 'Unaí',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    example: 'MG',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  state?: string;

  @ApiPropertyOptional({
    example: '38610000',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipCode?: string;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({
    example: 'Responsável por atendimento externo.',
  })
  @IsOptional()
  @IsString()
  observations?: string;
}