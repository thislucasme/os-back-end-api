import { 
  IsNumber, 
  IsOptional, 
  IsString, 
  Min, 
  IsArray, 
  ValidateNested, 
  IsEnum 
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItemOsOrigem, ItemOsLiberacao } from 'src/ordens-servico/entities/item-os.entity';

class ResponsavelComissaoDto {
  @IsNumber()
  responsavelId!: number;

  @IsNumber()
  @Min(0)
  comissao!: number;
}

export class CreateItemOsDto {
  @IsNumber()
  ordemServicoId!: number;

  @IsNumber()
  produtoServicoId!: number;

  @IsOptional()
  @IsString()
  nome?: string;

  @IsNumber()
  @Min(0)
  valor!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantidade?: number = 1;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponsavelComissaoDto)
  responsaveis?: ResponsavelComissaoDto[];

  @IsOptional()
  @IsEnum(ItemOsOrigem)
  origem?: ItemOsOrigem = ItemOsOrigem.OS;

  // NOVO CAMPO
  @IsOptional()
  @IsEnum(ItemOsLiberacao)
  liberacao?: ItemOsLiberacao = ItemOsLiberacao.NA_CONCLUSAO_OS;
}