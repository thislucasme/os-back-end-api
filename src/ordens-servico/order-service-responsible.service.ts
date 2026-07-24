import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderServiceResponsible } from './entities/order-service-responsible.entity';
import { OrdemServico } from './entities/ordem-servico.entity';
import { User } from 'src/users/user.entity';
import { CreateOrderServiceResponsibleDto } from './dto/responsible/create-order-service-responsible.dto';
import { ListOrderServiceResponsibleDto } from './dto/responsible/list-order-service-responsible.dto';
import { UpdateOrderServiceResponsibleDto } from './dto/responsible/update-order-service-responsible.dto';
@Injectable()
export class OrderServiceResponsibleService {
  constructor(
    @InjectRepository(OrderServiceResponsible)
    private readonly responsibleRepo: Repository<OrderServiceResponsible>,
    @InjectRepository(OrdemServico)
    private readonly orderServiceRepo: Repository<OrdemServico>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(orderServiceId: number, dto: CreateOrderServiceResponsibleDto): Promise<{ id: number }> {
    const orderService = await this.orderServiceRepo.findOne({ where: { id: orderServiceId } });
    if (!orderService) {
      throw new NotFoundException('Ordem de serviço não encontrada');
    }

    const employee = await this.userRepo.findOne({ where: { id: dto.employeeId } });
    if (!employee) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    const existing = await this.responsibleRepo.findOne({
      where: { orderServiceId, employeeId: dto.employeeId },
    });
    if (existing) {
      throw new ConflictException('Funcionário já adicionado a esta OS');
    }

    const responsible = this.responsibleRepo.create({
      orderServiceId,
      employeeId: dto.employeeId,
      productCommissionType: dto.productCommissionType,
      productCommissionValue: dto.productCommissionValue,
      serviceCommissionType: dto.serviceCommissionType,
      serviceCommissionValue: dto.serviceCommissionValue,
    });

    const saved = await this.responsibleRepo.save(responsible);
    return { id: saved.id };
  }

  async findAll(orderServiceId: number, query: ListOrderServiceResponsibleDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const qb = this.responsibleRepo.createQueryBuilder('r')
      .leftJoinAndSelect('r.employee', 'employee')
      .where('r.orderServiceId = :orderServiceId', { orderServiceId });

    if (search) {
      qb.andWhere('employee.name ILIKE :search', { search: `%${search}%` });
    }

    const [data, total] = await qb
      .skip(skip)
      .take(limit)
      .orderBy('r.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(orderServiceId: number, id: number): Promise<OrderServiceResponsible> {
    const responsible = await this.responsibleRepo.findOne({
      where: { id, orderServiceId },
      relations: { employee: true }, // corrigido: objeto, não array
    });
    if (!responsible) {
      throw new NotFoundException('Responsável não encontrado nesta OS');
    }
    return responsible;
  }

  async update(orderServiceId: number, id: number, dto: UpdateOrderServiceResponsibleDto) {
    const responsible = await this.findOne(orderServiceId, id);
    Object.assign(responsible, dto);
    await this.responsibleRepo.save(responsible);
    return { id: responsible.id };
  }

  async remove(orderServiceId: number, id: number): Promise<void> {
    const responsible = await this.findOne(orderServiceId, id);
    await this.responsibleRepo.remove(responsible);
  }
}