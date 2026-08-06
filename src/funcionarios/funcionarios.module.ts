import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { FuncionariosController } from './funcionarios.controller';
import { FuncionariosService } from './funcionarios.service';
import { ClientesAssasModule } from 'src/assas/clientes/clientes-assas.module';
import { CompaniesModule } from 'src/companies/companies.module';
import { CryptoModule } from 'src/assas/cypto/crypto.module';

@Module({
  imports: [CompaniesModule, CryptoModule, ClientesAssasModule,TypeOrmModule.forFeature([User])],
  controllers: [FuncionariosController],
  providers: [FuncionariosService],
  exports: [FuncionariosService],
})
export class FuncionariosModule {}