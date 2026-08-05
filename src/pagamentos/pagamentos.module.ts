import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { ItemOsResponsavel } from '../ordens-servico/entities/item-os-responsavel.entity';
import { OrderServiceResponsibleExpense } from '../ordens-servico/entities/order-service-responsible-expense.entity'; // ajuste caminho
import { PagamentosController } from './pagamentos.controller';
import { PagamentosService } from './pagamentos.service';
import { UsersModule } from 'src/users/users.module';
import { OrderServiceResponsible } from 'src/ordens-servico/entities/order-service-responsible.entity';
import { ItemOs } from 'src/ordens-servico/entities/item-os.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User, ItemOsResponsavel, OrderServiceResponsibleExpense, OrderServiceResponsible, ItemOs]),
  ],
  controllers: [PagamentosController],
  providers: [PagamentosService],
})
export class PagamentosModule {}