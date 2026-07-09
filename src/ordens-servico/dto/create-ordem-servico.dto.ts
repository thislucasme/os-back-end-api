// src/ordens-servico/dto/create-ordem-servico.dto.ts
import {
  OrdemServicoPrioridade,
  OrdemServicoStatus,
} from '../entities/ordem-servico.entity';

export class CreateOrdemServicoItemDto {
  produtoServicoId!: number;
  descricao?: string;
  quantidade!: number;
  valorUnitario!: number;
}

export class CreateOrdemServicoDto {
  companyId!: number;
  clienteId?: number;
  responsavelId?: number;

  titulo!: string;
  equipamento?: string;
  defeitoRelatado?: string;
  diagnosticoTecnico?: string;

  status?: OrdemServicoStatus;
  prioridade?: OrdemServicoPrioridade;

  etiquetas?: string[];

  dataEntrada?: string;
  dataPrevisao?: string;
  garantia?: string;
  mensagemFinal?: string;
  observacoesInternas?: string;

  itens?: CreateOrdemServicoItemDto[];
}