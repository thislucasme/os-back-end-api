import { AssasCobrancasService } from './assas-cobrancas.service';
import { AssasCobrancasController } from './assas-cobrancas.controller';

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    controllers: [
        AssasCobrancasController,],
    providers: [
        AssasCobrancasService,],
        exports:[AssasCobrancasService]
})
export class AssasCobrancasModule { }
