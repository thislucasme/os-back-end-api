import { ApiProperty } from '@nestjs/swagger';

class PeriodoDto {
  @ApiProperty()
  ano!: number;

  @ApiProperty()
  mes!: number;
}

class DadosFolhaDto {
  @ApiProperty()
  usuarioId!: number;

  @ApiProperty()
  nome!: string;

  @ApiProperty()
  salarioBase!: number;

  @ApiProperty()
  comissaoTotal!: number;

  @ApiProperty()
  descontos!: number;

  @ApiProperty()
  totalLiquido!: number;

  @ApiProperty({ type: PeriodoDto })
  periodo!: PeriodoDto;
}

class ItemFolhaDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  nomeItem!: string;

  @ApiProperty()
  valor!: number;

  @ApiProperty()
  quantidade!: number;

  @ApiProperty()
  comissaoPercentual!: number;

  @ApiProperty()
  valorComissao!: number;

  @ApiProperty({
    enum: ['PENDENTE', 'PAGO'],
    example: 'PENDENTE',
  })
  statusPagamento!: string;

  @ApiProperty()
  dataLiberacao!: string;

  @ApiProperty()
  ordemServicoId!: number;
}

class DespesaFolhaDto {
  @ApiProperty()
  id!: number;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  descricao!: string | null;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  dataLiberacao!: string;

  @ApiProperty({
    enum: ['PENDENTE', 'PAGO'],
    example: 'PENDENTE',
  })
  statusDebito!: string;
}

export class MarcarPagoPayloadDto {
  @ApiProperty({ type: DadosFolhaDto })
  dados_para_folha_pagamento!: DadosFolhaDto;

  @ApiProperty({ type: [ItemFolhaDto] })
  itens!: ItemFolhaDto[];

  @ApiProperty({ type: [DespesaFolhaDto] })
  despesas!: DespesaFolhaDto[];
}

export class MarcarPagoResponseDto {
  @ApiProperty()
  message!: string;

  @ApiProperty()
  itensAtualizados!: number;

  @ApiProperty()
  despesasAtualizadas!: number;
}