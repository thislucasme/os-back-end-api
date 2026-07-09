import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Proposta } from 'src/ordens-servico/entities/proposta.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Proposta])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}