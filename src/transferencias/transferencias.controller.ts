import {
  Body,
  Controller,
  Get,
  Param,
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
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';
import { Transferencia } from './entities/transferencia.entity';
import { TransferenciasService } from './transferencias.service';

@ApiTags('Transferências')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transferencias')
export class TransferenciasController {
  constructor(
    private readonly service: TransferenciasService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Criar transferência',
    description:
      'Transfere saldo entre duas contas financeiras da empresa do usuário logado.',
  })
  @ApiBody({
    type: CreateTransferenciaDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Transferência criada com sucesso.',
    type: Transferencia,
  })
  @ApiResponse({
    status: 400,
    description:
      'Dados inválidos, saldo insuficiente ou contas financeiras inválidas.',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário inválido ou sem empresa vinculada.',
  })
  create(
    @Req() req,
    @Body() dto: CreateTransferenciaDto,
  ) {
    return this.service.create(
      req.user,
      dto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Listar transferências',
    description:
      'Lista transferências da empresa do usuário logado com paginação e filtros.',
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
    example: 'caixa',
    description: 'Busca pela descrição da transferência.',
  })
  @ApiQuery({
    name: 'contaOrigemId',
    required: false,
    example: 1,
    description: 'Filtro por conta financeira de origem.',
  })
  @ApiQuery({
    name: 'contaDestinoId',
    required: false,
    example: 2,
    description: 'Filtro por conta financeira de destino.',
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
    description: 'Transferências retornadas com sucesso.',
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
    summary: 'Buscar transferência por ID',
    description:
      'Retorna uma transferência específica da empresa do usuário logado.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID da transferência.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transferência encontrada.',
    type: Transferencia,
  })
  @ApiResponse({
    status: 404,
    description: 'Transferência não encontrada.',
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