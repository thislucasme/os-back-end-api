import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { ILike, Repository } from 'typeorm';
import { CreateContaReceberDto } from './dto/create-conta-receber.dto';
import { UpdateContaReceberDto } from './dto/update-conta-receber.dto';
import { ReceberContaDto } from './dto/receber-conta.dto';
import {
  ContaReceber,
  StatusContaReceber,
} from './entities/conta-receber.entity';
import { Recebimento } from './entities/recebimento.entity';
import { ContaFinanceira } from 'src/financeiro/contas-financeiras/entities/conta-financeira.entity';
import { MovimentacoesService } from 'src/movimentacoes/movimentacoes.service';
import { OrigemMovimentacaoFinanceira } from 'src/movimentacoes/entities/movimentacao-financeira.entity';

@Injectable()
export class ContasReceberService {
constructor(
  @InjectRepository(ContaReceber)
  private readonly repository: Repository<ContaReceber>,

  @InjectRepository(Recebimento)
  private readonly recebimentosRepository: Repository<Recebimento>,

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

  private validarStatus(status?: string): StatusContaReceber | undefined {
    if (!status) {
      return undefined;
    }

    const statusUpper = String(status).toUpperCase();

    if (
      !Object.values(StatusContaReceber).includes(
        statusUpper as StatusContaReceber,
      )
    ) {
      throw new BadRequestException(
        'Status inválido para conta a receber.',
      );
    }

    return statusUpper as StatusContaReceber;
  }

  private definirStatusPeloRecebimento(
    valorOriginal: number,
    valorRecebido: number,
  ): StatusContaReceber {
    if (valorRecebido <= 0) {
      return StatusContaReceber.ABERTA;
    }

    if (valorRecebido >= valorOriginal) {
      return StatusContaReceber.RECEBIDA;
    }

    return StatusContaReceber.PARCIAL;
  }

  async create(
    requestUser: any,
    dto: CreateContaReceberDto,
  ) {
    const companyId =
      await this.getCompanyIdFromRequestUser(
        requestUser,
      );

    const conta = this.repository.create({
      companyId,
      clienteNome: dto.clienteNome,
      clienteDocumento: dto.clienteDocumento ?? null,
      descricao: dto.descricao ?? null,
      valorOriginal: dto.valorOriginal,
      valorRecebido: 0,
      dataVencimento: dto.dataVencimento,
      dataEmissao: dto.dataEmissao ?? this.today(),
      contaFinanceiraId: dto.contaFinanceiraId ?? null,
      status: StatusContaReceber.ABERTA,
    });

    return this.repository.save(conta);
  }

  async findAll(
    requestUser: any,
    params: {
      page?: number | string;
      limit?: number | string;
      search?: string;
      status?: string;
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

    const status = this.validarStatus(
      params.status,
    );

    const baseWhere: any = {
      companyId,
      ...(status
        ? {
            status,
          }
        : {}),
    };

    const search = params.search?.trim();

    const where: any = search
      ? [
          {
            ...baseWhere,
            clienteNome: ILike(`%${search}%`),
          },
          {
            ...baseWhere,
            clienteDocumento: ILike(`%${search}%`),
          },
          {
            ...baseWhere,
            descricao: ILike(`%${search}%`),
          },
        ]
      : baseWhere;

    const [data, total] =
      await this.repository.findAndCount({
        where,
        skip,
        take: limit,
        order: {
          dataVencimento: 'ASC',
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

    const conta = await this.repository.findOne({
      where: {
        id,
        companyId,
      },
      relations: {
        recebimentos: true,
        contaFinanceira: true,
      },
      order: {
        recebimentos: {
          id: 'DESC',
        },
      },
    });

    if (!conta) {
      throw new NotFoundException(
        'Conta a receber não encontrada.',
      );
    }

    return conta;
  }

  async update(
    requestUser: any,
    id: number,
    dto: UpdateContaReceberDto,
  ) {
    const conta = await this.findOne(
      requestUser,
      id,
    );

    if (
      dto.valorOriginal !== undefined &&
      Number(dto.valorOriginal) < Number(conta.valorRecebido)
    ) {
      throw new BadRequestException(
        'O valor original não pode ser menor que o valor já recebido.',
      );
    }

    Object.assign(conta, {
      ...dto,
      clienteDocumento:
        dto.clienteDocumento !== undefined
          ? dto.clienteDocumento
          : conta.clienteDocumento,
      descricao:
        dto.descricao !== undefined
          ? dto.descricao
          : conta.descricao,
    });

    if (
      dto.valorOriginal !== undefined &&
      conta.status !== StatusContaReceber.CANCELADA
    ) {
      conta.status = this.definirStatusPeloRecebimento(
        Number(conta.valorOriginal),
        Number(conta.valorRecebido),
      );
    }

    return this.repository.save(conta);
  }

async receber(
  requestUser: any,
  id: number,
  dto: ReceberContaDto,
) {
  const companyId =
    await this.getCompanyIdFromRequestUser(
      requestUser,
    );

  return this.repository.manager.transaction(
    async manager => {
      const contasRepository =
        manager.getRepository(ContaReceber);

      const recebimentosRepository =
        manager.getRepository(Recebimento);

      const contasFinanceirasRepository =
        manager.getRepository(ContaFinanceira);

      const conta = await contasRepository.findOne({
        where: {
          id,
          companyId,
        },
      });

      if (!conta) {
        throw new NotFoundException(
          'Conta a receber não encontrada.',
        );
      }

      if (conta.status === StatusContaReceber.CANCELADA) {
        throw new BadRequestException(
          'Não é possível receber uma conta cancelada.',
        );
      }

      if (conta.status === StatusContaReceber.RECEBIDA) {
        throw new BadRequestException(
          'Esta conta já foi recebida totalmente.',
        );
      }

      const valorRecebidoAtual = Number(
        conta.valorRecebido || 0,
      );

      const valorOriginal = Number(
        conta.valorOriginal || 0,
      );

      const valorRecebimento = Number(
        dto.valor,
      );

      if (valorRecebimento <= 0) {
        throw new BadRequestException(
          'O valor do recebimento deve ser maior que zero.',
        );
      }

      const novoValorRecebido = this.roundMoney(
        valorRecebidoAtual + valorRecebimento,
      );

      if (novoValorRecebido > valorOriginal) {
        throw new BadRequestException(
          'O valor recebido não pode ultrapassar o valor original da conta.',
        );
      }

      const contaFinanceiraId =
        dto.contaFinanceiraId ??
        conta.contaFinanceiraId ??
        null;

      if (!contaFinanceiraId) {
        throw new BadRequestException(
          'Informe a conta financeira para realizar o recebimento.',
        );
      }

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

      contaFinanceira.saldoAtual =
        this.roundMoney(
          Number(contaFinanceira.saldoAtual || 0) +
            valorRecebimento,
        );

      await contasFinanceirasRepository.save(
        contaFinanceira,
      );

      const recebimento =
        recebimentosRepository.create({
          companyId,
          contaReceberId: conta.id,
          contaFinanceiraId,
          valor: valorRecebimento,
          dataRecebimento:
            dto.dataRecebimento ?? this.today(),
          formaPagamento:
            dto.formaPagamento ?? null,
          observacao:
            dto.observacao ?? null,
        });

      const recebimentoSalvo =
        await recebimentosRepository.save(
          recebimento,
        );

      conta.valorRecebido = novoValorRecebido;

      conta.status =
        this.definirStatusPeloRecebimento(
          valorOriginal,
          novoValorRecebido,
        );

      await contasRepository.save(conta);

      await this.movimentacoesService.registrarEntrada(
        {
          companyId,
          contaFinanceiraId,
          valor: valorRecebimento,
          origem: OrigemMovimentacaoFinanceira.CONTA_RECEBER,
          referenciaId: recebimentoSalvo.id,
          descricao: `Recebimento da conta a receber #${conta.id}`,
          dataMovimentacao:
            dto.dataRecebimento ?? this.today(),
        },
        manager,
      );

      return contasRepository.findOne({
        where: {
          id: conta.id,
          companyId,
        },
        relations: {
          recebimentos: true,
          contaFinanceira: true,
        },
        order: {
          recebimentos: {
            id: 'DESC',
          },
        },
      });
    },
  );
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