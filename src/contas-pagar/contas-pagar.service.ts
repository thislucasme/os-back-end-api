import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { ILike, Repository } from 'typeorm';
import { CreateContaPagarDto } from './dto/create-conta-pagar.dto';
import { PagarContaDto } from './dto/pagar-conta.dto';
import { UpdateContaPagarDto } from './dto/update-conta-pagar.dto';
import {
  ContaPagar,
  StatusContaPagar,
} from './entities/conta-pagar.entity';
import { Pagamento } from './entities/pagamento.entity';
import { ContaFinanceira } from 'src/financeiro/contas-financeiras/entities/conta-financeira.entity';
import { MovimentacoesService } from 'src/movimentacoes/movimentacoes.service';
import { OrigemMovimentacaoFinanceira } from 'src/movimentacoes/entities/movimentacao-financeira.entity';

@Injectable()
export class ContasPagarService {
constructor(
  @InjectRepository(ContaPagar)
  private readonly repository: Repository<ContaPagar>,

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

  private validarStatus(status?: string): StatusContaPagar | undefined {
    if (!status) {
      return undefined;
    }

    const statusUpper = String(status).toUpperCase();

    if (
      !Object.values(StatusContaPagar).includes(
        statusUpper as StatusContaPagar,
      )
    ) {
      throw new BadRequestException(
        'Status inválido para conta a pagar.',
      );
    }

    return statusUpper as StatusContaPagar;
  }

  private definirStatusPeloPagamento(
    valorOriginal: number,
    valorPago: number,
  ): StatusContaPagar {
    if (valorPago <= 0) {
      return StatusContaPagar.ABERTA;
    }

    if (valorPago >= valorOriginal) {
      return StatusContaPagar.PAGA;
    }

    return StatusContaPagar.PARCIAL;
  }

  async create(
    requestUser: any,
    dto: CreateContaPagarDto,
  ) {
    const companyId =
      await this.getCompanyIdFromRequestUser(
        requestUser,
      );

    const conta = this.repository.create({
      companyId,
      fornecedorNome: dto.fornecedorNome,
      fornecedorDocumento: dto.fornecedorDocumento ?? null,
      descricao: dto.descricao ?? null,
      valorOriginal: dto.valorOriginal,
      valorPago: 0,
      dataVencimento: dto.dataVencimento,
      dataEmissao: dto.dataEmissao ?? this.today(),
      contaFinanceiraId: dto.contaFinanceiraId ?? null,
      status: StatusContaPagar.ABERTA,
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
            fornecedorNome: ILike(`%${search}%`),
          },
          {
            ...baseWhere,
            fornecedorDocumento: ILike(`%${search}%`),
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
        pagamentos: true,
        contaFinanceira: true,
      },
    });

    if (!conta) {
      throw new NotFoundException(
        'Conta a pagar não encontrada.',
      );
    }

    return conta;
  }

