import { Controller, Get, Put, Delete, Body, Param, UseGuards, Post, Request } from '@nestjs/common';
import { CompanyFiscalServiceManager } from './company-fiscal.service';
import { CreateFiscalServiceDto, UpdateCompanyFiscalDto } from './tdos/company-fiscal.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FiscalServiceResponseDto, CompanyFiscalSettingsResponseDto } from './tdos/company-fiscal-response.tdo';
import { CompanyFiscalService } from './company-service.entity';

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
        return this.fiscalService.emitirNota(req.user.id, 3000);
    }
    @Get('montar-payload-update-emitente')
    @ApiResponse({ status: 200, description: 'Montar payload para atualizar emitente' })
    async gerarPayloadUpdateEmitente(@Request() req) {
        return this.fiscalService.gerarPayloadUpdateEmitente(req.user.id);
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
    @ApiResponse({ type:CompanyFiscalService })
    async getCompanySerices(
        @Request() req,
    ) {
        return this.fiscalService.getCompanySerices(req.user.id);
    }
    
}