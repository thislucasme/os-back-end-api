// src/propostas/propostas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PropostasController } from './propostas.controller';
import { PropostasService } from './propostas.service';
import { Proposta } from 'src/ordens-servico/entities/proposta.entity';
import { PropostaItem } from 'src/ordens-servico/entities/proposta-item.entity';
import { OrdemServico } from 'src/ordens-servico/entities/ordem-servico.entity';
import { User } from 'src/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Proposta, PropostaItem, OrdemServico, User])],
  controllers: [PropostasController],
  providers: [PropostasService],
  exports: [PropostasService],
})
export class PropostasModule {}