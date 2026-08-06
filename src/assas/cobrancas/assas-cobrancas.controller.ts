import { Controller, Post, Get, Put, Delete, Body, Param, Query, Headers, UseGuards, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AssasCobrancasService } from './assas-cobrancas.service';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { PaymentResponseDto } from './dtos/payment-response.dto';
import { UpdatePaymentDto } from './dtos/update-payment.dto';

@ApiTags('Assas - Cobranças')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assas/cobrancas')
export class AssasCobrancasController {
  constructor(private readonly assasCobrancasService: AssasCobrancasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova cobrança (pagamento) na ASAAS' })
  @ApiHeader({
    name: 'access_token',
    description: 'Token de acesso da ASAAS (sandbox ou produção)',
    required: true,
  })
  @ApiResponse({ status: 201, type: PaymentResponseDto })
  async createPayment(
    @Headers('access_token') token: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    if (!token) {
      throw new BadRequestException('Token de acesso da ASAAS não fornecido');
    }
    return this.assasCobrancasService.createPayment(token, createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cobranças da ASAAS' })
  @ApiHeader({
    name: 'access_token',
    description: 'Token de acesso da ASAAS (sandbox ou produção)',
    required: true,
  })
  @ApiResponse({ status: 200, type: [PaymentResponseDto] })
  async findAllPayments(
    @Headers('access_token') token: string,
    @Query() query: any,
  ): Promise<any> {
    if (!token) {
      throw new BadRequestException('Token de acesso da ASAAS não fornecido');
    }
    return this.assasCobrancasService.findAllPayments(token, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cobrança por ID' })
  @ApiHeader({
    name: 'access_token',
    description: 'Token de acesso da ASAAS (sandbox ou produção)',
    required: true,
  })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  async findPaymentById(
    @Headers('access_token') token: string,
    @Param('id') id: string,
  ): Promise<PaymentResponseDto> {
    if (!token) {
      throw new BadRequestException('Token de acesso da ASAAS não fornecido');
    }
    return this.assasCobrancasService.findPaymentById(token, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cobrança na ASAAS' })
  @ApiHeader({
    name: 'access_token',
    description: 'Token de acesso da ASAAS (sandbox ou produção)',
    required: true,
  })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  async updatePayment(
    @Headers('access_token') token: string,
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentResponseDto> {
    if (!token) {
      throw new BadRequestException('Token de acesso da ASAAS não fornecido');
    }
    return this.assasCobrancasService.updatePayment(token, id, updatePaymentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover cobrança na ASAAS' })
  @ApiHeader({
    name: 'access_token',
    description: 'Token de acesso da ASAAS (sandbox ou produção)',
    required: true,
  })
  @ApiResponse({ status: 204, description: 'Cobrança removida com sucesso' })
  async deletePayment(
    @Headers('access_token') token: string,
    @Param('id') id: string,
  ): Promise<void> {
    if (!token) {
      throw new BadRequestException('Token de acesso da ASAAS não fornecido');
    }
    await this.assasCobrancasService.deletePayment(token, id);
  }

  @Post(':id/confirmar')
  @ApiOperation({ summary: 'Confirmar cobrança manualmente' })
  @ApiHeader({
    name: 'access_token',
    description: 'Token de acesso da ASAAS (sandbox ou produção)',
    required: true,
  })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  async confirmPayment(
    @Headers('access_token') token: string,
    @Param('id') id: string,
  ): Promise<PaymentResponseDto> {
    if (!token) {
      throw new BadRequestException('Token de acesso da ASAAS não fornecido');
    }
    return this.assasCobrancasService.confirmPayment(token, id);
  }

  @Post(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar cobrança' })
  @ApiHeader({
    name: 'access_token',
    description: 'Token de acesso da ASAAS (sandbox ou produção)',
    required: true,
  })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  async cancelPayment(
    @Headers('access_token') token: string,
    @Param('id') id: string,
  ): Promise<PaymentResponseDto> {
    if (!token) {
      throw new BadRequestException('Token de acesso da ASAAS não fornecido');
    }
    return this.assasCobrancasService.cancelPayment(token, id);
  }
}