import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { MovimentacoesController } from './movimentacoes.controller';
import { MovimentacoesService } from './movimentacoes.service';
import { MovimentacaoFinanceira } from './entities/movimentacao-financeira.entity';
import { ContaFinanceira } from 'src/financeiro/contas-financeiras/entities/conta-financeira.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MovimentacaoFinanceira,
      ContaFinanceira,
      User,
    ]),
  ],
  controllers: [
    MovimentacoesController,
  ],
  providers: [
    MovimentacoesService,
  ],
  exports: [
    MovimentacoesService,
  ],
})
export class MovimentacoesModule {}