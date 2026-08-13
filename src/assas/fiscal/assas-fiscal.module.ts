

import { Module } from '@nestjs/common';
import { AssasFiscalInfoController } from './assas-fiscal.controller';
import { AssasFiscalInfoService } from './assas-fiscal.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    controllers: [
        AssasFiscalInfoController,],
    providers: [
        AssasFiscalInfoService,],
})
export class AssasFiscalModule { }
