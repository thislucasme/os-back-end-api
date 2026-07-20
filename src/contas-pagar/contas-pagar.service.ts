// src/financeiro/contas-pagar/contas-pagar.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContaFinanceira } from 'src/financeiro/contas-financeiras/entities/conta-financeira.entity';
import { MovimentacoesService } from 'src/movimentacoes/movimentacoes.service';
import { OrigemMovimentacaoFinanceira } from 'src/movimentacoes/entities/movimentacao-financeira.entity';
import { User } from 'src/users/user.entity';
import { ILike, Repository } from 'typeorm';
import { CreateContaPagarDto } from './dto/create-conta-pagar.dto';
import { PagarParcelaDto } from './dto/pagar-parcela.dto';
import { UpdateContaPagarDto } from './dto/update-conta-pagar.dto';
import { ContaPagarParcela } from './entities/conta-pagar-parcela.entity';
import {
  ContaPagar,
  StatusContaPagar,
} from './entities/conta-pagar.entity';
import { Pagamento } from './entities/pagamento.entity';

@Injectable()
export class ContasPagarService {
  constructor(
    @InjectRepository(ContaPagar)
    private readonly repository: Repository<ContaPagar>,

    @InjectRepository(Pagamento)
    private readonly pagamentosRepository: Repository<Pagamento>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(ContaPagarParcela)
    private readonly parcelasRepository: Repository<ContaPagarParcela>,

    private readonly movimentacoesService: MovimentacoesService,
  ) {}

