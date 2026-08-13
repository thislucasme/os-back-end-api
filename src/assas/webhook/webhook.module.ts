import { HttpModule } from '@nestjs/axios';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

import { forwardRef, Module } from '@nestjs/common';
import { CompaniesModule } from 'src/companies/companies.module';
import { ContasReceberModule } from 'src/contas-receber/contas-receber.module';

@Module({
    imports: [HttpModule, forwardRef(() => CompaniesModule), ContasReceberModule],
    controllers: [
        WebhookController,],
    providers: [
        WebhookService,],
        exports:[WebhookService]
})
export class WebhookModule { }
