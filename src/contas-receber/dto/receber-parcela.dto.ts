import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';



export class ReceberParcelaDto {



  @ApiProperty({
    example:1000,
    description:
      'Valor recebido da parcela.',
  })
  @IsNumber()
  @Type(()=>Number)
  @Min(0.01)
  valor!:number;




  @ApiPropertyOptional({
    example:'2026-08-10',
    description:
      'Data do pagamento.',
  })
  @IsOptional()
  @IsDateString()
  dataRecebimento?:string;




  @ApiPropertyOptional({
    example:1,
    description:
      'Conta financeira que recebeu o dinheiro.',
  })
  @IsOptional()
  @IsNumber()
  @Type(()=>Number)
  contaFinanceiraId?:number;




  @ApiPropertyOptional({
    example:'PIX',
  })
  @IsOptional()
  @IsString()
  formaPagamento?:string;




  @ApiPropertyOptional({
    example:
      'Pagamento referente à primeira parcela.',
  })
  @IsOptional()
  @IsString()
  observacao?:string;


}