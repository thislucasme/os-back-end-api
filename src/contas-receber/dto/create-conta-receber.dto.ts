import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';


export class CreateContaReceberDto {


  @ApiProperty({
    example: 15,
    description:
      'ID do cliente vinculado à conta a receber.',
  })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  clienteId!: number;

  



  @ApiPropertyOptional({
    example: 25,
    description:
      'ID da ordem de serviço vinculada. Opcional.',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  ordemServicoId?: number;



  @ApiPropertyOptional({
    example:
      'Serviço de manutenção preventiva.',
    description:
      'Descrição da conta.',
  })
  @IsOptional()
  @IsString()
  descricao?: string;



  @ApiProperty({
    example: 3000,
    description:
      'Valor total da conta.',
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  valorOriginal!: number;



  @ApiProperty({
    example: 3,
    description:
      'Quantidade de parcelas.',
  })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  parcelas!: number;



  @ApiProperty({
    example:'2026-08-10',
    description:
      'Data do primeiro vencimento.',
  })
  @IsDateString()
  primeiroVencimento!: string;



  @ApiPropertyOptional({
    example:'2026-07-15',
    description:
      'Data de emissão.',
  })
  @IsOptional()
  @IsDateString()
  dataEmissao?: string;



  @ApiPropertyOptional({
    example:1,
    description:
      'Conta financeira padrão.',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  contaFinanceiraId?: number;


}