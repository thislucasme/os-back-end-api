import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContaFinanceira } from 'src/financeiro/contas-financeiras/entities/conta-financeira.entity';
import { User } from 'src/users/user.entity';
import { Transferencia } from './entities/transferencia.entity';
import { TransferenciasController } from './transferencias.controller';
import { TransferenciasService } from './transferencias.service';
import { MovimentacoesModule } from 'src/movimentacoes/movimentacoes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transferencia,
      ContaFinanceira,
      User,
    ]),
    MovimentacoesModule,
  ],
  controllers: [
    TransferenciasController,
  ],
  providers: [
    TransferenciasService,
  ],
})
export class TransferenciasModule {}