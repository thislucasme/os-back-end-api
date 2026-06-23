import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/users/user.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './ company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private async getUserWithCompany(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: {
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async create(userId: number, dto: CreateCompanyDto) {
    const user = await this.getUserWithCompany(userId);

    if (user.companyId) {
      throw new BadRequestException(
        'Usuário já possui empresa vinculada',
      );
    }

    const company = this.companyRepo.create(dto);
    const savedCompany = await this.companyRepo.save(company);

    user.companyId = savedCompany.id;
    await this.userRepo.save(user);

    return savedCompany;
  }

  async getProfile(userId: number) {
    const user = await this.getUserWithCompany(userId);

    if (!user.company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return user.company;
  }

  async updateProfile(userId: number, dto: UpdateCompanyDto) {
    const company = await this.getProfile(userId);

    Object.assign(company, dto);

    return this.companyRepo.save(company);
  }

  async updateLogo(userId: number, logoUrl: string) {
    const company = await this.getProfile(userId);

    company.logoUrl = logoUrl;

    return this.companyRepo.save(company);
  }
}