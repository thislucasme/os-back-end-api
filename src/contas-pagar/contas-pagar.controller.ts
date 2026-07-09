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
import { ContasPagarService } from './contas-pagar.service';
import { CreateContaPagarDto } from './dto/create-conta-pagar.dto';
import { UpdateContaPagarDto } from './dto/update-conta-pagar.dto';
import { PagarContaDto } from './dto/pagar-conta.dto';
import {
  ContaPagar,
  StatusContaPagar,
} from './entities/conta-pagar.entity';

@ApiTags('Contas a Pagar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contas-pagar')
export class ContasPagarController {
  constructor(
    private readonly service: ContasPagarService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Criar conta a pagar',
    description: 'Cria uma nova conta a pagar vinculada à empresa do usuário logado.',
  })
  @ApiBody({
    type: CreateContaPagarDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Conta a pagar criada com sucesso.',
    type: ContaPagar,
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário inválido ou sem empresa vinculada.',
  })
  create(
    @Req() req,
    @Body() dto: CreateContaPagarDto,
  ) {
    return this.service.create(
      req.user,
      dto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Listar contas a pagar',
    description: 'Lista contas a pagar com paginação, busca e filtro por status.',
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
    example: 'Fornecedor',
    description: 'Busca por fornecedor, documento ou descrição.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: StatusContaPagar,
    example: StatusContaPagar.ABERTA,
    description: 'Filtro por status da conta.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista retornada com sucesso.',
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
    summary: 'Buscar conta a pagar por ID',
    description: 'Retorna uma conta a pagar específica da empresa do usuário logado.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID da conta a pagar.',
  })
  @ApiResponse({
    status: 200,
    description: 'Conta a pagar encontrada.',
    type: ContaPagar,
  })
  @ApiResponse({
    status: 404,
    description: 'Conta a pagar não encontrada.',
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
    summary: 'Atualizar conta a pagar',
    description: 'Atualiza os dados de uma conta a pagar.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID da conta a pagar.',
  })
  @ApiBody({
    type: UpdateContaPagarDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Conta a pagar atualizada com sucesso.',
    type: ContaPagar,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos para atualização.',
  })
  @ApiResponse({
    status: 404,
    description: 'Conta a pagar não encontrada.',
  })
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateContaPagarDto,
  ) {
    return this.service.update(
      req.user,
      Number(id),
      dto,
    );
  }

  @Post(':id/pagar')
  @ApiOperation({
    summary: 'Pagar conta',
    description: 'Registra um pagamento parcial ou total de uma conta a pagar e baixa o saldo da conta financeira.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID da conta a pagar.',
  })
  @ApiBody({
    type: PagarContaDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Pagamento registrado com sucesso.',
    type: ContaPagar,
  })
  @ApiResponse({
    status: 400,
    description: 'Valor inválido, saldo insuficiente, conta cancelada, já paga ou pagamento maior que o saldo da conta.',
  })
  @ApiResponse({
    status: 404,
    description: 'Conta a pagar não encontrada.',
  })
  pagar(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: PagarContaDto,
  ) {
    return this.service.pagar(
      req.user,
      Number(id),
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Excluir conta a pagar',
    description: 'Remove uma conta a pagar da empresa do usuário logado.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID da conta a pagar.',
  })
  @ApiResponse({
    status: 200,
    description: 'Conta a pagar excluída com sucesso.',
    schema: {
      example: {
        deleted: true,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Conta a pagar não encontrada.',
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