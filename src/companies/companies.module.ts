import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { Company } from './ company.entity';
import { User } from 'src/users/user.entity';
import { ClienteFornecedor } from 'src/clientes-fornecedores/entities/cliente-fornecedor.entity';
import { CryptoModule } from 'src/assas/cypto/crypto.module';
import { WebhookModule } from 'src/assas/webhook/webhook.module';

@Module({
  imports: [CryptoModule,  forwardRef(() => WebhookModule), TypeOrmModule.forFeature([Company, User, ClienteFornecedor])],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}