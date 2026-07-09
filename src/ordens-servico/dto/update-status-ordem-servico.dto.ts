// src/ordens-servico/dto/update-status-ordem-servico.dto.ts
import { OrdemServicoStatus } from '../entities/ordem-servico.entity';

export class UpdateStatusOrdemServicoDto {
  status!: OrdemServicoStatus;
}