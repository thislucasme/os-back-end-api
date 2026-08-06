import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { ASAAS_API_URL } from '../assas.constants';
import { PaymentResponseDto } from './dtos/payment-response.dto';
import { UpdatePaymentDto } from './dtos/update-payment.dto';

@Injectable()
export class AssasCobrancasService {
  constructor(private readonly httpService: HttpService) {}

  private getHeaders(token: string) {
    return {
      'User-Agent': 'NomeDaSuaAplicacao/1.0.0',
      accept: 'application/json',
      'access_token': token,
      'content-type': 'application/json',
    };
  }

  async createPayment(token: string, data: CreatePaymentDto): Promise<PaymentResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<PaymentResponseDto>(`${ASAAS_API_URL}/payments`, data, {
          headers: this.getHeaders(token),
        })
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAllPayments(
    token: string,
    query?: {
      limit?: number;
      offset?: number;
      customer?: string;
      billingType?: string;
      status?: string;
      dueDate?: string;
      externalReference?: string;
    }
  ): Promise<{ data: PaymentResponseDto[]; totalCount: number; limit: number; offset: number }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${ASAAS_API_URL}/payments`, {
          headers: this.getHeaders(token),
          params: query,
        })
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findPaymentById(token: string, id: string): Promise<PaymentResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<PaymentResponseDto>(`${ASAAS_API_URL}/payments/${id}`, {
          headers: this.getHeaders(token),
        })
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updatePayment(token: string, id: string, data: UpdatePaymentDto): Promise<PaymentResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.put<PaymentResponseDto>(`${ASAAS_API_URL}/payments/${id}`, data, {
          headers: this.getHeaders(token),
        })
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deletePayment(token: string, id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.delete(`${ASAAS_API_URL}/payments/${id}`, {
          headers: this.getHeaders(token),
        })
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  // Extra: confirmar pagamento (se necessário)
  async confirmPayment(token: string, id: string): Promise<PaymentResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<PaymentResponseDto>(
          `${ASAAS_API_URL}/payments/${id}/confirm`,
          {},
          { headers: this.getHeaders(token) }
        )
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Extra: cancelar pagamento
  async cancelPayment(token: string, id: string): Promise<PaymentResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<PaymentResponseDto>(
          `${ASAAS_API_URL}/payments/${id}/cancel`,
          {},
          { headers: this.getHeaders(token) }
        )
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error.response?.data?.errors?.[0]?.description || error.message || 'Erro na comunicação com ASAAS';
    throw new HttpException(
      {
        statusCode: status,
        message,
        errors: error.response?.data?.errors || [],
      },
      status,
    );
  }
}