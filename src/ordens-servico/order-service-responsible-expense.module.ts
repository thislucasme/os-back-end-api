import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderServiceResponsibleExpense } from './entities/order-service-responsible-expense.entity';
import { OrderServiceResponsible } from './entities/order-service-responsible.entity';
import { OrderServiceResponsibleExpenseController } from './order-service-responsible-expense.controller';
import { OrderServiceResponsibleExpenseService } from './order-service-responsible-expense.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderServiceResponsibleExpense, OrderServiceResponsible])],
  controllers: [OrderServiceResponsibleExpenseController],
  providers: [OrderServiceResponsibleExpenseService],
  exports: [OrderServiceResponsibleExpenseService],
})
export class OrderServiceResponsibleExpenseModule {}