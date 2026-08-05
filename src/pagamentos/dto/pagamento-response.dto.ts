// dto/pagamento-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PagamentoResponseDto {
  @ApiProperty({ example: 1 })
  id?: number; // ID do usuário

  @ApiProperty({ example: 'Walisson' })
  nome?: string;

  @ApiProperty({ example: 3500 })
  salarioBase?: number;

  @ApiProperty({ example: 80 })
  adicionais?: number;

  @ApiProperty({ example: 45 })
  descontos?: number;

  @ApiProperty({ example: 3535 })
  total?: number;

  @ApiProperty({ enum: ['PAGO', 'PENDENTE'], example: 'PAGO' })
  statusPagamento?: string;

  @ApiProperty({ type: Date, nullable: true, example: '2026-08-15T10:00:00.000Z' })
  dataLiberacao?: Date | null;
}