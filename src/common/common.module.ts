
import { Module } from '@nestjs/common';
import { CryptoCertificateService } from './crypto.service';

@Module({
    imports: [],
    controllers: [],
    providers: [CryptoCertificateService],
    exports:[CryptoCertificateService]
})
export class CommonModule {}