  async update(
    requestUser: any,
    id: number,
    dto: UpdateContaPagarDto,
  ) {
    const conta = await this.findOne(
      requestUser,
      id,
    );

    if (
      dto.valorOriginal !== undefined &&
      Number(dto.valorOriginal) < Number(conta.valorPago)
    ) {
      throw new BadRequestException(
        'O valor original não pode ser menor que o valor já pago.',
      );
    }

    const statusInformado =
      dto.status !== undefined;

    Object.assign(conta, {
      ...dto,
      fornecedorDocumento:
        dto.fornecedorDocumento !== undefined
          ? dto.fornecedorDocumento
          : conta.fornecedorDocumento,
      descricao:
        dto.descricao !== undefined
          ? dto.descricao
          : conta.descricao,
    });

    if (
      !statusInformado &&
      conta.status !== StatusContaPagar.CANCELADA
    ) {
      conta.status = this.definirStatusPeloPagamento(
        Number(conta.valorOriginal),
        Number(conta.valorPago),
      );
    }

    return this.repository.save(conta);
  }

async pagar(
  requestUser: any,
  id: number,
  dto: PagarContaDto,
) {
  const companyId =
    await this.getCompanyIdFromRequestUser(
      requestUser,
    );

  return this.repository.manager.transaction(
    async manager => {
      const contasPagarRepository =
        manager.getRepository(ContaPagar);

      const pagamentosRepository =
        manager.getRepository(Pagamento);

      const contasFinanceirasRepository =
        manager.getRepository(ContaFinanceira);

      const conta = await contasPagarRepository.findOne({
        where: {
          id,
          companyId,
        },
      });

      if (!conta) {
        throw new NotFoundException(
          'Conta a pagar não encontrada.',
        );
      }

      if (conta.status === StatusContaPagar.CANCELADA) {
        throw new BadRequestException(
          'Não é possível pagar uma conta cancelada.',
        );
      }

      if (conta.status === StatusContaPagar.PAGA) {
        throw new BadRequestException(
          'Esta conta já foi paga totalmente.',
        );
      }

      const valorPagoAtual = Number(
        conta.valorPago || 0,
      );

      const valorOriginal = Number(
        conta.valorOriginal || 0,
      );

      const valorPagamento = Number(
        dto.valor,
      );

      if (valorPagamento <= 0) {
        throw new BadRequestException(
          'O valor do pagamento deve ser maior que zero.',
        );
      }

      const novoValorPago = this.roundMoney(
        valorPagoAtual + valorPagamento,
      );

      if (novoValorPago > valorOriginal) {
        throw new BadRequestException(
          'O valor pago não pode ultrapassar o valor original da conta.',
        );
      }

      const contaFinanceiraId =
        dto.contaFinanceiraId ??
        conta.contaFinanceiraId ??
        null;

      if (!contaFinanceiraId) {
        throw new BadRequestException(
          'Informe a conta financeira para realizar o pagamento.',
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

      const saldoAtual = Number(
        contaFinanceira.saldoAtual || 0,
      );

      if (saldoAtual < valorPagamento) {
        throw new BadRequestException(
          'Saldo insuficiente na conta financeira.',
        );
      }

      contaFinanceira.saldoAtual =
        this.roundMoney(
          saldoAtual - valorPagamento,
        );

      await contasFinanceirasRepository.save(
        contaFinanceira,
      );

      const pagamento =
        pagamentosRepository.create({
          companyId,
          contaPagarId: conta.id,
          contaFinanceiraId,
          valor: valorPagamento,
          dataPagamento:
            dto.dataPagamento ?? this.today(),
          formaPagamento:
            dto.formaPagamento ?? null,
          observacao:
            dto.observacao ?? null,
        });

      const pagamentoSalvo =
        await pagamentosRepository.save(
          pagamento,
        );

      conta.valorPago = novoValorPago;

      conta.status =
        this.definirStatusPeloPagamento(
          valorOriginal,
          novoValorPago,
        );

      await contasPagarRepository.save(
        conta,
      );

      await this.movimentacoesService.registrarSaida(
        {
          companyId,
          contaFinanceiraId,
          valor: valorPagamento,
          origem: OrigemMovimentacaoFinanceira.CONTA_PAGAR,
          referenciaId: pagamentoSalvo.id,
          descricao: `Pagamento da conta a pagar #${conta.id}`,
          dataMovimentacao:
            dto.dataPagamento ?? this.today(),
        },
        manager,
      );

      return contasPagarRepository.findOne({
        where: {
          id: conta.id,
          companyId,
        },
        relations: {
          pagamentos: true,
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
    const conta = await this.findOne(
      requestUser,
      id,
    );

    if (Number(conta.valorPago || 0) > 0) {
      throw new BadRequestException(
        'Não é possível excluir uma conta que já possui pagamentos.',
      );
    }

    await this.repository.remove(conta);

    return {
      deleted: true,
    };
  }
}