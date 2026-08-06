import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { Company } from './ company.entity';
import { User } from 'src/users/user.entity';
import { ClienteFornecedor } from 'src/clientes-fornecedores/entities/cliente-fornecedor.entity';
import { CryptoModule } from 'src/assas/cypto/crypto.module';

@Module({
  imports: [CryptoModule,TypeOrmModule.forFeature([Company, User, ClienteFornecedor])],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}