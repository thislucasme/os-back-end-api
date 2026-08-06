import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { ClientesAssasController } from './clientes-assas.controller';
import { ClientesAssasService } from './clientes-assas.service';

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [ClientesAssasController],
  providers: [ClientesAssasService],
  exports:[ClientesAssasService]
})
export class ClientesAssasModule {}