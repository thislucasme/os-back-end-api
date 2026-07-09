import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContaFinanceira } from 'src/financeiro/contas-financeiras/entities/conta-financeira.entity';
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
import { CreateDespesaDto } from './dto/create-despesa.dto';
import { UpdateDespesaDto } from './dto/update-despesa.dto';
import {
  Despesa,
  StatusDespesa,
} from './entities/despesa.entity';
import { MovimentacoesService } from 'src/movimentacoes/movimentacoes.service';
import { OrigemMovimentacaoFinanceira } from 'src/movimentacoes/entities/movimentacao-financeira.entity';

@Injectable()
export class DespesasService {
  constructor(
    @InjectRepository(Despesa)
    private readonly repository: Repository<Despesa>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly movimentacoesService: MovimentacoesService,
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

  private roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private async buscarContaFinanceira(
    manager: EntityManager,
    companyId: number,
    contaFinanceiraId: number,
  ): Promise<ContaFinanceira> {
    const contasFinanceirasRepository =
      manager.getRepository(ContaFinanceira);

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

    if (contaFinanceira.ativa === false) {
      throw new BadRequestException(
        'A conta financeira está inativa.',
      );
    }

    return contaFinanceira;
  }

  async create(
    requestUser: any,
    dto: CreateDespesaDto,
  ) {
    const companyId =
      await this.getCompanyIdFromRequestUser(
        requestUser,
      );

    const valorDespesa = Number(dto.valor);

    if (valorDespesa <= 0) {
      throw new BadRequestException(
        'O valor da despesa deve ser maior que zero.',
      );
    }

    return this.repository.manager.transaction(
      async manager => {
        const despesasRepository =
          manager.getRepository(Despesa);

        const contasFinanceirasRepository =
          manager.getRepository(ContaFinanceira);

        const contaFinanceira =
          await this.buscarContaFinanceira(
            manager,
            companyId,
            Number(dto.contaFinanceiraId),
          );

        const saldoAtual = Number(
          contaFinanceira.saldoAtual || 0,
        );

        if (saldoAtual < valorDespesa) {
          throw new BadRequestException(
            'Saldo insuficiente na conta financeira.',
          );
        }

        contaFinanceira.saldoAtual =
          this.roundMoney(
            saldoAtual - valorDespesa,
          );

        await contasFinanceirasRepository.save(
          contaFinanceira,
        );

        const dataDespesa =
          dto.dataDespesa ?? this.today();

        const despesa = despesasRepository.create({
          companyId,
          contaFinanceiraId: contaFinanceira.id,
          descricao: dto.descricao,
          categoria: dto.categoria ?? null,
          valor: valorDespesa,
          dataDespesa,
          formaPagamento: dto.formaPagamento ?? null,
          observacao: dto.observacao ?? null,
          status: StatusDespesa.ATIVA,
        });

        const despesaSalva =
          await despesasRepository.save(
            despesa,
          );

        await this.movimentacoesService.registrarSaida(
          {
            companyId,
            contaFinanceiraId: contaFinanceira.id,
            valor: valorDespesa,
            origem: OrigemMovimentacaoFinanceira.DESPESA,
            referenciaId: despesaSalva.id,
            descricao: `Despesa #${despesaSalva.id} - ${dto.descricao}`,
            dataMovimentacao: dataDespesa,
          },
          manager,
        );

        return despesasRepository.findOne({
          where: {
            id: despesaSalva.id,
            companyId,
          },
          relations: {
            contaFinanceira: true,
          },
        });
      },
    );
  }

  async findAll(
    requestUser: any,
    params: {
      page?: number | string;
      limit?: number | string;
      search?: string;
      categoria?: string;
      status?: StatusDespesa | string;
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

    const baseWhere: FindOptionsWhere<Despesa> = {
      companyId,
      ...(params.status
        ? {
            status: String(params.status).toUpperCase() as StatusDespesa,
          }
        : {}),
      ...(params.categoria
        ? {
            categoria: Like(`%${params.categoria}%`),
          }
        : {}),
      ...(params.contaFinanceiraId
        ? {
            contaFinanceiraId: Number(params.contaFinanceiraId),
          }
        : {}),
    };

    if (params.dataInicio && params.dataFim) {
      baseWhere.dataDespesa = Between(
        params.dataInicio,
        params.dataFim,
      );
    } else if (params.dataInicio) {
      baseWhere.dataDespesa = MoreThanOrEqual(
        params.dataInicio,
      );
    } else if (params.dataFim) {
      baseWhere.dataDespesa = LessThanOrEqual(
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
          {
            ...baseWhere,
            categoria: Like(`%${search}%`),
          },
          {
            ...baseWhere,
            formaPagamento: Like(`%${search}%`),
          },
          {
            ...baseWhere,
            observacao: Like(`%${search}%`),
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
          dataDespesa: 'DESC',
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

    const despesa =
      await this.repository.findOne({
        where: {
          id,
          companyId,
        },
        relations: {
          contaFinanceira: true,
        },
      });

    if (!despesa) {
      throw new NotFoundException(
        'Despesa não encontrada.',
      );
    }

    return despesa;
  }

  async update(
    requestUser: any,
    id: number,
    dto: UpdateDespesaDto,
  ) {
    const companyId =
      await this.getCompanyIdFromRequestUser(
        requestUser,
      );

    return this.repository.manager.transaction(
      async manager => {
        const despesasRepository =
          manager.getRepository(Despesa);

        const contasFinanceirasRepository =
          manager.getRepository(ContaFinanceira);

        const despesa =
          await despesasRepository.findOne({
            where: {
              id,
              companyId,
            },
          });

        if (!despesa) {
          throw new NotFoundException(
            'Despesa não encontrada.',
          );
        }

        if (despesa.status === StatusDespesa.CANCELADA) {
          throw new BadRequestException(
            'Não é possível editar uma despesa cancelada.',
          );
        }

        const valorAnterior = Number(
          despesa.valor || 0,
        );

        const contaAnteriorId =
          despesa.contaFinanceiraId;

        const novoValor =
          dto.valor !== undefined
            ? Number(dto.valor)
            : valorAnterior;

        const novaContaFinanceiraId =
          dto.contaFinanceiraId !== undefined
            ? Number(dto.contaFinanceiraId)
            : contaAnteriorId;

        if (novoValor <= 0) {
          throw new BadRequestException(
            'O valor da despesa deve ser maior que zero.',
          );
        }

        const alterouFinanceiro =
          Number(novoValor) !== Number(valorAnterior) ||
          Number(novaContaFinanceiraId) !== Number(contaAnteriorId);

        if (alterouFinanceiro) {
          const contaAnterior =
            await this.buscarContaFinanceira(
              manager,
              companyId,
              contaAnteriorId,
            );

          contaAnterior.saldoAtual =
            this.roundMoney(
              Number(contaAnterior.saldoAtual || 0) +
                valorAnterior,
            );

          await contasFinanceirasRepository.save(
            contaAnterior,
          );

          await this.movimentacoesService.registrarEntrada(
            {
              companyId,
              contaFinanceiraId: contaAnterior.id,
              valor: valorAnterior,
              origem: OrigemMovimentacaoFinanceira.DESPESA,
              referenciaId: despesa.id,
              descricao: `Estorno por edição da despesa #${despesa.id}`,
              dataMovimentacao: this.today(),
            },
            manager,
          );

          const novaContaFinanceira =
            await this.buscarContaFinanceira(
              manager,
              companyId,
              novaContaFinanceiraId,
            );

          const saldoNovaConta = Number(
            novaContaFinanceira.saldoAtual || 0,
          );

          if (saldoNovaConta < novoValor) {
            throw new BadRequestException(
              'Saldo insuficiente na nova conta financeira.',
            );
          }

          novaContaFinanceira.saldoAtual =
            this.roundMoney(
              saldoNovaConta - novoValor,
            );

          await contasFinanceirasRepository.save(
            novaContaFinanceira,
          );

          await this.movimentacoesService.registrarSaida(
            {
              companyId,
              contaFinanceiraId: novaContaFinanceira.id,
              valor: novoValor,
              origem: OrigemMovimentacaoFinanceira.DESPESA,
              referenciaId: despesa.id,
              descricao: `Reaplicação da despesa #${despesa.id}`,
              dataMovimentacao:
                dto.dataDespesa ??
                despesa.dataDespesa ??
                this.today(),
            },
            manager,
          );
        }

        Object.assign(despesa, {
          contaFinanceiraId: novaContaFinanceiraId,
          descricao:
            dto.descricao !== undefined
              ? dto.descricao
              : despesa.descricao,
          categoria:
            dto.categoria !== undefined
              ? dto.categoria
              : despesa.categoria,
          valor: novoValor,
          dataDespesa:
            dto.dataDespesa !== undefined
              ? dto.dataDespesa
              : despesa.dataDespesa,
          formaPagamento:
            dto.formaPagamento !== undefined
              ? dto.formaPagamento
              : despesa.formaPagamento,
          observacao:
            dto.observacao !== undefined
              ? dto.observacao
              : despesa.observacao,
        });

        const despesaSalva =
          await despesasRepository.save(
            despesa,
          );

        return despesasRepository.findOne({
          where: {
            id: despesaSalva.id,
            companyId,
          },
          relations: {
            contaFinanceira: true,
          },
        });
      },
    );
  }

  async cancelar(
    requestUser: any,
    id: number,
  ) {
    const companyId =
      await this.getCompanyIdFromRequestUser(
        requestUser,
      );

    return this.repository.manager.transaction(
      async manager => {
        const despesasRepository =
          manager.getRepository(Despesa);

        const contasFinanceirasRepository =
          manager.getRepository(ContaFinanceira);

        const despesa =
          await despesasRepository.findOne({
            where: {
              id,
              companyId,
            },
          });

        if (!despesa) {
          throw new NotFoundException(
            'Despesa não encontrada.',
          );
        }

        if (despesa.status === StatusDespesa.CANCELADA) {
          throw new BadRequestException(
            'Despesa já está cancelada.',
          );
        }

        const contaFinanceira =
          await this.buscarContaFinanceira(
            manager,
            companyId,
            despesa.contaFinanceiraId,
          );

        const valorDespesa = Number(
          despesa.valor || 0,
        );

        contaFinanceira.saldoAtual =
          this.roundMoney(
            Number(contaFinanceira.saldoAtual || 0) +
              valorDespesa,
          );

        await contasFinanceirasRepository.save(
          contaFinanceira,
        );

        despesa.status = StatusDespesa.CANCELADA;

        await despesasRepository.save(
          despesa,
        );

        await this.movimentacoesService.registrarEntrada(
          {
            companyId,
            contaFinanceiraId: contaFinanceira.id,
            valor: valorDespesa,
            origem: OrigemMovimentacaoFinanceira.DESPESA,
            referenciaId: despesa.id,
            descricao: `Cancelamento da despesa #${despesa.id}`,
            dataMovimentacao: this.today(),
          },
          manager,
        );

        return despesasRepository.findOne({
          where: {
            id: despesa.id,
            companyId,
          },
          relations: {
            contaFinanceira: true,
          },
        });
      },
    );
  }

  async remove(
    requestUser: any,
    id: number,
  ) {
    const despesa = await this.cancelar(
      requestUser,
      id,
    );

    return {
      deleted: false,
      canceled: true,
      data: despesa,
    };
  }
}