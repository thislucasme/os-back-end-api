import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { Module } from '@nestjs/common';

@Module({
    imports: [],
    controllers: [
        StorageController,],
    providers: [
        StorageService,],
        exports:[StorageService]
})
export class StorageModule { }
