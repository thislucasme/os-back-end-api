// dto/folha-pagamento-create.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateFolhaPagamentoDto {
  @ApiProperty()
  @IsInt()
  usuarioId!: number;

  @ApiProperty({ example: 8, minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  mes!: number;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  ano!: number;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsNumber()
  salarioBase?: number;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsNumber()
  comissaoTotal?: number;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsNumber()
  descontos?: number;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsNumber()
  totalLiquido?: number;

  @ApiProperty({ enum: ['PENDENTE', 'PAGO', 'CANCELADO'], default: 'PENDENTE', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  observacoes?: string;
}