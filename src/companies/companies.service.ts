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
import { CryptoService } from 'src/assas/cypto/crypto.service';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly cryptoService: CryptoService
  ) { }
  async getApiTokenByUserId(userId: number): Promise<string> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: {
        company: true,
      },
    });

    if (!user || !user.company || !user.company.apiToken) {
      throw new NotFoundException('Token da empresa não encontrado');
    }

    return this.cryptoService.decrypt(user.company.apiToken);
  }
  async getApiTokenByCompanyId(companyId: number): Promise<string> {
    const company = await this.companyRepo.findOne({
      where: { id: companyId },
      select: {
        apiToken: true,
      },
    });

    if (!company || !company.apiToken) {
      throw new NotFoundException('Token da empresa não encontrado');
    }

    return this.cryptoService.decrypt(company.apiToken);
  }

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
    if (user && user.company && user.company.apiToken) {
      const assasApiTokenCrypted = this.cryptoService.decrypt(user.company.apiToken)
      user.company.apiToken = assasApiTokenCrypted
    }
    return user;
  }

  async create(userId: number, dto: CreateCompanyDto) {
    const user = await this.getUserWithCompany(userId);
    if (dto.apiToken) {
      const assasApiTokenCrypted = this.cryptoService.encrypt(dto.apiToken)
      dto.apiToken = assasApiTokenCrypted
    }

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

    if (dto.apiToken) {
      const assasApiTokenCrypted = this.cryptoService.encrypt(dto.apiToken)
      dto.apiToken = assasApiTokenCrypted
    }
    Object.assign(company, dto);

    return this.companyRepo.save(company);
  }

  async updateLogo(userId: number, logoUrl: string) {
    const company = await this.getProfile(userId);

    company.logoUrl = logoUrl;

    return this.companyRepo.save(company);
  }
}