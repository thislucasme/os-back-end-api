import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/user.entity';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';

@Injectable()
export class FuncionariosService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private async getCompanyIdFromRequestUser(requestUser: any): Promise<number> {
    const userId = requestUser?.id;

    if (!userId) {
      throw new ForbiddenException('Usuário inválido no token.');
    }

    const user = await this.usersRepository.findOne({
      where: {
        id: Number(userId),
      },
      select: {
        id: true,
        companyId: true,
      },
    });

    if (!user) {
      throw new ForbiddenException('Usuário não encontrado.');
    }

    if (!user.companyId) {
      throw new ForbiddenException('Usuário não possui empresa vinculada.');
    }

    return user.companyId;
  }

  async create(requestUser: any, dto: CreateFuncionarioDto) {
    const companyId = await this.getCompanyIdFromRequestUser(requestUser);

    const exists = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (exists) {
      throw new ConflictException('E-mail já cadastrado.');
    }

    const funcionario = this.usersRepository.create({
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
      name: dto.name || null,
      companyId,

      cpf: dto.cpf || null,
      rg: dto.rg || null,
      phone: dto.phone || null,
      whatsapp: dto.whatsapp || null,
      position: dto.position || null,
      department: dto.department || null,
      registrationNumber: dto.registrationNumber || null,

      birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
      admissionDate: dto.admissionDate ? new Date(dto.admissionDate) : null,
      resignationDate: dto.resignationDate ? new Date(dto.resignationDate) : null,

      address: dto.address || null,
      city: dto.city || null,
      state: dto.state || null,
      zipCode: dto.zipCode || null,
      salarioBase: dto.salarioBase || 0,

      active: dto.active ?? true,
      observations: dto.observations || null,
    });

    return this.usersRepository.save(funcionario);
  }

  async findAll(
    requestUser: any,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      active?: boolean;
    },
  ) {
    const companyId = await this.getCompanyIdFromRequestUser(requestUser);

    const page = Number(params.page || 1);
    const limit = Number(params.limit || 10);
    const skip = (page - 1) * limit;

    const baseWhere = {
      companyId,
      ...(params.active !== undefined ? { active: params.active } : {}),
    };

    const search = params.search?.trim();

    const where = search
      ? [
          { ...baseWhere, name: ILike(`%${search}%`) },
          { ...baseWhere, email: ILike(`%${search}%`) },
          { ...baseWhere, cpf: ILike(`%${search}%`) },
          { ...baseWhere, phone: ILike(`%${search}%`) },
          { ...baseWhere, whatsapp: ILike(`%${search}%`) },
          { ...baseWhere, position: ILike(`%${search}%`) },
          { ...baseWhere, department: ILike(`%${search}%`) },
          { ...baseWhere, registrationNumber: ILike(`%${search}%`) },
        ]
      : baseWhere;

    const [data, total] = await this.usersRepository.findAndCount({
      where,
      relations: {
        company: true,
      },
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(requestUser: any, id: number) {
    const companyId = await this.getCompanyIdFromRequestUser(requestUser);

    const funcionario = await this.usersRepository.findOne({
      where: {
        id,
        companyId,
      },
      relations: {
        company: true,
      },
    });

    if (!funcionario) {
      throw new NotFoundException('Funcionário não encontrado.');
    }

    return funcionario;
  }

  async update(requestUser: any, id: number, dto: UpdateFuncionarioDto) {
    const funcionario = await this.findOne(requestUser, id);

    if (dto.email && dto.email !== funcionario.email) {
      const exists = await this.usersRepository.findOne({
        where: {
          email: dto.email,
        },
      });

      if (exists && exists.id !== funcionario.id) {
        throw new ConflictException('E-mail já cadastrado.');
      }
    }

    funcionario.email = dto.email ?? funcionario.email;

    if (dto.password?.trim()) {
      funcionario.password = await bcrypt.hash(dto.password, 10);
    }

    funcionario.name = dto.name ?? funcionario.name;
    funcionario.cpf = dto.cpf ?? funcionario.cpf;
    funcionario.rg = dto.rg ?? funcionario.rg;
    funcionario.phone = dto.phone ?? funcionario.phone;
    funcionario.whatsapp = dto.whatsapp ?? funcionario.whatsapp;
    funcionario.position = dto.position ?? funcionario.position;
    funcionario.department = dto.department ?? funcionario.department;
    funcionario.registrationNumber =
      dto.registrationNumber ?? funcionario.registrationNumber;
    funcionario.salarioBase = dto.salarioBase ?? funcionario.salarioBase;

    funcionario.birthDate = dto.birthDate
      ? new Date(dto.birthDate)
      : funcionario.birthDate;

    funcionario.admissionDate = dto.admissionDate
      ? new Date(dto.admissionDate)
      : funcionario.admissionDate;

    funcionario.resignationDate = dto.resignationDate
      ? new Date(dto.resignationDate)
      : funcionario.resignationDate;

    funcionario.address = dto.address ?? funcionario.address;
    funcionario.city = dto.city ?? funcionario.city;
    funcionario.state = dto.state ?? funcionario.state;
    funcionario.zipCode = dto.zipCode ?? funcionario.zipCode;

    funcionario.active = dto.active ?? funcionario.active;
    funcionario.observations = dto.observations ?? funcionario.observations;

    return this.usersRepository.save(funcionario);
  }

  async remove(requestUser: any, id: number) {
    const funcionario = await this.findOne(requestUser, id);

    await this.usersRepository.remove(funcionario);

    return {
      message: 'Funcionário removido com sucesso.',
    };
  }
}