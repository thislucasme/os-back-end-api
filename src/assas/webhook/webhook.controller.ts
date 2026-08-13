import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    Param,
    Post,
} from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { ConfigService } from '@nestjs/config';
import { CreateWebhookConfigDto } from './dtos/create-webhook-config.dto';
import { AsaasWebhookDto } from './dtos/asaas-webhook.dto';

@ApiTags('Webhook')
@Controller('webhooks/asaas-v2')
export class WebhookController {
    constructor(
        private readonly webhookService: WebhookService,
    ) { }

@Post(':companyId')
    @HttpCode(200)
    @ApiOperation({ 
        summary: 'Recebe webhooks do Asaas', 
        description: 'Endpoint responsável por processar os eventos de cobrança enviados pelo Asaas (pagamentos recebidos, confirmados, vencidos, etc).' 
    })
    @ApiParam({ 
        name: 'companyId', 
        description: 'ID interno da empresa no sistema', 
        example: '12' 
    })
    @ApiHeader({ 
        name: 'asaas-access-token', 
        description: 'Token de segurança enviado pelo Asaas no header', 
        required: true,
        example: 'seu_token_aqui' 
    })
    @ApiBody({ 
        type: AsaasWebhookDto, 
        description: 'Payload enviado pelo Asaas contendo os dados do evento e do pagamento' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Webhook processado com sucesso ou ignorado de forma segura (retorna 200 para liberar a fila do Asaas).' 
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Token de acesso inválido ou empresa não autorizada.' 
    })
    async receive(
        @Param('companyId') companyId: string,
        @Body() body: AsaasWebhookDto, // Tipado com o DTO para o Swagger reconhecer o schema
        @Headers() headers: Record<string, string>,
    ) {
        console.log('COMPANY ID:', companyId);
        console.log('HEADERS:', headers);
        console.log('BODY:', body);

        await this.webhookService.process(companyId, body, headers);

        return { received: true };
    }

    @Post('create-webhook')
    @ApiOperation({ summary: 'Cadastrar ou configurar o webhook automaticamente na conta ASAAS' })
    @ApiHeader({
        name: 'access_token',
        description: 'Token de acesso da ASAAS do cliente',
        required: true,
    })
    @ApiBody({ type: CreateWebhookConfigDto })
    @ApiResponse({ status: 201, description: 'Webhook configurado com sucesso' })
    async configureWebhook(
        @Headers('access_token') token: string,
        @Body() body: CreateWebhookConfigDto, 
    ) {
        if (!token) {
            throw new BadRequestException('Token de acesso da ASAAS não fornecido');
        }
        if (!body.companyId) { // Ajustado para companyId
            throw new BadRequestException('O ID da empresa é obrigatório');
        }


        return this.webhookService.createOrUpdateWebhook(token, body.companyId);
    }

    @Get()
    @ApiOperation({ summary: 'Verificar webhook configurado na ASAAS' })
    @ApiHeader({
        name: 'access_token',
        description: 'Token de acesso da ASAAS do cliente',
        required: true,
    })
    @ApiResponse({ status: 200, description: 'Detalhes do webhook atual na ASAAS' })
    async getWebhook(@Headers('access_token') token: string) {
        if (!token) {
            throw new BadRequestException('Token de acesso da ASAAS não fornecido');
        }
        return this.webhookService.getWebhook(token);
    }
}