import { PartialType } from '@nestjs/mapped-types';
import { CreateItemOsDto } from './create-item-os.dto';

export class UpdateItemOsDto extends PartialType(CreateItemOsDto) {}