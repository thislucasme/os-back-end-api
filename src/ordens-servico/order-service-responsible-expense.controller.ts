import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { OrderServiceResponsibleExpenseService } from './order-service-responsible-expense.service';
import { CreateOrderServiceResponsibleExpenseDto } from './dto/expense/create-order-service-responsible-expense.dto';
import { ListOrderServiceResponsibleExpenseDto } from './dto/responsible/list-order-service-responsible-expense.dto';
import { UpdateOrderServiceResponsibleExpenseDto } from './dto/expense/update-order-service-responsible-expense.dto';

@Controller('order-services/:orderServiceId/responsibles/:responsibleId/expenses')
export class OrderServiceResponsibleExpenseController {
  constructor(private readonly expenseService: OrderServiceResponsibleExpenseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('orderServiceId', ParseIntPipe) orderServiceId: number,
    @Param('responsibleId', ParseIntPipe) responsibleId: number,
    @Body() dto: CreateOrderServiceResponsibleExpenseDto,
  ) {
    return this.expenseService.create(orderServiceId, responsibleId, dto);
  }

  @Get()
  findAll(
    @Param('orderServiceId', ParseIntPipe) orderServiceId: number,
    @Param('responsibleId', ParseIntPipe) responsibleId: number,
    @Query() query: ListOrderServiceResponsibleExpenseDto,
  ) {
    return this.expenseService.findAll(orderServiceId, responsibleId, query);
  }

  @Get(':expenseId')
  findOne(
    @Param('orderServiceId', ParseIntPipe) orderServiceId: number,
    @Param('responsibleId', ParseIntPipe) responsibleId: number,
    @Param('expenseId', ParseIntPipe) expenseId: number,
  ) {
    return this.expenseService.findOne(orderServiceId, responsibleId, expenseId);
  }

  @Patch(':expenseId')
  update(
    @Param('orderServiceId', ParseIntPipe) orderServiceId: number,
    @Param('responsibleId', ParseIntPipe) responsibleId: number,
    @Param('expenseId', ParseIntPipe) expenseId: number,
    @Body() dto: UpdateOrderServiceResponsibleExpenseDto,
  ) {
    return this.expenseService.update(orderServiceId, responsibleId, expenseId, dto);
  }

  @Delete(':expenseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('orderServiceId', ParseIntPipe) orderServiceId: number,
    @Param('responsibleId', ParseIntPipe) responsibleId: number,
    @Param('expenseId', ParseIntPipe) expenseId: number,
  ) {
    return this.expenseService.remove(orderServiceId, responsibleId, expenseId);
  }

    @Get()
  findAllByOrderService(
    @Param('orderServiceId', ParseIntPipe) orderServiceId: number,
    @Query() query: ListOrderServiceResponsibleExpenseDto,
  ) {
    return this.expenseService.findAllByOrderService(orderServiceId, query);
  }
}