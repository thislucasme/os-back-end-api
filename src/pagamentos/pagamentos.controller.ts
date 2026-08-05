import { BadRequestException, Controller, Get, Param, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PagamentosService } from './pagamentos.service';
import { PagamentoResponseDto } from './dto/pagamento-response.dto';
import { ItemLiberadoResponseDto } from './dto/item-liberado-response.dto';
import { ResumoPagamentoDto } from './dto/resumo-pagamento.dto';

@ApiTags('Pagamentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly service: PagamentosService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar pagamentos de funcionários por mês/ano',
    description:
      'Retorna lista com salário base, comissões (apenas itens liberados no mês), descontos, total, status de pagamento (global) e data da última liberação no mês.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'Ana' })
  @ApiQuery({ name: 'mes', required: true, example: 8, description: 'Mês (1-12)' })
  @ApiQuery({ name: 'ano', required: true, example: 2026, description: 'Ano (ex: 2026)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pagamentos retornada com sucesso.',
    type: [PagamentoResponseDto],
    examples: {
      exemplo: {
        summary: 'Exemplo de resposta',
        value: [
          {
            nome: 'Walisson',
            salarioBase: 3500,
            adicionais: 80,
            descontos: 45,
            total: 3535,
            statusPagamento: 'PAGO',
            dataLiberacao: '2026-08-15T10:00:00.000Z',
          },
        ],
      },
    },
  })
  findAll(@Req() req, @Query() query: any) {
    return this.service.findAll(req.user, query);
  }

 @Get('usuario/:usuarioId')
@ApiOperation({ summary: 'Resumo e itens liberados de um funcionário por mês/ano' })
@ApiParam({ name: 'usuarioId' })
@ApiQuery({ name: 'ano', required: true })
@ApiQuery({ name: 'mes', required: true })
@ApiResponse({ status: 200, type: ResumoPagamentoDto })
async getResumoPorUsuario(
  @Req() req,
  @Param('usuarioId', ParseIntPipe) usuarioId: number,
  @Query('ano', ParseIntPipe) ano: number,
  @Query('mes', ParseIntPipe) mes: number,
) {
  if (mes < 1 || mes > 12) throw new BadRequestException('Mês inválido');
  if (ano < 2000 || ano > 2100) throw new BadRequestException('Ano inválido');

  return this.service.findItensLiberadosPorUsuario(req.user, usuarioId, ano, mes);
}
}