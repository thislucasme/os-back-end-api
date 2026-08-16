import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from 'src/companies/ company.entity';
import { User } from 'src/users/user.entity';
import { CompanyFiscalController } from './company-fiscal.controller';
import { CompanyFiscalServiceManager } from './company-fiscal.service';
import { CompanyFiscalService } from './company-service.entity';
import { CompanyFiscalSettings } from './entities/company-fiscal-settings.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule,
    TypeOrmModule.forFeature([ CompanyFiscalService,CompanyFiscalSettings, Company, User]),
  ],
  controllers: [CompanyFiscalController],
  providers: [CompanyFiscalServiceManager],
  exports: [CompanyFiscalServiceManager],
})
export class CompanyFiscalModule {}