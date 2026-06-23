import { PartialType } from '@nestjs/swagger';
import { CreateClienteFornecedorDto } from './create-cliente-fornecedor.dto';

export class UpdateClienteFornecedorDto extends PartialType(
  CreateClienteFornecedorDto,
) {}