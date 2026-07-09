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
  FindOptionsWhere,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';
import { Transferencia } from './entities/transferencia.entity';
import { MovimentacoesService } from 'src/movimentacoes/movimentacoes.service';

@Injectable()
export class TransferenciasService {
  constructor(
    @InjectRepository(Transferencia)
    private readonly repository: Repository<Transferencia>,

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

  async create(
    requestUser: any,
    dto: CreateTransferenciaDto,
  ) {
    const companyId =
      await this.getCompanyIdFromRequestUser(
        requestUser,
      );

    const valorTransferencia = Number(dto.valor);

    if (valorTransferencia <= 0) {
      throw new BadRequestException(
        'O valor da transferência deve ser maior que zero.',
      );
    }

    if (Number(dto.contaOrigemId) === Number(dto.contaDestinoId)) {
      throw new BadRequestException(
        'A conta de origem não pode ser igual à conta de destino.',
      );
    }

    return this.repository.manager.transaction(
      async manager => {
        const transferenciasRepository =
          manager.getRepository(Transferencia);

        const contasFinanceirasRepository =
          manager.getRepository(ContaFinanceira);

        const contaOrigem =
          await contasFinanceirasRepository.findOne({
            where: {
              id: Number(dto.contaOrigemId),
              companyId,
            },
          });

        if (!contaOrigem) {
          throw new BadRequestException(
            'Conta financeira de origem não encontrada para esta empresa.',
          );
        }

        const contaDestino =
          await contasFinanceirasRepository.findOne({
            where: {
              id: Number(dto.contaDestinoId),
              companyId,
            },
          });

        if (!contaDestino) {
          throw new BadRequestException(
            'Conta financeira de destino não encontrada para esta empresa.',
          );
        }

        if (contaOrigem.ativa === false) {
          throw new BadRequestException(
            'A conta financeira de origem está inativa.',
          );
        }

        if (contaDestino.ativa === false) {
          throw new BadRequestException(
            'A conta financeira de destino está inativa.',
          );
        }

        const saldoOrigem = Number(
          contaOrigem.saldoAtual || 0,
        );

        if (saldoOrigem < valorTransferencia) {
          throw new BadRequestException(
            'Saldo insuficiente na conta de origem.',
          );
        }

        contaOrigem.saldoAtual =
          this.roundMoney(
            saldoOrigem - valorTransferencia,
          );

        contaDestino.saldoAtual =
          this.roundMoney(
            Number(contaDestino.saldoAtual || 0) +
              valorTransferencia,
          );

        await contasFinanceirasRepository.save([
          contaOrigem,
          contaDestino,
        ]);

        const dataTransferencia =
          dto.dataTransferencia ?? this.today();

        const transferencia =
          transferenciasRepository.create({
            companyId,
            contaOrigemId: contaOrigem.id,
            contaDestinoId: contaDestino.id,
            valor: valorTransferencia,
            dataTransferencia,
            descricao: dto.descricao ?? null,
          });

        const transferenciaSalva =
          await transferenciasRepository.save(
            transferencia,
          );

        await this.movimentacoesService.registrarTransferenciaSaida(
          {
            companyId,
            contaFinanceiraId: contaOrigem.id,
            valor: valorTransferencia,
            referenciaId: transferenciaSalva.id,
            descricao:
              dto.descricao ??
              `Transferência para ${contaDestino.nome}`,
            dataMovimentacao: dataTransferencia,
          },
          manager,
        );

        await this.movimentacoesService.registrarTransferenciaEntrada(
          {
            companyId,
            contaFinanceiraId: contaDestino.id,
            valor: valorTransferencia,
            referenciaId: transferenciaSalva.id,
            descricao:
              dto.descricao ??
              `Transferência recebida de ${contaOrigem.nome}`,
            dataMovimentacao: dataTransferencia,
          },
          manager,
        );

        return transferenciasRepository.findOne({
          where: {
            id: transferenciaSalva.id,
            companyId,
          },
          relations: {
            contaOrigem: true,
            contaDestino: true,
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
      contaOrigemId?: number | string;
      contaDestinoId?: number | string;
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

    const baseWhere: FindOptionsWhere<Transferencia> = {
      companyId,
      ...(params.contaOrigemId
        ? {
            contaOrigemId: Number(params.contaOrigemId),
          }
        : {}),
      ...(params.contaDestinoId
        ? {
            contaDestinoId: Number(params.contaDestinoId),
          }
        : {}),
    };

    if (params.dataInicio && params.dataFim) {
      baseWhere.dataTransferencia = Between(
        params.dataInicio,
        params.dataFim,
      );
    } else if (params.dataInicio) {
      baseWhere.dataTransferencia = MoreThanOrEqual(
        params.dataInicio,
      );
    } else if (params.dataFim) {
      baseWhere.dataTransferencia = LessThanOrEqual(
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
          contaOrigem: true,
          contaDestino: true,
        },
        order: {
          dataTransferencia: 'DESC',
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

    const transferencia =
      await this.repository.findOne({
        where: {
          id,
          companyId,
        },
        relations: {
          contaOrigem: true,
          contaDestino: true,
        },
      });

    if (!transferencia) {
      throw new NotFoundException(
        'Transferência não encontrada.',
      );
    }

    return transferencia;
  }
}