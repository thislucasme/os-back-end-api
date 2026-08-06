import { Controller, Post, Get, Put, Delete, Body, Param, Query, Headers, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiHeader } from '@nestjs/swagger';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { ClienteResponseDto } from './dto/cliente-response.dto';
import { ClientesAssasService } from './clientes-assas.service';

@ApiTags('Assas - Clientes')
@Controller('assas/clientes')
export class ClientesAssasController {
  constructor(private readonly service: ClientesAssasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo cliente na ASAAS' })
  @ApiHeader({
    name: 'access_token',
    description: 'Token de acesso da ASAAS (sandbox ou produção)',
    required: true,
  })
  @ApiResponse({ status: 201, type: ClienteResponseDto })
  async create(
    @Headers('access_token') token: string,
    @Body() createDto: CreateClienteDto,
  ): Promise<ClienteResponseDto> {
    if (!token) {
      throw new BadRequestException('Token de acesso da ASAAS não fornecido');
    }
    return this.service.create(token, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes da ASAAS' })
  @ApiHeader({
    name: 'access_token',
    description: 'Token de acesso da ASAAS (sandbox ou produção)',
    required: true,
  })
  @ApiResponse({ status: 200, type: [ClienteResponseDto] })
  async findAll(
    @Headers('access_token') token: string,
    @Query() query: any,
  ): Promise<any> {
    if (!token) {
      throw new BadRequestException('Token de acesso da ASAAS não fornecido');
    }
    return this.service.findAll(token, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  @ApiHeader({
    name: 'access_token',
    description: 'Token de acesso da ASAAS (sandbox ou produção)',
    required: true,
  })
  @ApiResponse({ status: 200, type: ClienteResponseDto })
  async findOne(
    @Headers('access_token') token: string,
    @Param('id') id: string,
  ): Promise<ClienteResponseDto> {
    if (!token) {
      throw new BadRequestException('Token de acesso da ASAAS não fornecido');
    }
    return this.service.findOne(token, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cliente na ASAAS' })
  @ApiHeader({
    name: 'access_token',
    description: 'Token de acesso da ASAAS (sandbox ou produção)',
    required: true,
  })
  @ApiResponse({ status: 200, type: ClienteResponseDto })
  async update(
    @Headers('access_token') token: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateClienteDto,
  ): Promise<ClienteResponseDto> {
    if (!token) {
      throw new BadRequestException('Token de acesso da ASAAS não fornecido');
    }
    return this.service.update(token, id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover cliente na ASAAS' })
  @ApiHeader({
    name: 'access_token',
    description: 'Token de acesso da ASAAS (sandbox ou produção)',
    required: true,
  })
  @ApiResponse({ status: 204, description: 'Cliente removido com sucesso' })
  async remove(
    @Headers('access_token') token: string,
    @Param('id') id: string,
  ): Promise<void> {
    if (!token) {
      throw new BadRequestException('Token de acesso da ASAAS não fornecido');
    }
    await this.service.remove(token, id);
  }
}