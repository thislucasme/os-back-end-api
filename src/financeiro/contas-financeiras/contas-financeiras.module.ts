import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { ContasFinanceirasController } from './contas-financeiras.controller';
import { ContasFinanceirasService } from './contas-financeiras.service';
import { ContaFinanceira } from './entities/conta-financeira.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContaFinanceira,
      User,
    ]),
  ],
  controllers: [
    ContasFinanceirasController,
  ],
  providers: [
    ContasFinanceirasService,
  ],
  exports: [
    ContasFinanceirasService,
  ],
})
export class ContasFinanceirasModule {}