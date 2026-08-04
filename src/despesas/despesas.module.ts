import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContaFinanceira } from 'src/financeiro/contas-financeiras/entities/conta-financeira.entity';
import { User } from 'src/users/user.entity';
import { DespesasController } from './despesas.controller';
import { DespesasService } from './despesas.service';
import { Despesa } from './entities/despesa.entity';
import { MovimentacoesModule } from 'src/movimentacoes/movimentacoes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Despesa,
      ContaFinanceira,
      User,
    ]),
    MovimentacoesModule,
  ],
  controllers: [
    DespesasController,
  ],
  providers: [
    DespesasService,
  ],
  exports:[DespesasService]
})
export class DespesasModule {}