import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from 'src/users/user.entity';
import {
  Between,
  EntityManager,
  FindOptionsWhere,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import {
  MovimentacaoFinanceira,
  OrigemMovimentacaoFinanceira,
  TipoMovimentacaoFinanceira,
} from './entities/movimentacao-financeira.entity';
import { ContaFinanceira } from 'src/financeiro/contas-financeiras/entities/conta-financeira.entity';

interface RegistrarMovimentacaoParams {
  companyId: number;
  contaFinanceiraId: number;
  tipo: TipoMovimentacaoFinanceira;
  origem: OrigemMovimentacaoFinanceira;
  valor: number;
  dataMovimentacao?: string;
  referenciaId?: number | null;
  descricao?: string | null;
}

@Injectable()
export class MovimentacoesService {
  constructor(
    @InjectRepository(MovimentacaoFinanceira)
    private readonly repository: Repository<MovimentacaoFinanceira>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

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

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private validarTipo(
    tipo?: string,
  ): TipoMovimentacaoFinanceira | undefined {
    if (!tipo) {
      return undefined;
    }

    const tipoUpper = String(tipo).toUpperCase();

    if (
      !Object.values(TipoMovimentacaoFinanceira).includes(
        tipoUpper as TipoMovimentacaoFinanceira,
      )
    ) {
      throw new BadRequestException(
        'Tipo de movimentação inválido.',
      );
    }

    return tipoUpper as TipoMovimentacaoFinanceira;
  }

  private validarOrigem(
    origem?: string,
  ): OrigemMovimentacaoFinanceira | undefined {
    if (!origem) {
      return undefined;
    }

    const origemUpper = String(origem).toUpperCase();

    if (
      !Object.values(OrigemMovimentacaoFinanceira).includes(
        origemUpper as OrigemMovimentacaoFinanceira,
      )
    ) {
      throw new BadRequestException(
        'Origem de movimentação inválida.',
      );
    }

    return origemUpper as OrigemMovimentacaoFinanceira;
  }

  private async validarContaFinanceira(
    companyId: number,
    contaFinanceiraId: number,
    manager?: EntityManager,
  ): Promise<void> {
    const contasFinanceirasRepository = manager
      ? manager.getRepository(ContaFinanceira)
      : this.repository.manager.getRepository(ContaFinanceira);

    const contaFinanceira =
      await contasFinanceirasRepository.findOne({
        where: {
          id: contaFinanceiraId,
          companyId,
        },
      });

    if (!contaFinanceira) {
      throw new BadRequestException(
        'Conta financeira não encontrada para esta empresa.',
      );
    }
  }

  async registrarMovimentacao(
    params: RegistrarMovimentacaoParams,
    manager?: EntityManager,
  ) {
    if (!params.companyId) {
      throw new BadRequestException(
        'Empresa não informada na movimentação.',
      );
    }

    if (!params.contaFinanceiraId) {
      throw new BadRequestException(
        'Conta financeira não informada na movimentação.',
      );
    }

    if (Number(params.valor) <= 0) {
      throw new BadRequestException(
        'O valor da movimentação deve ser maior que zero.',
      );
    }

    await this.validarContaFinanceira(
      params.companyId,
      params.contaFinanceiraId,
      manager,
    );

    const repository = manager
      ? manager.getRepository(MovimentacaoFinanceira)
      : this.repository;

    const movimentacao = repository.create({
      companyId: params.companyId,
      contaFinanceiraId: params.contaFinanceiraId,
      tipo: params.tipo,
      origem: params.origem,
      referenciaId: params.referenciaId ?? null,
      valor: params.valor,
      descricao: params.descricao ?? null,
      dataMovimentacao:
        params.dataMovimentacao ?? this.today(),
    });

    return repository.save(movimentacao);
  }

  async registrarEntrada(
    params: Omit<RegistrarMovimentacaoParams, 'tipo'>,
    manager?: EntityManager,
  ) {
    return this.registrarMovimentacao(
      {
        ...params,
        tipo: TipoMovimentacaoFinanceira.ENTRADA,
      },
      manager,
    );
  }

  async registrarSaida(
    params: Omit<RegistrarMovimentacaoParams, 'tipo'>,
    manager?: EntityManager,
  ) {
    return this.registrarMovimentacao(
      {
        ...params,
        tipo: TipoMovimentacaoFinanceira.SAIDA,
      },
      manager,
    );
  }

  async registrarTransferenciaEntrada(
    params: Omit<RegistrarMovimentacaoParams, 'tipo' | 'origem'>,
    manager?: EntityManager,
  ) {
    return this.registrarMovimentacao(
      {
        ...params,
        tipo: TipoMovimentacaoFinanceira.TRANSFERENCIA_ENTRADA,
        origem: OrigemMovimentacaoFinanceira.TRANSFERENCIA,
      },
      manager,
    );
  }

  async registrarTransferenciaSaida(
    params: Omit<RegistrarMovimentacaoParams, 'tipo' | 'origem'>,
    manager?: EntityManager,
  ) {
    return this.registrarMovimentacao(
      {
        ...params,
        tipo: TipoMovimentacaoFinanceira.TRANSFERENCIA_SAIDA,
        origem: OrigemMovimentacaoFinanceira.TRANSFERENCIA,
      },
      manager,
    );
  }

  async findAll(
    requestUser: any,
    params: {
      page?: number | string;
      limit?: number | string;
      search?: string;
      tipo?: string;
      origem?: string;
      contaFinanceiraId?: number | string;
      dataInicio?: string;
      dataFim?: string;
    },
  ) {
    const companyId =
      await this.getCompanyIdFromRequestUser(
        requestUser,
      );

    const page = Math.max(
      Number(params.page || 1),
      1,
    );

    const limit = Math.min(
      Math.max(Number(params.limit || 10), 1),
      100,
    );

    const skip = (page - 1) * limit;

    const tipo = this.validarTipo(
      params.tipo,
    );

    const origem = this.validarOrigem(
      params.origem,
    );

    const baseWhere: FindOptionsWhere<MovimentacaoFinanceira> = {
      companyId,
      ...(tipo
        ? {
            tipo,
          }
        : {}),
      ...(origem
        ? {
            origem,
          }
        : {}),
      ...(params.contaFinanceiraId
        ? {
            contaFinanceiraId: Number(params.contaFinanceiraId),
          }
        : {}),
    };

    if (params.dataInicio && params.dataFim) {
      baseWhere.dataMovimentacao = Between(
        params.dataInicio,
        params.dataFim,
      );
    } else if (params.dataInicio) {
      baseWhere.dataMovimentacao = MoreThanOrEqual(
        params.dataInicio,
      );
    } else if (params.dataFim) {
      baseWhere.dataMovimentacao = LessThanOrEqual(
        params.dataFim,
      );
    }

    const search = params.search?.trim();

    const where = search
      ? [
          {
            ...baseWhere,
            descricao: Like(`%${search}%`),
          },
        ]
      : baseWhere;

    const [data, total] =
      await this.repository.findAndCount({
        where,
        skip,
        take: limit,
        relations: {
          contaFinanceira: true,
        },
        order: {
          dataMovimentacao: 'DESC',
          id: 'DESC',
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

    const movimentacao =
      await this.repository.findOne({
        where: {
          id,
          companyId,
        },
        relations: {
          contaFinanceira: true,
        },
      });

    if (!movimentacao) {
      throw new NotFoundException(
        'Movimentação financeira não encontrada.',
      );
    }

    return movimentacao;
  }
}