import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { ContaReceber } from './entities/conta-receber.entity';
import { Recebimento } from './entities/recebimento.entity';
import { ContasReceberController } from './contas-receber.controller';
import { ContasReceberService } from './contas-receber.service';
import { ContaFinanceira } from 'src/financeiro/contas-financeiras/entities/conta-financeira.entity';
import { MovimentacoesModule } from 'src/movimentacoes/movimentacoes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
 ContaReceber,
      Recebimento,
      ContaFinanceira,
      User,
    ]),
    MovimentacoesModule
  ],
  controllers: [
    ContasReceberController,
  ],
  providers: [
    ContasReceberService,
  ],
})
export class ContasReceberModule {}