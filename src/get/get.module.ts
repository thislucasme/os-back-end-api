import { Module } from '@nestjs/common';
import { GetController } from './get.controller';

@Module({
  controllers: [GetController],
})
export class GetModule {}
