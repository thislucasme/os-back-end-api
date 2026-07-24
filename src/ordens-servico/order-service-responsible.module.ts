import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderServiceResponsible } from './entities/order-service-responsible.entity';
import { User } from 'src/users/user.entity';
import { OrdemServico } from './entities/ordem-servico.entity';
import { OrderServiceResponsibleController } from './order-service-responsible.controller';
import { OrderServiceResponsibleService } from './order-service-responsible.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderServiceResponsible, OrdemServico, User])],
  controllers: [OrderServiceResponsibleController],
  providers: [OrderServiceResponsibleService],
  exports: [OrderServiceResponsibleService],
})
export class OrderServiceResponsibleModule {}