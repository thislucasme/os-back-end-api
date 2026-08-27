import { Controller, Get, Put, Delete, Body, Param, UseGuards, Post, Request, Query } from '@nestjs/common';
import { CompanyFiscalServiceManager } from './company-fiscal.service';
import { CreateFiscalServiceDto, UpdateCompanyFiscalDto } from './tdos/company-fiscal.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FiscalServiceResponseDto, CompanyFiscalSettingsResponseDto } from './tdos/company-fiscal-response.tdo';
import { CompanyFiscalService } from './company-service.entity';
import { EmitirNfseDto } from './tdos/emitir-nfse.dto';

import type { ListarNfseQuery } from './company-fiscal.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies/fiscal-settings')
export class CompanyFiscalController {
    constructor(private readonly fiscalService: CompanyFiscalServiceManager) { }

    @Post('settingssss')
    @ApiResponse({ status: 201, description: 'Configurações fiscais criadas com sucesso', type: CompanyFiscalSettingsResponseDto })
    async createSettings(
        @Request() req,
        @Body() dto: UpdateCompanyFiscalDto,
    ) {
        return this.fiscalService.upsertSettings(req.user.id, dto);
    }

    @Post()
    @ApiResponse({ status: 201, description: 'Serviço fiscal criado com sucesso', type: FiscalServiceResponseDto })
    create(@Request() req, @Body() dto: CreateFiscalServiceDto) {
        return this.fiscalService.create(req.user.id, dto);
    }

    @Get()
    @ApiResponse({ status: 200, description: 'Configurações e serviços fiscais retornados com sucesso', type: CompanyFiscalSettingsResponseDto })
    async getSettings(@Request() req) {
        return this.fiscalService.findByUserId(req.user.id);
    }

    @Get('montar-payload-nfse')
    @ApiResponse({ status: 200, description: 'Montar payload para gerar NFS-e', type: CompanyFiscalSettingsResponseDto })
    async montarPayloadNfse(@Request() req) {
        return this.fiscalService.emitirNota(req.user.id, 3000, "b61466f5-a0e8-426f-a04c-0659b611ce4d", 4);
    }
    @Get('montar-payload-update-emitente')
    @ApiResponse({ status: 200, description: 'Montar payload para atualizar emitente' })
    async gerarPayloadUpdateEmitente(@Request() req) {
        return this.fiscalService.gerarPayloadUpdateEmitente(req.user.id);
    }

    @Post('emitir-nfse')
    @ApiResponse({
        status: 200,
        description: 'NFS-e emitida com sucesso',
    })
    async emitirNfse(
        @Request() req,
        @Body() dto: EmitirNfseDto,
    ) {
        return this.fiscalService.emitirNota(
            req.user.id,
            dto.valorServico,
            dto.serviceId,
            dto.clienteFornecedorId,
        );
    }

    @Get('emissores/:cnpjEmissor/filtrar')
    @ApiOperation({ summary: 'Listar NFS-e por CNPJ do emissor com paginação e filtros' })
    @ApiParam({ name: 'cnpjEmissor', description: 'CNPJ do emissor' })
    @ApiQuery({ name: 'page', required: false, description: 'Número da página' })
    @ApiQuery({ name: 'limit', required: false, description: 'Itens por página' })
    @ApiQuery({ name: 'tomadorDocumento', required: false, description: 'CNPJ/CPF do tomador' })
    @ApiQuery({ name: 'tomadorNome', required: false, description: 'Razão social/nome do tomador' })
    @ApiQuery({ name: 'numeroDps', required: false, description: 'Número da DPS' })
    @ApiQuery({ name: 'serieDps', required: false, description: 'Série da DPS' })
    @ApiQuery({ name: 'chaveAcesso', required: false, description: 'Chave de acesso' })
    @ApiResponse({
        status: 200,
        description: 'Lista de NFS-e recuperada com sucesso',
    })
    async findByCnpjEmissor(
        @Param('cnpjEmissor') cnpjEmissor: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('tomadorDocumento') tomadorDocumento?: string,
        @Query('tomadorNome') tomadorNome?: string,
        @Query('numeroDps') numeroDps?: string,
        @Query('serieDps') serieDps?: string,
        @Query('chaveAcesso') chaveAcesso?: string,
    ) {
        // Monta o objeto de query exatamente como o seu service espera
        const query: ListarNfseQuery = {
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            tomadorDocumento,
            tomadorNome,
            numeroDps,
            serieDps,
            chaveAcesso,
        };

        return this.fiscalService.listarNfsePorCnpjEmissor(cnpjEmissor, query);
    }


    @Put()
    @ApiResponse({ status: 200, description: 'Configurações e serviços atualizados com sucesso', type: CompanyFiscalSettingsResponseDto })
    async updateSettings(
        @Request() req,
        @Body() dto: UpdateCompanyFiscalDto,
    ) {
        return this.fiscalService.upsertSettings(req.user.id, dto);
    }

    @Delete('services/:serviceId')
    @ApiResponse({ status: 200, description: 'Serviço fiscal deletado com sucesso' })
    async deleteService(
        @Request() req,
        @Param('serviceId') serviceId: string,
    ) {
        return this.fiscalService.deleteService(req.user.id, serviceId);
    }

    @Get('services/all')
    @ApiResponse({ type: CompanyFiscalService })
    async getCompanySerices(
        @Request() req,
    ) {
        return this.fiscalService.getCompanySerices(req.user.id);
    }

}