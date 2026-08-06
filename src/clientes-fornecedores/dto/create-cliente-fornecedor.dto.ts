import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  TipoCadastro,
  TipoPessoa,
} from '../entities/cliente-fornecedor.entity';

export class CreateClienteFornecedorDto {
  @ApiProperty({
    enum: TipoCadastro,
    example: TipoCadastro.CLIENTE,
  })
  @IsEnum(TipoCadastro)
  tipoCadastro!: TipoCadastro;

  @ApiProperty({
    enum: TipoPessoa,
    example: TipoPessoa.PF,
  })
  @IsEnum(TipoPessoa)
  tipoPessoa!: TipoPessoa;

  @ApiProperty({
    example: 'Maria Aparecida Souza',
  })
  @IsString()
  @MaxLength(255)
  nome!: string;

  @ApiProperty({
    example: '123.456.789-00',
    description: 'CPF ou CNPJ',
  })
  @IsString()
  @MaxLength(30)
  documento!: string;

  @ApiPropertyOptional({
    example: '(38) 3636-1111',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefone?: string;

  @ApiPropertyOptional({
    example: '(38) 99999-9999',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsapp?: string;

  @ApiPropertyOptional({
    example: 'maria@email.com',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    example: 'Rua Goiás, 123 - Centro',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  endereco?: string;

    @ApiPropertyOptional({
    example: 'cus_000008587289',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  asaasCustomerId?: string;

  @ApiPropertyOptional({
    example: 'Prefere contato pelo WhatsApp.',
  })
  @IsOptional()
  @IsString()
  observacoes?: string;
}