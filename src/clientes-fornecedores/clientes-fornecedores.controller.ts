import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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
import { ClientesFornecedoresService } from './clientes-fornecedores.service';
import { CreateClienteFornecedorDto } from './dto/create-cliente-fornecedor.dto';
import { UpdateClienteFornecedorDto } from './dto/update-cliente-fornecedor.dto';

@ApiTags('Clientes e Fornecedores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clientes-fornecedores')
export class ClientesFornecedoresController {
  constructor(private readonly service: ClientesFornecedoresService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar cliente ou fornecedor',
  })
  @ApiBody({
    type: CreateClienteFornecedorDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Cadastro criado com sucesso.',
  })
  create(
    @Request() req,
    @Body() dto: CreateClienteFornecedorDto,
  ) {
    return this.service.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar clientes e fornecedores da empresa',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    example: 'maria',
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
  findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll(req.user.id, {
      search,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar cadastro por ID',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  findOne(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar cliente ou fornecedor',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiBody({
    type: UpdateClienteFornecedorDto,
  })
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClienteFornecedorDto,
  ) {
    return this.service.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover cliente ou fornecedor',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  remove(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(req.user.id, id);
  }
}