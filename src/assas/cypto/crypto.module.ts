import { CryptoCertificateService } from './../../common/crypto.service';
import { CryptoController } from './crypto.controller';
import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';

@Module({
    imports: [],
    controllers: [
        CryptoController,],
    providers: [
        CryptoService,],
    exports: [CryptoService]
})
export class CryptoModule { }
