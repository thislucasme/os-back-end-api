import { CryptoService } from './crypto.service';
import { CryptoController } from './crypto.controller';
import { Module } from '@nestjs/common';

@Module({
    imports: [],
    controllers: [
        CryptoController,],
    providers: [
        CryptoService,],
        exports:[CryptoService]
})
export class CryptoModule { }