  // ========== MÉTODOS AUXILIARES ==========

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
        companyId: true,
      },
    });

    if (!user?.companyId) {
      throw new ForbiddenException('Usuário sem empresa vinculada.');
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
      throw new BadRequestException('Status inválido para conta a pagar.');
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

  // ========== CRUD ==========

  async create(requestUser: any, dto: CreateContaPagarDto) {
    const companyId = await this.getCompanyIdFromRequestUser(requestUser);

    const conta = this.repository.create({
      companyId,
      fornecedorId: dto.fornecedorId,
      ordemServicoId: dto.ordemServicoId ?? null,
      descricao: dto.descricao ?? null,
      valorOriginal: dto.valorOriginal,
      valorPago: 0,
      dataVencimento: dto.primeiroVencimento,
      dataEmissao: dto.dataEmissao ?? this.today(),
      contaFinanceiraId: dto.contaFinanceiraId ?? null,
      status: StatusContaPagar.ABERTA,
    });

    const contaSalva = await this.repository.save(conta);

    const totalParcelas = Number(dto.parcelas || 1);
    const valorParcela = Number((dto.valorOriginal / totalParcelas).toFixed(2));

    const parcelasCriadas: ContaPagarParcela[] = [];

    for (let i = 1; i <= totalParcelas; i++) {
      const data = new Date(dto.primeiroVencimento);
      data.setMonth(data.getMonth() + i - 1);

      const parcela = this.parcelasRepository.create({
        contaPagarId: contaSalva.id,
        numero: i,
        valor: valorParcela,
        vencimento: data.toISOString().slice(0, 10),
        paga: false,
      });

      parcelasCriadas.push(parcela);
    }

    await this.parcelasRepository.save(parcelasCriadas);

    return this.repository.findOne({
      where: {
        id: contaSalva.id,
        companyId,
      },
      relations: {
        fornecedor: true,
        parcelas: true,
        ordemServico: true,
      },
    });
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
    const companyId = await this.getCompanyIdFromRequestUser(requestUser);

    const page = Math.max(Number(params.page || 1), 1);
    const limit = Math.min(Math.max(Number(params.limit || 10), 1), 100);
    const skip = (page - 1) * limit;

    const status = this.validarStatus(params.status);

    const baseWhere: any = {
      companyId,
      ...(status ? { status } : {}),
    };

    const search = params.search?.trim();

    const where: any = search
      ? [
          {
            ...baseWhere,
            fornecedor: {
              nome: ILike(`%${search}%`),
            },
          },
          {
            ...baseWhere,
            descricao: ILike(`%${search}%`),
          },
        ]
      : baseWhere;

    const [data, total] = await this.repository.findAndCount({
      where,
      relations: {
        fornecedor: true,
        ordemServico: true,
        parcelas: true,
      },
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

  async findOne(requestUser: any, id: number) {
    const companyId = await this.getCompanyIdFromRequestUser(requestUser);

    const conta = await this.repository.findOne({
      where: {
        id,
        companyId,
      },
      relations: {
        fornecedor: true,
        ordemServico: true,
        parcelas: {
          pagamentos: true,
        },
        contaFinanceira: true,
      },
    });

    if (!conta) {
      throw new NotFoundException('Conta a pagar não encontrada.');
    }

    return conta;
  }

  async update(requestUser: any, id: number, dto: UpdateContaPagarDto) {
    const conta = await this.findOne(requestUser, id);

    if (
      dto.valorOriginal !== undefined &&
      Number(dto.valorOriginal) < Number(conta.valorPago)
    ) {
      throw new BadRequestException(
        'O valor original não pode ser menor que o valor já pago.',
      );
    }

    Object.assign(conta, {
      fornecedorId:
        dto.fornecedorId !== undefined ? dto.fornecedorId : conta.fornecedorId,
      ordemServicoId:
        dto.ordemServicoId !== undefined
          ? dto.ordemServicoId
          : conta.ordemServicoId,
      descricao:
        dto.descricao !== undefined ? dto.descricao : conta.descricao,
      valorOriginal:
        dto.valorOriginal !== undefined ? dto.valorOriginal : conta.valorOriginal,
      dataVencimento:
        dto.dataVencimento !== undefined ? dto.dataVencimento : conta.dataVencimento,
      dataEmissao:
        dto.dataEmissao !== undefined ? dto.dataEmissao : conta.dataEmissao,
      contaFinanceiraId:
        dto.contaFinanceiraId !== undefined
          ? dto.contaFinanceiraId
          : conta.contaFinanceiraId,
    });

    if (dto.valorOriginal !== undefined && conta.status !== StatusContaPagar.CANCELADA) {
      conta.status = this.definirStatusPeloPagamento(
        Number(conta.valorOriginal),
        Number(conta.valorPago),
      );
    }

    return this.repository.save(conta);
  }

  // ========== PAGAR PARCELA (equivalente ao receberParcela) ==========

  async pagarParcela(
    requestUser: any,
    parcelaId: number,
    dto: PagarParcelaDto,
  ) {
    const companyId = await this.getCompanyIdFromRequestUser(requestUser);

    return this.repository.manager.transaction(async manager => {
      const parcelasRepository = manager.getRepository(ContaPagarParcela);
      const pagamentosRepository = manager.getRepository(Pagamento);
      const contasFinanceirasRepository = manager.getRepository(ContaFinanceira);

      const parcela = await parcelasRepository.findOne({
        where: {
          id: parcelaId,
        },
        relations: {
          contaPagar: true,
        },
      });

      if (!parcela) {
        throw new NotFoundException('Parcela não encontrada.');
      }

      if (parcela.contaPagar.companyId !== companyId) {
        throw new ForbiddenException('Sem permissão.');
      }

      if (parcela.paga) {
        throw new BadRequestException('Esta parcela já foi paga.');
      }

      const valor = Number(dto.valor);

      if (valor <= 0) {
        throw new BadRequestException('Valor inválido.');
      }

      const contaFinanceiraId =
        dto.contaFinanceiraId ?? parcela.contaPagar.contaFinanceiraId;

      if (!contaFinanceiraId) {
        throw new BadRequestException('Informe a conta financeira para o pagamento.');
      }

      const contaFinanceira = await contasFinanceirasRepository.findOne({
        where: {
          id: contaFinanceiraId,
          companyId,
        },
      });

      if (!contaFinanceira) {
        throw new BadRequestException('Conta financeira não encontrada.');
      }

      // Verifica saldo suficiente (para pagamento, o saldo deve ser >= valor)
      const saldoAtual = Number(contaFinanceira.saldoAtual || 0);
      if (saldoAtual < valor) {
        throw new BadRequestException('Saldo insuficiente na conta financeira.');
      }

      // Atualiza saldo da conta financeira (DIMINUI)
      contaFinanceira.saldoAtual = this.roundMoney(saldoAtual - valor);
      await contasFinanceirasRepository.save(contaFinanceira);

      // Cria pagamento
      const pagamento = pagamentosRepository.create({
        companyId,
        parcelaId: parcela.id,
        contaFinanceiraId,
        valor,
        dataPagamento: dto.dataPagamento ?? this.today(),
        formaPagamento: dto.formaPagamento ?? null,
        observacao: dto.observacao ?? null,
      });

      const pagamentoSalvo = await pagamentosRepository.save(pagamento);

      // Marca parcela como paga
      parcela.paga = true;
      await parcelasRepository.save(parcela);

      // Atualiza conta principal
      const conta = parcela.contaPagar;
      conta.valorPago = this.roundMoney(
        Number(conta.valorPago || 0) + valor,
      );
      conta.status = this.definirStatusPeloPagamento(
        Number(conta.valorOriginal),
        Number(conta.valorPago),
      );
      await manager.save(conta);

      // Registra movimentação financeira (SAÍDA)
      await this.movimentacoesService.registrarSaida(
        {
          companyId,
          contaFinanceiraId,
          valor,
          origem: OrigemMovimentacaoFinanceira.CONTA_PAGAR,
          referenciaId: pagamentoSalvo.id,
          descricao: `Pagamento da parcela #${parcela.id} da conta a pagar #${conta.id}`,
          dataMovimentacao: dto.dataPagamento ?? this.today(),
        },
        manager,
      );

      return parcelasRepository.findOne({
        where: {
          id: parcela.id,
        },
        relations: {
          pagamentos: true,
          contaPagar: true,
        },
      });
    });
  }

  // ========== REMOVER ==========

  async remove(requestUser: any, id: number) {
    const conta = await this.findOne(requestUser, id);

    // Verifica se já há pagamentos (opcional, mas coerente com contas a receber)
    // Como estamos usando parcelas, podemos permitir exclusão apenas se nenhuma parcela foi paga.
    const parcelasPagas = conta.parcelas?.some(p => p.paga === true);
    if (parcelasPagas) {
      throw new BadRequestException(
        'Não é possível excluir uma conta que possui parcelas pagas.',
      );
    }

    await this.repository.remove(conta);

    return {
      deleted: true,
    };
  }
}