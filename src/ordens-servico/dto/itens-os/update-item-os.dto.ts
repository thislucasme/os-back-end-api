import { PartialType } from '@nestjs/mapped-types';
import { CreateItemOsDto } from './create-item-os.dto';
import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateItemOsDto extends PartialType(CreateItemOsDto) {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  produtoServicoId?: number; // permite trocar o produto
}