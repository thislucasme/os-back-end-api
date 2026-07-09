import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { ContasPagarController } from './contas-pagar.controller';
import { ContasPagarService } from './contas-pagar.service';
import { ContaPagar } from './entities/conta-pagar.entity';
import { Pagamento } from './entities/pagamento.entity';
import { ContaFinanceira } from 'src/financeiro/contas-financeiras/entities/conta-financeira.entity';
import { MovimentacoesModule } from 'src/movimentacoes/movimentacoes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContaPagar,
      Pagamento,
      ContaFinanceira,
      User,
    ]),
    MovimentacoesModule
  ],
  controllers: [
    ContasPagarController,
  ],
  providers: [
    ContasPagarService,
  ],
})
export class ContasPagarModule {}