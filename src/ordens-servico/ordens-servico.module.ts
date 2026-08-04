import { forwardRef, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { OrdemServicoAnexo } from './entities/ordem-servico-anexo.entity';
import { OrdemServicoHistorico } from './entities/ordem-servico-historico.entity';
import { OrdemServico } from './entities/ordem-servico.entity';
import { OrdensServicoController } from './ordens-servico.controller';
import { OrdensServicoService } from './ordens-servico.service';
import { Proposta } from './entities/proposta.entity';
import { OrdemServicoItem } from './entities/ordem-servico-item.entity';
import { PropostaItem } from './entities/proposta-item.entity';
import { User } from 'src/users/user.entity';
import { OrderServiceResponsibleModule } from './order-service-responsible.module';
import { OrderServiceResponsibleExpenseModule } from './order-service-responsible-expense.module';
import { ItemOs } from './entities/item-os.entity';
import { ItensOsController } from './itens-os.controller';
import { ItensOsService } from './itens-os.service';
import { ProdutoServico } from 'src/produtos-servicos/entities/produto-servico.entity';
import { ItemOsResponsavel } from './entities/item-os-responsavel.entity';
import { DespesasModule } from 'src/despesas/despesas.module';
@Module({
  imports: [
      forwardRef(() => DespesasModule),
      OrderServiceResponsibleModule,
      OrderServiceResponsibleExpenseModule,
    TypeOrmModule.forFeature([
      OrdemServico,
      OrdemServicoItem,
      OrdemServicoAnexo,
      OrdemServicoHistorico,
      Proposta,
      PropostaItem,
      User,
      ItemOs, 
      ProdutoServico,
      ItemOsResponsavel
    ]),

    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/os',
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}`;

          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [OrdensServicoController, ItensOsController],
  providers: [OrdensServicoService, ItensOsService],
  exports: [OrdensServicoService],
})
export class OrdensServicoModule {}