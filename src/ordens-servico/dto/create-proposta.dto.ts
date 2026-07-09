// src/propostas/dto/create-proposta.dto.ts
import { PropostaStatus } from '../entities/proposta.entity';

export class CreatePropostaItemDto {
  produtoServicoId!: number;
  descricao?: string;
  quantidade!: number;
  valorUnitario!: number;
}

export class CreatePropostaDto {
  companyId!: number;
  ordemServicoId?: number;
  clienteId?: number;

  titulo!: string;
  descricao?: string;
  status?: PropostaStatus;

  dataEmissao?: string;
  validade?: string;

  desconto?: number;

  condicoesPagamento?: string;
  garantia?: string;
  observacoes?: string;
  mensagemFinal?: string;

  itens?: CreatePropostaItemDto[];
}