import { PartialType } from '@nestjs/swagger';
import { CreateProdutoServicoDto } from './create-produto-servico.dto';

export class UpdateProdutoServicoDto extends PartialType(
  CreateProdutoServicoDto,
) {}