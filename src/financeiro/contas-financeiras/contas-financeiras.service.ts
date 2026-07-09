import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { ILike, Repository } from 'typeorm';
import { CreateContaFinanceiraDto } from './dto/create-conta-financeira.dto';
import { UpdateContaFinanceiraDto } from './dto/update-conta-financeira.dto';
import { ContaFinanceira } from './entities/conta-financeira.entity';
import { TipoContaFinanceira } from './enums/tipo-conta-financeira.enum';

@Injectable()
export class ContasFinanceirasService {
    constructor(
        @InjectRepository(ContaFinanceira)
        private readonly repository: Repository<ContaFinanceira>,

        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) { }

    private async getCompanyIdFromRequestUser(
        requestUser: any,
    ): Promise<number> {
        const userId = requestUser?.id;

        if (!userId) {
            throw new ForbiddenException(
                'Usuário inválido no token.',
            );
        }

        const user = await this.usersRepository.findOne({
            where: {
                id: Number(userId),
            },
            select: {
                companyId: true,
            },
        });

        if (!user?.companyId) {
            throw new ForbiddenException(
                'Usuário sem empresa vinculada.',
            );
        }

        return user.companyId;
    }

    async create(
        requestUser: any,
        dto: CreateContaFinanceiraDto,
    ) {
        const companyId =
            await this.getCompanyIdFromRequestUser(
                requestUser,
            );

const saldoInicial = Number(dto.saldoInicial ?? 0);

const conta = this.repository.create({
  ...dto,
  companyId,
  saldoInicial,
  saldoAtual: saldoInicial,
  ativa: dto.ativa ?? true,
});

        return this.repository.save(conta);
    }

    async findAll(
        requestUser: any,
        params: {
            page?: number;
            limit?: number;
            search?: string;
            ativa?: boolean | string; // Ajustado a tipagem para aceitar a string da query
            tipo?: TipoContaFinanceira;
        },
    ) {
        const companyId =
            await this.getCompanyIdFromRequestUser(
                requestUser,
            );

        const page = Number(params.page || 1);
        const limit = Number(params.limit || 10);
        const skip = (page - 1) * limit;

        // Trata a conversão estrita de string para booleano real
        const isAtiva =
            params.ativa === 'true' || params.ativa === true
                ? true
                : params.ativa === 'false' || params.ativa === false
                    ? false
                    : undefined;

        const baseWhere = {
            companyId,
            ...(isAtiva !== undefined
                ? {
                    ativa: isAtiva,
                }
                : {}),
            ...(params.tipo
                ? {
                    tipo: params.tipo,
                }
                : {}),
        };

        const search = params.search?.trim();

        const where = search
            ? [
                {
                    ...baseWhere,
                    nome: ILike(`%${search}%`),
                },
                {
                    ...baseWhere,
                    banco: ILike(`%${search}%`),
                },
                {
                    ...baseWhere,
                    agencia: ILike(`%${search}%`),
                },
                {
                    ...baseWhere,
                    conta: ILike(`%${search}%`),
                },
            ]
            : baseWhere;

        const [data, total] =
            await this.repository.findAndCount({
                where,
                skip,
                take: limit,
                order: {
                    nome: 'ASC',
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

    async findOne(
        requestUser: any,
        id: number,
    ) {
        const companyId =
            await this.getCompanyIdFromRequestUser(
                requestUser,
            );

        const conta = await this.repository.findOne({
            where: {
                id,
                companyId,
            },
        });

        if (!conta) {
            throw new NotFoundException(
                'Conta financeira não encontrada.',
            );
        }

        return conta;
    }

    async update(
        requestUser: any,
        id: number,
        dto: UpdateContaFinanceiraDto,
    ) {
        const conta = await this.findOne(
            requestUser,
            id,
        );

        Object.assign(conta, dto);

        return this.repository.save(conta);
    }

    async remove(
        requestUser: any,
        id: number,
    ) {
        const conta = await this.findOne(
            requestUser,
            id,
        );

        await this.repository.remove(conta);

        return {
            deleted: true,
        };
    }
}