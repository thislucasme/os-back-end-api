// dto/despesa-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class DespesaResponseDto {
  @ApiProperty()
  id?: number;

  @ApiProperty()
  descricao?: string | null;

  @ApiProperty()
  amount?: number;

  @ApiProperty()
  dataLiberacao?: Date;

  @ApiProperty()
  statusDebito?: string;
}