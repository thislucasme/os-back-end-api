import {
  BadRequestException,
  ForbiddenException,
  Injectable,
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
  StatusContaReceber,
} from './entities/conta-receber.entity';
import { Recebimento } from './entities/recebimento.entity';
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

    @InjectRepository(ContaReceberParcela)
    private readonly parcelasRepository:
      Repository<ContaReceberParcela>,

    private readonly movimentacoesService: MovimentacoesService,
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
            data.toISOString()
              .slice(0, 10),

          paga: false

        });


      parcelasCriadas.push(
        parcela
      );

    }


    await this.parcelasRepository.save(
      parcelasCriadas
    );



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

        where:{
          id: parcela.id,
        },

        relations:{
          recebimentos:true,
          contaReceber:true,
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