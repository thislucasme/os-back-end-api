import { ApiProperty } from '@nestjs/swagger';

export class MarcarPagoRequestDto {
  @ApiProperty({ required: false, description: 'IDs dos itens de comissão a marcar como PAGO (se não informado, marcará todos do período)' })
  itemIds?: number[];

  @ApiProperty({ required: false, description: 'IDs das despesas a marcar como PAGO (se não informado, marcará todas do período)' })
  despesaIds?: number[];
}