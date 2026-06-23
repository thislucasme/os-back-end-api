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
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateProdutoServicoDto } from './dto/create-produto-servico.dto';
import { UpdateProdutoServicoDto } from './dto/update-produto-servico.dto';
import { TipoItem } from './entities/produto-servico.entity';
import { ProdutosServicosService } from './produtos-servicos.service';

@ApiTags('Produtos e Serviços')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('produtos-servicos')
export class ProdutosServicosController {
  constructor(private readonly service: ProdutosServicosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar produto ou serviço' })
  @ApiBody({ type: CreateProdutoServicoDto })
  create(@Request() req, @Body() dto: CreateProdutoServicoDto) {
    return this.service.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar produtos e serviços da empresa' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({
    name: 'tipo',
    required: false,
    enum: TipoItem,
  })
  findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('tipo') tipo?: TipoItem,
  ) {
    return this.service.findAll(req.user.id, {
      search,
      page,
      limit,
      tipo,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar produto ou serviço por ID' })
  @ApiParam({ name: 'id', example: 1 })
  findOne(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar produto ou serviço' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateProdutoServicoDto })
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProdutoServicoDto,
  ) {
    return this.service.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover produto ou serviço' })
  @ApiParam({ name: 'id', example: 1 })
  remove(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(req.user.id, id);
  }
}