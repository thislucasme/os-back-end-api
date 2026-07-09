import { IsOptional, IsString } from 'class-validator';

export class GerarPropostaDto {
  @IsOptional()
  @IsString()
  validade?: string;

  @IsOptional()
  @IsString()
  condicoesPagamento?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}