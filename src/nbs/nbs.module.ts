import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NbsService } from './nbs.service';
import { NbsEntity } from './entities/nbs.entity';
import { NbsInitializer } from './nbs.inicializer';
import { ServicoNacionalEntity } from './entities/servico-nacional.entity';
import { SincronizacaoService } from './sincronizacao.service';
import { TributosController } from './tributos.controller';
import { TributosService } from './tributos.service';

@Module({
  imports: [TypeOrmModule.forFeature([NbsEntity, ServicoNacionalEntity])],
  providers: [NbsService, NbsInitializer, SincronizacaoService, TributosService],
  exports: [NbsService],
  controllers:[TributosController]
})
export class NbsModule {}