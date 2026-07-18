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
import { ContasReceberService } from './contas-receber.service';
import { CreateContaReceberDto } from './dto/create-conta-receber.dto';
import { UpdateContaReceberDto } from './dto/update-conta-receber.dto';

import {
  ContaReceber,
  StatusContaReceber,
} from './entities/conta-receber.entity';
import { ReceberParcelaDto } from './dto/receber-parcela.dto';

@ApiTags('Contas a Receber')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contas-receber')
export class ContasReceberController {
  constructor(
    private readonly service: ContasReceberService,
  ) { }

  @Post()
  @ApiOperation({
    summary: 'Criar conta a receber',
    description: 'Cria uma nova conta a receber vinculada à empresa do usuário logado.',
  })
  @ApiBody({
    type: CreateContaReceberDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Conta a receber criada com sucesso.',
    type: ContaReceber,
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário inválido ou sem empresa vinculada.',
  })
  create(
    @Req() req,
    @Body() dto: CreateContaReceberDto,
  ) {
    return this.service.create(
      req.user,
      dto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Listar contas a receber',
    description: 'Lista contas a receber da empresa do usuário logado com paginação, busca e filtro por status.',
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
    example: 'João',
    description: 'Busca por nome do cliente, documento ou descrição.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: StatusContaReceber,
    example: StatusContaReceber.ABERTA,
    description: 'Filtro por status da conta.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de contas a receber retornada com sucesso.',
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
    summary: 'Buscar conta a receber por ID',
    description: 'Retorna uma conta a receber específica da empresa do usuário logado.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID da conta a receber.',
  })
  @ApiResponse({
    status: 200,
    description: 'Conta a receber encontrada.',
    type: ContaReceber,
  })
  @ApiResponse({
    status: 404,
    description: 'Conta a receber não encontrada.',
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
    summary: 'Atualizar conta a receber',
    description: 'Atualiza os dados de uma conta a receber.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID da conta a receber.',
  })
  @ApiBody({
    type: UpdateContaReceberDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Conta a receber atualizada com sucesso.',
    type: ContaReceber,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos para atualização.',
  })
  @ApiResponse({
    status: 404,
    description: 'Conta a receber não encontrada.',
  })
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateContaReceberDto,
  ) {
    return this.service.update(
      req.user,
      Number(id),
      dto,
    );
  }

  @Post('parcelas/:id/receber')
@ApiOperation({
  summary: 'Receber parcela da conta',
  description:
    'Registra o pagamento de uma parcela específica da conta a receber.',
})
@ApiParam({
  name:'id',
  example:1,
  description:
    'ID da parcela da conta a receber.',
})
@ApiBody({
  type:ReceberParcelaDto,
})
@ApiResponse({
  status:201,
  description:
    'Parcela recebida com sucesso.',
})
@ApiResponse({
  status:400,
  description:
    'Parcela já paga ou dados inválidos.',
})
@ApiResponse({
  status:404,
  description:
    'Parcela não encontrada.',
})
receberParcela(
  @Request() req,
  @Param('id') id:string,
  @Body() dto:ReceberParcelaDto,
){

  return this.service.receberParcela(
    req.user,
    Number(id),
    dto,
  );

}

  @Delete(':id')
  @ApiOperation({
    summary: 'Excluir conta a receber',
    description: 'Remove uma conta a receber da empresa do usuário logado.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID da conta a receber.',
  })
  @ApiResponse({
    status: 200,
    description: 'Conta a receber excluída com sucesso.',
    schema: {
      example: {
        deleted: true,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Conta a receber não encontrada.',
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