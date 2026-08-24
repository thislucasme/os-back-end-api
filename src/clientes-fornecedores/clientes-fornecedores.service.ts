import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';

import { CreateClienteFornecedorDto } from './dto/create-cliente-fornecedor.dto';
import { UpdateClienteFornecedorDto } from './dto/update-cliente-fornecedor.dto';
import { ClienteFornecedor } from './entities/cliente-fornecedor.entity';
import { Company } from 'src/companies/ company.entity';
import { CompaniesService } from 'src/companies/companies.service';
import { CreateClienteDto } from 'src/assas/clientes/dto/create-cliente.dto';
import { ClientesAssasService } from 'src/assas/clientes/clientes-assas.service';

@Injectable()
export class ClientesFornecedoresService {
    constructor(
        @InjectRepository(ClienteFornecedor)
        private readonly repo: Repository<ClienteFornecedor>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Company)
        private readonly companyRepo: Repository<Company>,

        private readonly companyService: CompaniesService,

        private readonly clienteAssasService: ClientesAssasService,
    ) { }

    private async getCompanyByUserId(userId: number) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: {
                company: true,
            },
        });

        if (!user || !user.company) {
            throw new BadRequestException('Usuário não possui empresa vinculada.');
        }

        return user.company;
    }

    async createUserAssas(companyId: number, clienteAssasPayload: CreateClienteDto) {
        const assasApiToken = await this.companyService.getApiTokenByCompanyId(companyId);
        if (assasApiToken) {
            const clientAssas = await this.clienteAssasService.create(assasApiToken, clienteAssasPayload)
            return clientAssas
        }
    }

    async create(userId: number, dto: CreateClienteFornecedorDto) {
        const company = await this.getCompanyByUserId(userId);

        const exists = await this.repo.findOne({
            where: {
                companyId: company.id,
                documento: dto.documento,
            },
        });

        if (exists) {
            throw new BadRequestException('Já existe um cadastro com este CPF/CNPJ.');
        }
        if (!dto.documento) {
            throw new BadRequestException("CPF ou CNPJ deve ser enviado")
        }
        const clienteAssasPayload: CreateClienteDto = {
            name: dto.nome!,
            cpfCnpj: dto.documento!,
            email: dto.email!
        }
        const userAssas = await this.createUserAssas(company.id, clienteAssasPayload)
        if (userAssas && userAssas.id) {
            dto.asaasCustomerId = userAssas.id
        }

        const item = this.repo.create({
            ...dto,
            companyId: company.id,
        });

        return this.repo.save(item);
    }

    async findAll(
        userId: number,
        query: {
            search?: string;
            page?: string;
            limit?: string;
        },
    ) {
        const company = await this.getCompanyByUserId(userId);

        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = query.search?.trim();

        const qb = this.repo
            .createQueryBuilder('cadastro')
            .where('cadastro.companyId = :companyId', {
                companyId: company.id,
            });

        if (search) {
            qb.andWhere(
                `(
          cadastro.nome LIKE :search OR
          cadastro.documento LIKE :search OR
          cadastro.email LIKE :search OR
          cadastro.telefone LIKE :search OR
          cadastro.whatsapp LIKE :search
        )`,
                {
                    search: `%${search}%`,
                },
            );
        }

        const [data, total] = await qb
            .orderBy('cadastro.id', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }

    async findOne(userId: number, id: number) {
        const company = await this.getCompanyByUserId(userId);

        const item = await this.repo.findOne({
            where: {
                id,
                companyId: company.id,
            },
        });

        if (!item) {
            throw new NotFoundException('Cadastro não encontrado.');
        }

        return item;
    }

    async findOneClienteFornecedorById(userId: number) {

        const item = await this.repo.findOne({
            where: {
                id: userId,
            },
        });

        if (!item) {
            throw new NotFoundException('Cadastro não encontrado.');
        }

        return item;
    }

    async update(
        userId: number,
        id: number,
        dto: UpdateClienteFornecedorDto,
    ) {
        const company = await this.getCompanyByUserId(userId);

        const item = await this.findOne(userId, id);

        if (dto.documento && dto.documento !== item.documento) {
            const exists = await this.repo.findOne({
                where: {
                    companyId: company.id,
                    documento: dto.documento,
                },
            });

            if (exists) {
                throw new BadRequestException('Já existe um cadastro com este CPF/CNPJ.');
            }
        }

        Object.assign(item, dto);

        return this.repo.save(item);
    }

    async remove(userId: number, id: number) {
        const item = await this.findOne(userId, id);

        await this.repo.remove(item);

        return {
            message: 'Cadastro removido com sucesso.',
        };
    }
}