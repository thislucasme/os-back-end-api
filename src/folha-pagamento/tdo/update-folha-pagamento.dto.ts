// dto/update-folha-pagamento.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateFolhaPagamentoDto } from './folha-pagamento-create.dto';

export class UpdateFolhaPagamentoDto extends PartialType(CreateFolhaPagamentoDto) {}