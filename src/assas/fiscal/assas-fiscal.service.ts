import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FiscalInfoQueryDto, FiscalInfoResponseDto } from './fiscal-info.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AssasFiscalInfoService {
    constructor(private readonly httpService: HttpService, private readonly configService: ConfigService) { }

  private  nfseApiUrl(): string {
    return this.configService.get<string>('ASAAS_API_URL') || '';
  }

    private getHeaders() {
        const token = process.env.ASAAS_ACCESS_TOKEN; // Ou process.env.ASAAS_API_KEY dependendo do seu .env

        if (!token) {
            throw new HttpException(
                'Token de acesso do Asaas não configurado nas variáveis de ambiente.',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        return {
            'User-Agent': 'NomeDaSuaAplicacao/1.0.0',
            accept: 'application/json',
            'access_token': token,
            'content-type': 'application/json',
        };
    }

    async listFederalServiceCodes(query?: any): Promise<any> {
        try {
            const termo = query?.codeDescription || query?.description || query?.termo || '';

            // Se não passou termo, retorna a listagem padrão
            if (!termo) {
                const response = await firstValueFrom(
                    this.httpService.get(`${this.nfseApiUrl()}/fiscalInfo/federalServiceCodes`, {
                        headers: this.getHeaders(),
                        params: query,
                    }),
                );
                return response.data;
            }

            // Faz a busca em paralelo: tentando por código E por descrição no Asaas
            const [resCode, resDesc] = await Promise.all([
                firstValueFrom(
                    this.httpService.get(`${this.nfseApiUrl()}/fiscalInfo/federalServiceCodes`, {
                        headers: this.getHeaders(),
                        params: { code: termo, limit: 10 },
                    }),
                ).catch(() => ({ data: { data: [] } })),

                firstValueFrom(
                    this.httpService.get(`${this.nfseApiUrl()}/fiscalInfo/federalServiceCodes`, {
                        headers: this.getHeaders(),
                        params: { description: termo, limit: 10 },
                    }),
                ).catch(() => ({ data: { data: [] } })),
            ]);

            // Junta os resultados e remove duplicados baseados no 'code'
            const listCode = resCode.data?.data || [];
            const listDesc = resDesc.data?.data || [];

            const map = new Map();
            [...listCode, ...listDesc].forEach((item: any) => {
                map.set(item.code, item);
            });

            const combinedData = Array.from(map.values());

            return {
                object: 'list',
                hasMore: false,
                totalCount: combinedData.length,
                limit: 10,
                offset: 0,
                data: combinedData,
            };
        } catch (error) {
            this.handleError(error);
        }
    }

    async listNbsCodes(query?: any): Promise<any> {
        try {
            const termo = query?.codeDescription || query?.description || query?.termo || '';

            // Se houver termo, buscamos usando ele. 
            // Nota: Ajuste a chave do parâmetro de acordo com o que a API do Asaas espera para busca por descrição.
            // Geralmente, se você quer buscar por texto, usa-se 'codeDescription' ou 'description'.
            const params = termo
                ? { codeDescription: termo, limit: 10 }
                : { limit: 10 };

            const response = await firstValueFrom(
                this.httpService.get(`${this.nfseApiUrl()}/fiscalInfo/nbsCodes`, {
                    headers: this.getHeaders(),
                    params: params,
                }),
            );

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: any): never {
        const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const message =
            error.response?.data?.errors?.[0]?.description ||
            error.message ||
            'Erro na comunicação com ASAAS';
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