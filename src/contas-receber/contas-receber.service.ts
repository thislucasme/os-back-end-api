import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContaFinanceira } from 'src/financeiro/contas-financeiras/entities/conta-financeira.entity';
import { MovimentacoesService } from 'src/movimentacoes/movimentacoes.service';
import { User } from 'src/users/user.entity';
import { ILike, Repository } from 'typeorm';
import { CreateContaReceberDto } from './dto/create-conta-receber.dto';
import { ReceberParcelaDto } from './dto/receber-parcela.dto';
import { UpdateContaReceberDto } from './dto/update-conta-receber.dto';
import { ContaReceberParcela } from './entities/conta-receber-parcela.entity';

import {
  ContaReceber,
  PaymentMethod,
  StatusContaReceber,
} from './entities/conta-receber.entity';
import { Recebimento } from './entities/recebimento.entity';
import { OrigemMovimentacaoFinanceira } from 'src/movimentacoes/entities/movimentacao-financeira.entity';
import { OrdemServico } from 'src/ordens-servico/entities/ordem-servico.entity';
import { Company } from 'src/companies/ company.entity';
import { UsersService } from 'src/users/users.service';
import { AssasCobrancasService } from 'src/assas/cobrancas/assas-cobrancas.service';
import { CompaniesService } from 'src/companies/companies.service';
import { ClientesFornecedoresService } from 'src/clientes-fornecedores/clientes-fornecedores.service';

