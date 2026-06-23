import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  CondicaoItem,
  TipoItem,
  UnidadeMedida,
} from '../entities/produto-servico.entity';

export class CreateProdutoServicoDto {
  @IsEnum(TipoItem)
  tipo!: TipoItem;

  @IsString()
  @MaxLength(255)
  nome!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  sku?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  marca?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  categoria?: string;

  @IsOptional()
  @IsEnum(CondicaoItem)
  condicao?: CondicaoItem;

  @IsOptional()
  @IsEnum(UnidadeMedida)
  unidade?: UnidadeMedida;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsNumber()
  estoqueMinimo?: number;

  @IsOptional()
  @IsNumber()
  estoqueMaximo?: number;

  @IsOptional()
  @IsNumber()
  saldoInicial?: number;

  @IsOptional()
  @IsNumber()
  quantidade?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  deposito?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  localizacao?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  fornecedor?: string;

  @IsOptional()
  @IsNumber()
  precoCompraUnitario?: number;

  @IsOptional()
  @IsNumber()
  custoCompraUnitario?: number;

  @IsOptional()
  @IsNumber()
  precoVenda?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}