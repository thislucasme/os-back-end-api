// src/financeiro/contas-pagar/contas-pagar.controller.ts
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
  Request,
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
import { PagarParcelaDto } from './dto/pagar-parcela.dto';
import {
  ContaPagar,
  StatusContaPagar,
} from './entities/conta-pagar.entity';

@ApiTags('Contas a Pagar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contas-pagar')
export class ContasPagarController {
  constructor(private readonly service: ContasPagarService) {}

  // ========== CRIAR ==========
  @Post()
  @ApiOperation({
    summary: 'Criar conta a pagar',
    description:
      'Cria uma nova conta a pagar vinculada à empresa do usuário logado.',
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
  create(@Req() req, @Body() dto: CreateContaPagarDto) {
    return this.service.create(req.user, dto);
  }

  // ========== LISTAR ==========
  @Get()
  @ApiOperation({
    summary: 'Listar contas a pagar',
    description:
      'Lista contas a pagar da empresa do usuário logado com paginação, busca e filtro por status.',
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
    example: 'Fornecedor ABC',
    description: 'Busca por nome do fornecedor ou descrição.',
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
    description: 'Lista de contas a pagar retornada com sucesso.',
  })
  findAll(@Req() req, @Query() query: any) {
    return this.service.findAll(req.user, query);
  }

  // ========== BUSCAR POR ID ==========
  @Get(':id')
  @ApiOperation({
    summary: 'Buscar conta a pagar por ID',
    description:
      'Retorna uma conta a pagar específica da empresa do usuário logado.',
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
  findOne(@Req() req, @Param('id') id: string) {
    return this.service.findOne(req.user, Number(id));
  }

  // ========== ATUALIZAR ==========
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
    return this.service.update(req.user, Number(id), dto);
  }

  // ========== PAGAR PARCELA ==========
  @Post('parcelas/:id/pagar')
  @ApiOperation({
    summary: 'Pagar parcela da conta',
    description:
      'Registra o pagamento de uma parcela específica da conta a pagar.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID da parcela da conta a pagar.',
  })
  @ApiBody({
    type: PagarParcelaDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Parcela paga com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Parcela já paga, saldo insuficiente ou dados inválidos.',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão para esta parcela.',
  })
  @ApiResponse({
    status: 404,
    description: 'Parcela não encontrada.',
  })
  pagarParcela(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: PagarParcelaDto,
  ) {
    return this.service.pagarParcela(req.user, Number(id), dto);
  }

  // ========== EXCLUIR ==========
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
    status: 400,
    description: 'Não é possível excluir uma conta com parcelas pagas.',
  })
  @ApiResponse({
    status: 404,
    description: 'Conta a pagar não encontrada.',
  })
  remove(@Req() req, @Param('id') id: string) {
    return this.service.remove(req.user, Number(id));
  }
}