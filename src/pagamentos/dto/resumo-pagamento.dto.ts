// dto/resumo-pagamento.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { ItemLiberadoResponseDto } from './item-liberado-response.dto';
import { DespesaResponseDto } from './despesa-response.dto';

export class ResumoPagamentoDto {
  @ApiProperty({ example: 'João Silva' })
  nome?: string;

  @ApiProperty({ example: 3000 })
  salarioBase?: number;

  @ApiProperty({ example: 315.5 })
  comissaoTotal?: number;

  @ApiProperty({ example: 0 })
  descontos?: number; // se quiser incluir

  @ApiProperty({ example: 3315.5 })
  totalLiquido?: number;

  @ApiProperty({ example: { ano: 2026, mes: 8 } })
  periodo?: { ano: number; mes: number };

  @ApiProperty({ type: [ItemLiberadoResponseDto] })
  itens?: ItemLiberadoResponseDto[];

  @ApiProperty({ type: [DespesaResponseDto] }) // <-- NOVO
  despesas?: DespesaResponseDto[];
}