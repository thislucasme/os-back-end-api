// src/ordens-servico/dto/concluir-ordem-servico.dto.ts
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ConcluirOrdemServicoDto {
  @IsOptional()
  @IsNumber()
  contaEntradaId?: number;

  @IsOptional()
  @IsNumber()
  contaSaidaId?: number;

  @IsOptional()
  @IsString()
  observacao?: string;
}