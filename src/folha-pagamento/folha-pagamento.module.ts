// folha-pagamento.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FolhaPagamentoController } from './folha-pagamento.controller';
import { FolhaPagamentoService } from './folha-pagamento.service';
import { PagamentosModule } from '../pagamentos/pagamentos.module';
import { UsersModule } from '../users/users.module';
import { FolhaPagamento } from './entities/folha-pagamento.entity';
import { User } from 'src/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FolhaPagamento, User]),     forwardRef(() => PagamentosModule),
    forwardRef(() => UsersModule),],
  controllers: [FolhaPagamentoController],
  providers: [FolhaPagamentoService],
})
export class FolhaPagamentoModule {}