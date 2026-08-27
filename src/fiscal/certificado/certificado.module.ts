    import { TypeOrmModule } from '@nestjs/typeorm';
    import { CertificadoController } from './certificado.controller';
    import { CertificadoService } from './certificado.service';

    import { Module } from '@nestjs/common';
    import { Certificate } from './entities/certificado.entity';
    import { User } from 'src/users/user.entity';
    import { CommonModule } from 'src/common/common.module';
import { CryptoCertificateService } from 'src/common/crypto.service';
import { CompanyFiscalModule } from '../company-fiscal.module';
import { HttpModule } from '@nestjs/axios';

    @Module({
        imports: [HttpModule, CommonModule,CompanyFiscalModule, TypeOrmModule.forFeature([ Certificate, User])],
        controllers: [
            CertificadoController,],
        providers: [
            CertificadoService, CryptoCertificateService],
    })
    export class CertificadoModule { }
