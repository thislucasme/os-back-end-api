import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { ClienteResponseDto } from './dto/cliente-response.dto';

import { ConfigService } from '@nestjs/config';


@Injectable()
export class ClientesAssasService {
    constructor(private readonly httpService: HttpService, private readonly configService: ConfigService) { }

  private  nfseApiUrl(): string {
    return this.configService.get<string>('ASAAS_API_URL') || '';
  }

    private getHeaders(token: string) {
        return {
            'User-Agent': 'NomeDaSuaAplicacao/1.0.0',
            accept: 'application/json',
            'access_token': token,
            'content-type': 'application/json',
        };
    }

    async create(token: string, data: CreateClienteDto): Promise<ClienteResponseDto> {
        try {

            const existingCustomer = await this.findByCpfCnpj(
                token,
                data.cpfCnpj,
            );

            if (existingCustomer) {
                return existingCustomer;
            }

            const response = await firstValueFrom(
                this.httpService.post<ClienteResponseDto>(
                    `${this.nfseApiUrl()}/customers`,
                    data,
                    {
                        headers: this.getHeaders(token),
                    },
                ),
            );

            return response.data;

        } catch (error) {
            this.handleError(error);
        }
    }

    async findAll(
        token: string,
        query?: { limit?: number; offset?: number; name?: string; cpfCnpj?: string; email?: string; externalReference?: string }
    ): Promise<{ data: ClienteResponseDto[]; totalCount: number; limit: number; offset: number }> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.nfseApiUrl()}/customers`, {
                    headers: this.getHeaders(token),
                    params: query,
                })
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async findOne(token: string, id: string): Promise<ClienteResponseDto> {
        try {
            const response = await firstValueFrom(
                this.httpService.get<ClienteResponseDto>(`${this.nfseApiUrl()}/customers/${id}`, {
                    headers: this.getHeaders(token),
                })
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async update(token: string, id: string, data: UpdateClienteDto): Promise<ClienteResponseDto> {
        try {
            const response = await firstValueFrom(
                this.httpService.put<ClienteResponseDto>(`${this.nfseApiUrl()}/customers/${id}`, data, {
                    headers: this.getHeaders(token),
                })
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async remove(token: string, id: string): Promise<void> {
        try {
            await firstValueFrom(
                this.httpService.delete(`${this.nfseApiUrl()}/customers/${id}`, {
                    headers: this.getHeaders(token),
                })
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    async findByCpfCnpj(token: string, cpfCnpj: string): Promise<ClienteResponseDto | null> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.nfseApiUrl()}/customers`, {
                    headers: this.getHeaders(token),
                    params: {
                        cpfCnpj,
                    },
                }),
            );

            if (response.data.totalCount > 0) {
                return response.data.data[0];
            }

            return null;

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