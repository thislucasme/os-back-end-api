import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateDespesaDto } from './dto/create-despesa.dto';
import { UpdateDespesaDto } from './dto/update-despesa.dto';
import {
  Despesa,
  StatusDespesa,
} from './entities/despesa.entity';
import { DespesasService } from './despesas.service';

@ApiTags('Despesas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('despesas')
export class DespesasController {
  constructor(
    private readonly service: DespesasService,
  ) { }

  @Post()
  @ApiOperation({
    summary: 'Criar despesa',
    description:
      'Cria uma despesa, debita o saldo da conta financeira e registra movimentação de saída.',
  })
  @ApiBody({
    type: CreateDespesaDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Despesa criada com sucesso.',
    type: Despesa,
  })
  @ApiResponse({
    status: 400,
    description:
      'Dados inválidos, saldo insuficiente ou conta financeira inválida.',
  })
  create(
    @Req() req,
    @Body() dto: CreateDespesaDto,
  ) {
    console.log(
      req.user,
      dto,
    )
    return this.service.create(
      req.user,
      dto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Listar despesas',
    description:
      'Lista despesas da empresa do usuário logado com paginação e filtros.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    example: 'limpeza',
  })
  @ApiQuery({
    name: 'categoria',
    required: false,
    example: 'Limpeza',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: StatusDespesa,
    example: StatusDespesa.ATIVA,
  })
  @ApiQuery({
    name: 'contaFinanceiraId',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'dataInicio',
    required: false,
    example: '2026-06-01',
  })
  @ApiQuery({
    name: 'dataFim',
    required: false,
    example: '2026-06-30',
  })
  @ApiResponse({
    status: 200,
    description: 'Despesas retornadas com sucesso.',
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
    summary: 'Buscar despesa por ID',
    description:
      'Retorna uma despesa específica da empresa do usuário logado.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Despesa encontrada.',
    type: Despesa,
  })
  @ApiResponse({
    status: 404,
    description: 'Despesa não encontrada.',
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

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar despesa',
    description:
      'Atualiza uma despesa. Se alterar valor ou conta financeira, corrige o saldo e registra movimentações de ajuste.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiBody({
    type: UpdateDespesaDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Despesa atualizada com sucesso.',
    type: Despesa,
  })
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateDespesaDto,
  ) {
    return this.service.update(
      req.user,
      Number(id),
      dto,
    );
  }

  @Post(':id/cancelar')
  @ApiOperation({
    summary: 'Cancelar despesa',
    description:
      'Cancela uma despesa, estorna o saldo da conta financeira e registra movimentação de entrada.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Despesa cancelada com sucesso.',
    type: Despesa,
  })
  cancelar(
    @Req() req,
    @Param('id') id: string,
  ) {
    return this.service.cancelar(
      req.user,
      Number(id),
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Cancelar despesa via DELETE',
    description:
      'Não remove fisicamente. Apenas cancela a despesa e estorna o saldo.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Despesa cancelada com sucesso.',
  })
  remove(
    @Req() req,
    @Param('id') id: string,
  ) {
    return this.service.remove(
      req.user,
      Number(id),
    );
  }
}