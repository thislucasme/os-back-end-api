// dto/item-liberado-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ItemLiberadoResponseDto {
  @ApiProperty() id?: number;
  @ApiProperty() nomeItem?: string;
  @ApiProperty() valor?: number;
  @ApiProperty() quantidade?: number;
  @ApiProperty() comissaoPercentual?: number;
  @ApiProperty() valorComissao?: number; // valor * quantidade * (comissao/100)
  @ApiProperty() statusPagamento?: string;
  @ApiProperty() dataLiberacao?: Date;
  @ApiProperty() ordemServicoId?: number;
}