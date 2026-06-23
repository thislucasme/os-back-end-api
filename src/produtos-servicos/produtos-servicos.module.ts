import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdutosServicosController } from './produtos-servicos.controller';
import { ProdutosServicosService } from './produtos-servicos.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { ClienteFornecedor } from 'src/clientes-fornecedores/entities/cliente-fornecedor.entity';
import { Company } from 'src/companies/ company.entity';
import { User } from 'src/users/user.entity';
import { ProdutoServico } from './entities/produto-servico.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ClienteFornecedor, Company, User, ProdutoServico])],
    controllers: [
        ProdutosServicosController,],
    providers: [
        ProdutosServicosService,],
})
export class ProdutosServicosModule { }
