import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderServiceResponsibleExpense } from './entities/order-service-responsible-expense.entity';
import { OrderServiceResponsible } from './entities/order-service-responsible.entity';
import { CreateOrderServiceResponsibleExpenseDto } from './dto/expense/create-order-service-responsible-expense.dto';
import { ListOrderServiceResponsibleExpenseDto } from './dto/responsible/list-order-service-responsible-expense.dto';
import { UpdateOrderServiceResponsibleExpenseDto } from './dto/expense/update-order-service-responsible-expense.dto';

@Injectable()
export class OrderServiceResponsibleExpenseService {
  constructor(
    @InjectRepository(OrderServiceResponsibleExpense)
    private readonly expenseRepo: Repository<OrderServiceResponsibleExpense>,
    @InjectRepository(OrderServiceResponsible)
    private readonly responsibleRepo: Repository<OrderServiceResponsible>,
  ) {}

  async create(orderServiceId: number, responsibleId: number, dto: CreateOrderServiceResponsibleExpenseDto) {
    const responsible = await this.responsibleRepo.findOne({
      where: { id: responsibleId, orderServiceId },
    });
    if (!responsible) {
      throw new NotFoundException('Responsável não encontrado nesta OS');
    }

    const expense = this.expenseRepo.create({
      orderServiceResponsibleId: responsibleId,
      expenseTypeId: dto.expenseTypeId,
      amount: dto.amount,
      description: dto.description,
      assignToOrderService: dto.assignToOrderService,
    });

    const saved = await this.expenseRepo.save(expense);
    return { id: saved.id };
  }

  async findAll(orderServiceId: number, responsibleId: number, query: ListOrderServiceResponsibleExpenseDto) {
    const { page = 1, limit = 10, assignToOrderService } = query;
    const skip = (page - 1) * limit;

    const responsible = await this.responsibleRepo.findOne({
      where: { id: responsibleId, orderServiceId },
    });
    if (!responsible) {
      throw new NotFoundException('Responsável não encontrado nesta OS');
    }

    const qb = this.expenseRepo.createQueryBuilder('e')
      .where('e.orderServiceResponsibleId = :responsibleId', { responsibleId });

    if (assignToOrderService !== undefined) {
      qb.andWhere('e.assignToOrderService = :assignToOrderService', { assignToOrderService });
    }

    const [data, total] = await qb
      .skip(skip)
      .take(limit)
      .orderBy('e.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(orderServiceId: number, responsibleId: number, expenseId: number): Promise<OrderServiceResponsibleExpense> {
    const responsible = await this.responsibleRepo.findOne({
      where: { id: responsibleId, orderServiceId },
    });
    if (!responsible) {
      throw new NotFoundException('Responsável não encontrado nesta OS');
    }

    const expense = await this.expenseRepo.findOne({
      where: { id: expenseId, orderServiceResponsibleId: responsibleId },
    });
    if (!expense) {
      throw new NotFoundException('Gasto não encontrado');
    }
    return expense;
  }

  async update(orderServiceId: number, responsibleId: number, expenseId: number, dto: UpdateOrderServiceResponsibleExpenseDto) {
    const expense = await this.findOne(orderServiceId, responsibleId, expenseId);
    Object.assign(expense, dto);
    await this.expenseRepo.save(expense);
    return { id: expense.id };
  }

  async remove(orderServiceId: number, responsibleId: number, expenseId: number): Promise<void> {
    const expense = await this.findOne(orderServiceId, responsibleId, expenseId);
    await this.expenseRepo.remove(expense);
  }

  // order-service-responsible-expense.service.ts

async findAllByOrderService(
  orderServiceId: number,
  query: ListOrderServiceResponsibleExpenseDto,
) {
  const { page = 1, limit = 10, assignToOrderService } = query;
  const skip = (page - 1) * limit;

  const qb = this.expenseRepo
    .createQueryBuilder('e')
    .innerJoin('e.responsible', 'r')  
    .where('r.orderServiceId = :orderServiceId', { orderServiceId });

  if (assignToOrderService !== undefined) {
    qb.andWhere('e.assignToOrderService = :assignToOrderService', {
      assignToOrderService,
    });
  }

  const [data, total] = await qb
    .skip(skip)
    .take(limit)
    .orderBy('e.createdAt', 'DESC')
    .getManyAndCount();

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
}