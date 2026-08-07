import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesFornecedoresController } from './clientes-fornecedores.controller';
import { ClientesFornecedoresService } from './clientes-fornecedores.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { ClienteFornecedor } from './entities/cliente-fornecedor.entity';
import { Company } from 'src/companies/ company.entity';
import { User } from 'src/users/user.entity';
import { CompaniesModule } from 'src/companies/companies.module';
import { ClientesAssasModule } from 'src/assas/clientes/clientes-assas.module';

@Module({
    imports: [CompaniesModule,ClientesAssasModule, TypeOrmModule.forFeature([ClienteFornecedor, Company, User])],
    controllers: [
        ClientesFornecedoresController,],
    providers: [
        ClientesFornecedoresService,],
        exports:[ClientesFornecedoresService]
})
export class ClientesFornecedoresModule { }
