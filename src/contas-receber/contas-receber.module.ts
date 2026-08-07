import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { ContaReceber } from './entities/conta-receber.entity';
import { Recebimento } from './entities/recebimento.entity';
import { ContasReceberController } from './contas-receber.controller';
import { ContasReceberService } from './contas-receber.service';
import { ContaFinanceira } from 'src/financeiro/contas-financeiras/entities/conta-financeira.entity';
import { MovimentacoesModule } from 'src/movimentacoes/movimentacoes.module';
import { ContaReceberParcela } from './entities/conta-receber-parcela.entity';
import { OrdemServico } from 'src/ordens-servico/entities/ordem-servico.entity';
import { Company } from 'src/companies/ company.entity';
import { UsersModule } from 'src/users/users.module';
import { AssasCobrancasModule } from 'src/assas/cobrancas/assas-cobrancas.module';
import { CompaniesModule } from 'src/companies/companies.module';
import { ClientesFornecedoresModule } from 'src/clientes-fornecedores/clientes-fornecedores.module';

@Module({
  imports: [
    CompaniesModule,
    ClientesFornecedoresModule,
    TypeOrmModule.forFeature([
      ContaReceber,
      Recebimento,
      ContaFinanceira,
      User,
      ContaReceberParcela,
      OrdemServico,
      Company
    ]),
    MovimentacoesModule,
    UsersModule,
    AssasCobrancasModule
  ],
  controllers: [
    ContasReceberController,
  ],
  providers: [
    ContasReceberService,
  ],
})
export class ContasReceberModule { }