// dto/folha-pagamento-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { FolhaStatus } from '../entities/folha-pagamento.entity';

export class FolhaPagamentoResponseDto {
  @ApiProperty() id?: number;
  @ApiProperty() usuarioId?: number;
  @ApiProperty() mes?: number;
  @ApiProperty() ano?: number;
  @ApiProperty() salarioBase?: number;
  @ApiProperty() comissaoTotal?: number;
  @ApiProperty() descontos?: number;
  @ApiProperty() totalLiquido?: number;
  @ApiProperty({ enum: FolhaStatus }) status?: FolhaStatus;
  @ApiProperty({ nullable: true }) dataUltimaLiberacao?: string | null;
  @ApiProperty({ nullable: true }) observacoes?: string | null;
  @ApiProperty() createdAt?: string;
  @ApiProperty() updatedAt?: string;
}