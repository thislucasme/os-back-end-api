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

@Module({
    imports: [TypeOrmModule.forFeature([ClienteFornecedor, Company, User])],
    controllers: [
        ClientesFornecedoresController,],
    providers: [
        ClientesFornecedoresService,],
})
export class ClientesFornecedoresModule { }
