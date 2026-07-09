import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MovimentacoesService } from './movimentacoes.service';
import {
  MovimentacaoFinanceira,
  OrigemMovimentacaoFinanceira,
  TipoMovimentacaoFinanceira,
} from './entities/movimentacao-financeira.entity';

@ApiTags('Movimentações Financeiras')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('movimentacoes')
export class MovimentacoesController {
  constructor(
    private readonly service: MovimentacoesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar movimentações financeiras',
    description:
      'Lista o extrato financeiro da empresa do usuário logado com paginação e filtros.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Página atual.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Quantidade de registros por página.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    example: 'Recebimento',
    description: 'Busca pela descrição da movimentação.',
  })
  @ApiQuery({
    name: 'tipo',
    required: false,
    enum: TipoMovimentacaoFinanceira,
    example: TipoMovimentacaoFinanceira.ENTRADA,
    description: 'Filtro por tipo da movimentação.',
  })
  @ApiQuery({
    name: 'origem',
    required: false,
    enum: OrigemMovimentacaoFinanceira,
    example: OrigemMovimentacaoFinanceira.CONTA_RECEBER,
    description: 'Filtro por origem da movimentação.',
  })
  @ApiQuery({
    name: 'contaFinanceiraId',
    required: false,
    example: 1,
    description: 'Filtro por conta financeira.',
  })
  @ApiQuery({
    name: 'dataInicio',
    required: false,
    example: '2026-06-01',
    description: 'Data inicial do filtro.',
  })
  @ApiQuery({
    name: 'dataFim',
    required: false,
    example: '2026-06-30',
    description: 'Data final do filtro.',
  })
  @ApiResponse({
    status: 200,
    description: 'Movimentações retornadas com sucesso.',
  })
  findAll(
    @Req() req,
    @Query() query: any,
  ) {
    return this.service.findAll(
      req.user,
      query,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar movimentação por ID',
    description:
      'Retorna uma movimentação financeira específica da empresa do usuário logado.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID da movimentação financeira.',
  })
  @ApiResponse({
    status: 200,
    description: 'Movimentação encontrada.',
    type: MovimentacaoFinanceira,
  })
  @ApiResponse({
    status: 404,
    description: 'Movimentação financeira não encontrada.',
  })
  findOne(
    @Req() req,
    @Param('id') id: string,
  ) {
    return this.service.findOne(
      req.user,
      Number(id),
    );
  }
}