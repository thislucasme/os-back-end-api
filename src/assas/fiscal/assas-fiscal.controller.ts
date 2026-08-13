import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AssasFiscalInfoService } from './assas-fiscal.service';
import { FiscalInfoResponseDto, FiscalInfoQueryDto } from './fiscal-info.dto';

@ApiTags('Fiscal Info - Asaas')
@Controller('assas/fiscal-info')
export class AssasFiscalInfoController {
  constructor(private readonly fiscalInfoService: AssasFiscalInfoService) {}

  @Get('nbs-codes')
  @ApiOperation({ summary: 'Listar códigos NBS (Nomenclatura Brasileira de Serviços)' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso', type: FiscalInfoResponseDto })
  @ApiResponse({ status: 400, description: 'Requisição inválida' })
  @ApiResponse({ status: 500, description: 'Token de ambiente ausente ou erro interno' })
  async listNbsCodes(
    @Query() query: FiscalInfoQueryDto,
  ): Promise<FiscalInfoResponseDto> {
    return this.fiscalInfoService.listNbsCodes(query);
  }

  @Get('federal-service-codes')
  @ApiOperation({ summary: 'Listar códigos de serviços federais' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso', type: FiscalInfoResponseDto })
  @ApiResponse({ status: 400, description: 'Requisição inválida' })
  @ApiResponse({ status: 500, description: 'Token de ambiente ausente ou erro interno' })
  async listFederalServiceCodes(
    @Query() query: FiscalInfoQueryDto,
  ): Promise<FiscalInfoResponseDto> {
    return this.fiscalInfoService.listFederalServiceCodes(query);
  }
}