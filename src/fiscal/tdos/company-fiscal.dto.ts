import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFiscalServiceDto {
    @ApiProperty({ description: 'Nome do serviço' })
    @IsString()
    nome!: string;

    @ApiProperty({ description: 'Código de tributação nacional' })
    @IsString()
    cTribNac!: string;

    @ApiProperty({ description: 'Descrição do código de tributação nacional' })
    @IsString()
    cTribNacDescricao!: string;

    @ApiProperty({ description: 'Código NBS' })
    @IsString()
    cNBS!: string;

    @ApiProperty({ description: 'Descrição do código NBS' })
    @IsString()
    cNBSDescricao!: string;

    @ApiProperty({ description: 'Descrição detalhada do serviço' })
    @IsString()
    descricaoServico!: string;

    @ApiProperty({ description: 'Indica se possui não tributação' })
    @IsString()
    possuiNaoTributacao!: string;

    @ApiPropertyOptional({ description: 'Motivo da não tributação' })
    @IsOptional()
    @IsString()
    motivoNaoTributacao?: string;

    @ApiPropertyOptional({ description: 'Tipo de imunidade' })
    @IsOptional()
    @IsString()
    tipoImunidade?: string;
}

export class UpsertFiscalServiceDto extends CreateFiscalServiceDto {
    @ApiPropertyOptional({ description: 'ID único do serviço fiscal (UUID)' })
    @IsOptional()
    @IsString()
    id?: string;
}

export class UpdateCompanyFiscalDto {
    @ApiPropertyOptional() @IsOptional() @IsString() opcaoSimplesNacional?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() regimeApuracaoSimplesNacional?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() regimeEspecialTributacao?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() inscricaoMunicipal?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() codigoMunicipio?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() municipioNome?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() ambiente?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() serieDps?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() serie?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() aliquotaIss?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() percentualTributosSimples?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() percentualTributosFederal?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() percentualTributosEstadual?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() percentualTributosMunicipal?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() situacaoTributariaPisCofins?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() aliquotaInssRetido?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() aliquotaIrRetido?: string;

    @ApiPropertyOptional({
        description: 'Lista de serviços fiscais da empresa',
        type: [UpsertFiscalServiceDto]
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpsertFiscalServiceDto)
    services?: UpsertFiscalServiceDto[];
}

export class CreateCompanyFiscalDto extends UpdateCompanyFiscalDto {
    @ApiPropertyOptional({
        description: 'Lista inicial de serviços fiscais da empresa',
        type: [CreateFiscalServiceDto]
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateFiscalServiceDto)
    declare services?: CreateFiscalServiceDto[];
}