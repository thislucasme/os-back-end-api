import { HttpService } from '@nestjs/axios';
import { forwardRef, HttpException, HttpStatus, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ASAAS_API_URL } from '../assas.constants';
import { ConfigService } from '@nestjs/config';
import { CompaniesService } from 'src/companies/companies.service';
import { AsaasWebhookDto, PaymentDto } from './dtos/asaas-webhook.dto';
import { ContasReceberService } from 'src/contas-receber/contas-receber.service';

@Injectable()
export class WebhookService {
    constructor(private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly contasAreceberService: ContasReceberService,
        private readonly companyService: CompaniesService
    ) { }
    private readonly logger = new Logger(WebhookService.name);


    async process(companyId: string, payload: AsaasWebhookDto, headers: Record<string, string>) {
        // 1. VALIDAÇÃO DE SEGURANÇA (Se falhar aqui, o Asaas PODE tentar de novo ou bloquear se o token estiver errado)
        const incomingWebhookToken = headers['asaas-access-token'];
        const incomingWebhookTokenFromCompany = await this.getTokenByCompanyId(companyId);
        console.log("TOKEN DO BANCO", incomingWebhookTokenFromCompany)
        if (!incomingWebhookTokenFromCompany) {
            this.logger.warn(`Tentativa de webhook para empresa desconhecida ou sem token: ${companyId}`);
            throw new UnauthorizedException('Empresa não autorizada ou token não encontrado');
        }

        if (incomingWebhookTokenFromCompany !== incomingWebhookToken) {
            this.logger.warn(`Falha de autenticação no webhook: Token inválido para a empresa ID ${companyId}`);
            throw new UnauthorizedException('Token de webhook inválido ou não autorizado.');
        }

        // A partir daqui, a requisição é legítima (veio do Asaas com o token certo).
        // Qualquer evento processado abaixo deve retornar SUCESSO (200 OK) para limpar a fila deles.

        if (!payload || !payload.event) {
            this.logger.warn(`Webhook recebido sem payload ou evento para a empresa ${companyId}`);
            return { received: true }; // Retorna 200 OK
        }

        this.logger.log(`Evento recebido para a empresa ${companyId}: ${payload.event}`);

        // 2. PROCESSAMENTO PROTEGIDO CONTRA FALHAS DE NEGÓCIO
        try {
            switch (payload.event) {
                case 'PAYMENT_RECEIVED':
                    if (!payload.payment?.id) break;
                    await this.paymentReceived(companyId, payload.payment);
                    break;

                case 'PAYMENT_CONFIRMED':
                    if (!payload.payment?.id) break;
                    await this.paymentConfirmed(companyId, payload.payment);
                    break;

                case 'PAYMENT_OVERDUE':
                    if (!payload.payment?.id) break;
                    await this.paymentOverdue(companyId, payload.payment);
                    break;

                case 'PAYMENT_DELETED':
                    if (!payload.payment?.id) break;
                    await this.paymentDeleted(companyId, payload.payment);
                    break;

                default:
                    this.logger.warn(`Evento ignorado: ${payload.event}`);
            }
        } catch (error) {
            // Se a parcela não for encontrada ou houver um erro de regra de negócio,
            // nós logamos o erro para investigarmos, mas NÃO jogamos erro para cima.
            // Assim, a API retorna 200 OK e o Asaas não fica reenviando à toa.
            this.logger.error(`Erro ao processar o evento ${payload.event} (Empresa ${companyId}): ${error}`);
        }

        // Retorno padrão de sucesso para o Asaas (HTTP 200)
        return { received: true };
    }

    /**
     * Busca no seu banco de dados o token Asaas correspondente à empresa
     */
    private async getTokenByCompanyId(companyId: string): Promise<string | null> {
        const webHookToken = await this.companyService.getWebHookTokenByCompanyId(Number(companyId))
        if (!webHookToken) {
            return null
        }

        return webHookToken;
    }

    private async paymentReceived(companyId: string, payment: PaymentDto) {
        // Se por acaso o id vier nulo, interrompe a execução com segurança
        if (!payment.id) {
            this.logger.warn(`Tentativa de processar pagamento sem ID para a empresa ${companyId}`);
            return;
        }

        this.logger.log(`Processando pagamento recebido ID: ${payment.id} para a empresa ${companyId}`);

        const valorRecebido = Number(payment.value ?? payment.value ?? 0);

        if (valorRecebido <= 0) {
            this.logger.warn(`Pagamento ${payment.id} possui valor inválido ou zero.`);
            return;
        }

        // Usamos 'payment.id as string' pois já validamos acima que ele não é nulo/undefined
        await this.contasAreceberService.receberParcelaPorAsaasId(
            Number(companyId),
            payment.id as string,
            valorRecebido,
            payment.paymentDate ?? undefined
        );

        this.logger.log(`Parcela referente ao pagamento Asaas ${payment.id} baixada com sucesso!`);
    }

    private async paymentConfirmed(companyId: string, payment: any) {
        // atualizar status
    }

    private async paymentOverdue(companyId: string, payment: any) {
        // marcar vencido
    }

    private async paymentDeleted(companyId: string, payment: any) {
        // remover ou cancelar
    }

    private getHeaders(token: string) {
        return {
            'User-Agent': 'NomeDaSuaAplicacao/1.0.0',
            accept: 'application/json',
            'access_token': token,
            'content-type': 'application/json',
        };
    }

    async createOrUpdateWebhook(token: string, companyId: string) {

        try {
            const appUrl = this.configService.get<string>('APP_URL') || 'https://seu-dominio.com';
            const webhookUrl = `${appUrl}/webhooks/asaas-v2/${companyId}`;

            const payload = {
                url: webhookUrl,
                email: 'seu-email-de-notificacao@suaempresa.com',
                enabled: true,
                interrupted: false,
                apiVersion: 3,
                sendType: 'SEQUENTIALLY',
            };

            const response = await firstValueFrom(
                this.httpService.post(
                    `${ASAAS_API_URL}/webhook`,
                    payload,
                    { headers: this.getHeaders(token) },
                ),
            );

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async getWebhook(token: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${ASAAS_API_URL}/webhook`, {
                    headers: this.getHeaders(token),
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: any): never {
        const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const message = error.response?.data?.errors?.[0]?.description || error.message || 'Erro ao configurar webhook no ASAAS';
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