// folha-pagamento.controller.ts
import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards,
  ParseIntPipe, BadRequestException, NotFoundException
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FolhaPagamentoService } from './folha-pagamento.service';
import { CreateFolhaPagamentoDto } from './tdo/folha-pagamento-create.dto';
import { FolhaPagamentoResponseDto } from './tdo/folha-pagamento-response.dto';
import { UpdateFolhaPagamentoDto } from './tdo/update-folha-pagamento.dto';

@ApiTags('Folha de Pagamento')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('folha-pagamento')
export class FolhaPagamentoController {
  constructor(private readonly service: FolhaPagamentoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova folha de pagamento (gerar ou manual)' })
  @ApiResponse({ status: 201, type: FolhaPagamentoResponseDto })
  async create(@Req() req, @Body() dto: CreateFolhaPagamentoDto): Promise<FolhaPagamentoResponseDto> {
    return this.service.create(req.user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar folhas de pagamento' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'Ana' })
  @ApiQuery({ name: 'mes', required: false })
  @ApiQuery({ name: 'ano', required: false })
  @ApiResponse({ status: 200, type: [FolhaPagamentoResponseDto] })
  async findAll(@Req() req, @Query() query: any): Promise<{ data: FolhaPagamentoResponseDto[]; total: number }> {
    return this.service.findAll(req.user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma folha específica' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: FolhaPagamentoResponseDto })
  async findOne(@Req() req, @Param('id', ParseIntPipe) id: number): Promise<FolhaPagamentoResponseDto> {
    return this.service.findOne(req.user, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar dados de uma folha' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: FolhaPagamentoResponseDto })
  async update(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFolhaPagamentoDto,
  ): Promise<FolhaPagamentoResponseDto> {
    return this.service.update(req.user, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma folha de pagamento' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204, description: 'Removido com sucesso' })
  async delete(@Req() req, @Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.delete(req.user, id);
  }
}