@Injectable()
export class ContasReceberService {
  private readonly logger = new Logger(ContasReceberService.name);
  constructor(
    @InjectRepository(ContaReceber)
    private readonly repository: Repository<ContaReceber>,

    @InjectRepository(Recebimento)
    private readonly recebimentosRepository: Repository<Recebimento>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(ContaReceberParcela)
    private readonly parcelasRepository:
      Repository<ContaReceberParcela>,

    @InjectRepository(Company)
    private readonly companyRepository:
      Repository<Company>,

    @InjectRepository(OrdemServico)
    private readonly ordemServicoRepository: Repository<OrdemServico>,

    private readonly userService: UsersService,

    private readonly movimentacoesService: MovimentacoesService,

    private readonly assasCobrancaService: AssasCobrancasService,

    private readonly companyService: CompaniesService,

    private readonly clienteFornecedorService: ClientesFornecedoresService,
  ) { }
  public async getCompanyIdFromRequestUser(
    requestUser: any,
  ): Promise<number> {
    const userId = Number(requestUser?.id);
    console.log("id dentro da funcao", userId)

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

  public async getCompanyId(requestUser: any): Promise<number> {
    const userId = Number(requestUser?.id);

    // Validação explícita
    if (isNaN(userId) || userId <= 0) {
      throw new ForbiddenException('ID de usuário inválido ou ausente.');
    }

    // Busca apenas o companyId
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: { companyId: true }, // funciona com findOne
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
    dto: CreateContaReceberDto
  ) {

    const companyId =
      await this.getCompanyIdFromRequestUser(
        requestUser
      );


    const conta =
      this.repository.create({

        companyId,

        clienteId: dto.clienteId,

        ordemServicoId:
          dto.ordemServicoId ?? null,

        descricao:
          dto.descricao ?? null,

        valorOriginal:
          dto.valorOriginal,

        paymentMethod:
          dto.paymentMethod,

        valorRecebido: 0,

        dataVencimento:
          dto.primeiroVencimento,

        dataEmissao:
          this.today(),

        contaFinanceiraId:
          dto.contaFinanceiraId ?? null,

        status:
          StatusContaReceber.ABERTA

      });


    const contaSalva =
      await this.repository.save(conta);



    const parcelas =
      Number(dto.parcelas || 1);



    const valorParcela =
      Number(
        (dto.valorOriginal / parcelas)
          .toFixed(2)
      );



    const parcelasCriadas: ContaReceberParcela[] = [];

    for (
      let i = 1;
      i <= parcelas;
      i++
    ) {

      const data =
        new Date(dto.primeiroVencimento);

      data.setMonth(
        data.getMonth() + i - 1
      );


      const parcela =
        this.parcelasRepository.create({

          contaReceberId:
            contaSalva.id,

          numero: i,

          valor: valorParcela,

          vencimento:
            data.toISOString().slice(0, 10),

          paga: false

        });


      parcelasCriadas.push(parcela);
    }
    const assasApiToken = await this.companyService.getApiTokenByCompanyId(companyId);
    const clienteFornecedor = await this.clienteFornecedorService.findOneClienteFornecedorById(dto.clienteId)

    const parcelasSalvas =
      await this.parcelasRepository.save(parcelasCriadas);
    if (dto.paymentMethod === PaymentMethod.BOLETO && assasApiToken) {
      if (clienteFornecedor.asaasCustomerId) {
        for (const parcela of parcelasSalvas) {

          const payment =
            await this.assasCobrancaService.createPayment(
              assasApiToken,
              {
                customer: clienteFornecedor.asaasCustomerId,

                billingType: 'BOLETO',

                value: parcela.valor,

                dueDate: parcela.vencimento,

                description:
                  `${conta.descricao} - Parcela ${parcela.numero}/${parcelas}`,

                externalReference:
                  `conta-${conta.id}-parcela-${parcela.numero}`,

                interest: {
                  value: 1
                },

                fine: {
                  value: 10,
                  type: 'FIXED'
                }
              }
            );


          parcela.asaasPaymentId = payment.id;

          parcela.boletoUrl =
            payment.bankSlipUrl;

        }
      }
    }




    await this.parcelasRepository.save(parcelasSalvas);

    return this.repository.findOne({

      where: {
        id: contaSalva.id,
        companyId
      },

      relations: {
        cliente: true,
        parcelas: true,
        ordemServico: true
      }

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


    const status =
      this.validarStatus(params.status);



    const baseWhere: any = {
      companyId,

      ...(status
        ? {
          status,
        }
        : {}),
    };



    const search =
      params.search?.trim();



    const where: any = search
      ? [
        {
          ...baseWhere,

          cliente: {
            nome: ILike(`%${search}%`)
          }
        },

        {
          ...baseWhere,

          descricao:
            ILike(`%${search}%`)
        },
      ]

      : baseWhere;



    const [data, total] =
      await this.repository.findAndCount({

        where,

        relations: {
          cliente: true,
          ordemServico: true,
          parcelas: true,
        },

        skip,

        take: limit,

        order: {
          createdAt: 'DESC',
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
        requestUser
      );


    const conta =
      await this.repository.findOne({

        where: {
          id,
          companyId,
        },


        relations: {

          cliente: true,

          ordemServico: true,

          parcelas: {
            recebimentos: true,
          },

          contaFinanceira: true,

        },


      });



    if (!conta) {

      throw new NotFoundException(
        'Conta a receber não encontrada.'
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

      clienteId:
        dto.clienteId !== undefined
          ? dto.clienteId
          : conta.clienteId,


      ordemServicoId:
        dto.ordemServicoId !== undefined
          ? dto.ordemServicoId
          : conta.ordemServicoId,


      descricao:
        dto.descricao !== undefined
          ? dto.descricao
          : conta.descricao,


      valorOriginal:
        dto.valorOriginal !== undefined
          ? dto.valorOriginal
          : conta.valorOriginal,


      dataVencimento:
        dto.dataVencimento !== undefined
          ? dto.dataVencimento
          : conta.dataVencimento,


      dataEmissao:
        dto.dataEmissao !== undefined
          ? dto.dataEmissao
          : conta.dataEmissao,


      contaFinanceiraId:
        dto.contaFinanceiraId !== undefined
          ? dto.contaFinanceiraId
          : conta.contaFinanceiraId,

      paymentMethod:
        dto.paymentMethod !== undefined
          ? dto.paymentMethod
          : conta.paymentMethod,

    });



    if (
      dto.valorOriginal !== undefined &&
      conta.status !== StatusContaReceber.CANCELADA
    ) {

      conta.status =
        this.definirStatusPeloRecebimento(
          Number(conta.valorOriginal),
          Number(conta.valorRecebido),
        );

    }
    console.log(dto.paymentMethod)



    return this.repository.save(conta);

  }

  async receberParcela(
    requestUser: any,
    parcelaId: number,
    dto: ReceberParcelaDto,
  ) {

    const companyId =
      await this.getCompanyIdFromRequestUser(
        requestUser,
      );


    return this.repository.manager.transaction(
      async manager => {


        const parcelasRepository =
          manager.getRepository(ContaReceberParcela);


        const recebimentosRepository =
          manager.getRepository(Recebimento);


        const contasFinanceirasRepository =
          manager.getRepository(ContaFinanceira);



        const parcela =
          await parcelasRepository.findOne({

            where: {
              id: parcelaId,
            },

            relations: {
              contaReceber: true,
            },

          });



        if (!parcela) {
          throw new NotFoundException(
            'Parcela não encontrada.',
          );
        }



        if (
          parcela.contaReceber.companyId !== companyId
        ) {

          throw new ForbiddenException(
            'Sem permissão.',
          );

        }



        if (parcela.paga) {

          throw new BadRequestException(
            'Esta parcela já foi recebida.',
          );

        }




        const valor =
          Number(dto.valor);



        if (valor <= 0) {

          throw new BadRequestException(
            'Valor inválido.',
          );

        }




        const contaFinanceiraId =
          dto.contaFinanceiraId ??
          parcela.contaReceber.contaFinanceiraId;




        if (!contaFinanceiraId) {

          throw new BadRequestException(
            'Informe a conta financeira.',
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
            'Conta financeira não encontrada.',
          );

        }




        // Atualiza saldo da conta financeira

        contaFinanceira.saldoAtual =
          this.roundMoney(
            Number(contaFinanceira.saldoAtual || 0)
            +
            valor,
          );



        await contasFinanceirasRepository.save(
          contaFinanceira,
        );





        // Cria recebimento

        const recebimento =
          recebimentosRepository.create({

            companyId,

            parcelaId:
              parcela.id,

            contaFinanceiraId,

            valor,

            dataRecebimento:
              dto.dataRecebimento ??
              this.today(),

            formaPagamento:
              dto.formaPagamento ?? null,

            observacao:
              dto.observacao ?? null,

          });



        const recebimentoSalvo =
          await recebimentosRepository.save(
            recebimento,
          );






        // Marca parcela como paga

        parcela.paga = true;



        await parcelasRepository.save(
          parcela,
        );







        // Atualiza conta principal

        const conta =
          parcela.contaReceber;



        conta.valorRecebido =
          this.roundMoney(
            Number(conta.valorRecebido || 0)
            +
            valor,
          );



        conta.status =
          this.definirStatusPeloRecebimento(
            Number(conta.valorOriginal),
            Number(conta.valorRecebido),
          );



        await manager.save(
          conta,
        );







        // REGISTRA MOVIMENTAÇÃO FINANCEIRA

        await this.movimentacoesService.registrarEntrada(
          {

            companyId,

            contaFinanceiraId,

            valor,

            origem:
              OrigemMovimentacaoFinanceira.CONTA_RECEBER,


            referenciaId:
              recebimentoSalvo.id,


            descricao:
              `Recebimento da parcela #${parcela.id} da conta a receber #${conta.id}`,


            dataMovimentacao:
              dto.dataRecebimento ??
              this.today(),

          },

          manager,
        );







        return parcelasRepository.findOne({

          where: {
            id: parcela.id,
          },

          relations: {
            recebimentos: true,
            contaReceber: true,
          },

        });



      },
    );

  }

  async receberParcelaPorAsaasId(
    companyId: number,
    asaasPaymentId: string,
    valorRecebido: number,
    dataPagamento?: string,
  ) {
    return this.repository.manager.transaction(
      async manager => {
        const parcelasRepository = manager.getRepository(ContaReceberParcela);
        const recebimentosRepository = manager.getRepository(Recebimento);
        const contasFinanceirasRepository = manager.getRepository(ContaFinanceira);

        // 1. Busca a parcela pelo asaasPaymentId (ao invés de parcelaId por parâmetro)
        const parcela = await parcelasRepository.findOne({
          where: { asaasPaymentId },
          relations: {
            contaReceber: true,
          },
        });

        if (!parcela) {
          this.logger.warn(`Parcela não encontrada para o asaasPaymentId: ${asaasPaymentId}`);
          throw new NotFoundException('Parcela não encontrada para este pagamento do Asaas.');
        }

        // Validação de segurança da empresa
        if (parcela.contaReceber.companyId !== companyId) {
          throw new ForbiddenException('Sem permissão.');
        }

        // Se já estiver paga, podemos ignorar ou retornar a parcela para evitar erro duplo no webhook
        if (parcela.paga) {
          this.logger.log(`Parcela do pagamento ${asaasPaymentId} já consta como paga.`);
          return parcela;
        }
        console.log("VALOR RECEBIDO:", valorRecebido)
        const valor = Number(valorRecebido);
        if (valor <= 0) {
          throw new BadRequestException('Valor inválido no recebimento do Asaas.');
        }

        // Pega a conta financeira padrão da conta a receber
        const contaFinanceiraId = parcela.contaReceber.contaFinanceiraId;

        if (!contaFinanceiraId) {
          throw new BadRequestException('A conta a receber não possui uma conta financeira vinculada para receber o valor do Asaas.');
        }

        const contaFinanceira = await contasFinanceirasRepository.findOne({
          where: {
            id: contaFinanceiraId,
            companyId,
          },
        });

        if (!contaFinanceira) {
          throw new BadRequestException('Conta financeira não encontrada para creditar o valor.');
        }

        // 2. Atualiza saldo da conta financeira
        contaFinanceira.saldoAtual = this.roundMoney(
          Number(contaFinanceira.saldoAtual || 0) + valor,
        );

        await contasFinanceirasRepository.save(contaFinanceira);

        // 3. Cria o registro de recebimento
        const recebimento = recebimentosRepository.create({
          companyId,
          parcelaId: parcela.id,
          contaFinanceiraId,
          valor,
          dataRecebimento: dataPagamento ?? this.today(),
          formaPagamento: 'BOLETO', // ou capturado do payload se preferir
          observacao: `Recebimento automático via Asaas (Payment ID: ${asaasPaymentId})`,
        });

        const recebimentoSalvo = await recebimentosRepository.save(recebimento);

        // 4. Marca parcela como paga
        parcela.paga = true;
        await parcelasRepository.save(parcela);

        // 5. Atualiza conta principal
        const conta = parcela.contaReceber;
        conta.valorRecebido = this.roundMoney(
          Number(conta.valorRecebido || 0) + valor,
        );

        conta.status = this.definirStatusPeloRecebimento(
          Number(conta.valorOriginal),
          Number(conta.valorRecebido),
        );

        await manager.save(conta);

        // 6. REGISTRA MOVIMENTAÇÃO FINANCEIRA
        await this.movimentacoesService.registrarEntrada(
          {
            companyId,
            contaFinanceiraId,
            valor,
            origem: OrigemMovimentacaoFinanceira.CONTA_RECEBER,
            referenciaId: recebimentoSalvo.id,
            descricao: `Recebimento Asaas da parcela #${parcela.id} da conta #${conta.id}`,
            dataMovimentacao: dataPagamento ?? this.today(),
          },
          manager,
        );

        this.logger.log(`Parcela #${parcela.id} baixada com sucesso via Webhook do Asaas.`);

        return parcelasRepository.findOne({
          where: { id: parcela.id },
          relations: {
            recebimentos: true,
            contaReceber: true,
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
  async findByOrdemServico(
    ordemServicoId: number,
    companyId: number,
  ): Promise<ContaReceber[]> {
    return this.repository.find({
      where: {
        ordemServicoId,
        companyId,
      },
      relations: {
        cliente: true,
        parcelas: true,
        contaFinanceira: true,
      },
      order: {
        dataVencimento: 'ASC',
      },
    });
  }


}