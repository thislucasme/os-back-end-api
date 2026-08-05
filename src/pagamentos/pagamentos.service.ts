import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { ItemOsResponsavel } from '../ordens-servico/entities/item-os-responsavel.entity';
import { OrderServiceResponsibleExpense } from '../ordens-servico/entities/order-service-responsible-expense.entity';
import { PagamentoResponseDto } from './dto/pagamento-response.dto';
import { UsersService } from 'src/users/users.service';
import { ResumoPagamentoDto } from './dto/resumo-pagamento.dto';
import { ItemLiberadoResponseDto } from './dto/item-liberado-response.dto';
import { DespesaResponseDto } from './dto/despesa-response.dto';
import { ItemOs, ItemOsStatusPagamento } from 'src/ordens-servico/entities/item-os.entity';
import { MarcarPagoPayloadDto, MarcarPagoResponseDto } from './dto/marcar-pago-payload.dto';

@Injectable()
export class PagamentosService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ItemOsResponsavel)
    private itemOsResponsavelRepository: Repository<ItemOsResponsavel>,
    @InjectRepository(OrderServiceResponsibleExpense)
    private expenseRepository: Repository<OrderServiceResponsibleExpense>,
    private readonly userService: UsersService,

     @InjectRepository(ItemOs)
    private itemOsRepository: Repository<ItemOs>,
  ) {}

  async findAll(user: any, query: any): Promise<PagamentoResponseDto[]> {
    const companyId = await this.userService.getCompanyIdFromRequestUser(user.id);
    if (!companyId) throw new Error('Usuário não possui empresa associada.');

    const usuarios = await this.userRepository.find({
      where: { companyId, active: true },
      select: { id: true, name: true, salarioBase: true },
    });
    if (usuarios.length === 0) return [];

    const userIds = usuarios.map(u => u.id);

    const { mes, ano } = query;
    if (!mes || !ano) {
      throw new Error('Parâmetros "mes" e "ano" são obrigatórios.');
    }

    const mesNum = parseInt(mes);
    const anoNum = parseInt(ano);
    if (mesNum < 1 || mesNum > 12 || anoNum < 1970) {
      throw new Error('Mês deve ser entre 1 e 12, e ano válido.');
    }

    const dataInicio = new Date(anoNum, mesNum - 1, 1, 0, 0, 0, 0);
    const dataFim = new Date(anoNum, mesNum, 0, 23, 59, 59, 999);

    // ---- Comissões (itens liberados no período) ----
    const comissoesQuery = this.itemOsResponsavelRepository
      .createQueryBuilder('ir')
      .innerJoin('ir.item', 'item')
      .where('ir.userId IN (:...userIds)', { userIds })
      .andWhere('item.data_liberacao IS NOT NULL')
      .andWhere('item.data_liberacao >= :dataInicio', { dataInicio })
      .andWhere('item.data_liberacao <= :dataFim', { dataFim });

    const comissoesAgrupadas = await comissoesQuery
      .select('ir.userId', 'userId')
      .addSelect('SUM(item.valor * item.quantidade * (ir.comissao / 100))', 'totalComissao')
      .addSelect('MAX(item.data_liberacao)', 'ultimaLiberacao')
      .groupBy('ir.userId')
      .getRawMany();

    const comissaoMap = new Map<number, { total: number; dataLiberacao: Date | null }>();
    comissoesAgrupadas.forEach(row => {
      const userId = Number(row.userId);
      comissaoMap.set(userId, {
        total: parseFloat(row.totalComissao) || 0,
        dataLiberacao: row.ultimaLiberacao ? new Date(row.ultimaLiberacao) : null,
      });
    });

    // ---- Status de pagamento (itens liberados no período) ----
    const statusQuery = this.itemOsResponsavelRepository
      .createQueryBuilder('ir')
      .innerJoin('ir.item', 'item')
      .where('ir.userId IN (:...userIds)', { userIds })
      .andWhere('item.data_liberacao IS NOT NULL')
      .andWhere('item.data_liberacao >= :dataInicio', { dataInicio })
      .andWhere('item.data_liberacao <= :dataFim', { dataFim });

    const statusRaw = await statusQuery
      .select('ir.userId', 'userId')
      .addSelect('COUNT(*)', 'totalItens')
      .addSelect('SUM(CASE WHEN item.status_pagamento = :pago THEN 1 ELSE 0 END)', 'itensPagos')
      .setParameter('pago', 'PAGO')
      .groupBy('ir.userId')
      .getRawMany();

    const statusMap = new Map<number, 'PAGO' | 'PENDENTE'>();
    statusRaw.forEach(row => {
      const total = parseInt(row.totalItens);
      const pagos = parseInt(row.itensPagos);
      statusMap.set(Number(row.userId), total === pagos ? 'PAGO' : 'PENDENTE');
    });

    // ---- Descontos (despesas do responsável, não atribuídas à OS, com data_liberacao no período) ----
    const descontosQuery = this.expenseRepository
      .createQueryBuilder('expense')
      .innerJoin('expense.responsible', 'responsible')
      .where('responsible.employeeId IN (:...userIds)', { userIds })
      .andWhere('expense.assignToOrderService = :assign', { assign: false })
      .andWhere('expense.data_liberacao IS NOT NULL')
      .andWhere('expense.data_liberacao >= :dataInicio', { dataInicio })
      .andWhere('expense.data_liberacao <= :dataFim', { dataFim })
      .select('responsible.employeeId', 'userId')
      .addSelect('SUM(expense.amount)', 'totalDesconto')
      .groupBy('responsible.employeeId');

    const descontosAgrupados = await descontosQuery.getRawMany();
    const descontoMap = new Map<number, number>();
    descontosAgrupados.forEach(row => {
      descontoMap.set(Number(row.userId), parseFloat(row.totalDesconto) || 0);
    });

    // ---- Montar resultado ----
    let resultados = usuarios.map(user => {
      const salarioBase = parseFloat(user.salarioBase?.toString() || '0');
      const comissaoData = comissaoMap.get(user.id) || { total: 0, dataLiberacao: null };
      const adicionais = comissaoData.total;
      const descontos = descontoMap.get(user.id) || 0;
      const status = statusMap.get(user.id) || 'PENDENTE';

      return {
        userId: user.id,
        nome: user.name || 'Sem nome',
        salarioBase,
        adicionais,
        descontos,
        total: salarioBase + adicionais - descontos,
        statusPagamento: status,
        dataLiberacao: comissaoData.dataLiberacao,
      };
    });

    if (query.search) {
      const search = query.search.toLowerCase();
      resultados = resultados.filter(p => p.nome.toLowerCase().includes(search));
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const start = (page - 1) * limit;
    return resultados.slice(start, start + limit);
  }

 async findItensLiberadosPorUsuario(
  user: any,
  usuarioId: number,
  ano: number,
  mes: number,
): Promise<ResumoPagamentoDto> {
  const companyId = await this.userService.getCompanyIdFromRequestUser(user.id);
  if (!companyId) throw new Error('Usuário não possui empresa associada.');

  const targetUser = await this.userRepository.findOne({
    where: { id: usuarioId, companyId, active: true },
    select: { id: true, name: true, salarioBase: true },
  });
  if (!targetUser) throw new BadRequestException('Funcionário não encontrado ou inativo');

  const salarioBase = parseFloat(targetUser.salarioBase?.toString() || '0');

  const startDate = new Date(ano, mes - 1, 1, 0, 0, 0);
  const endDate = new Date(ano, mes, 0, 23, 59, 59);

  // ---- Itens de comissão ----
  const queryItens = this.itemOsResponsavelRepository
    .createQueryBuilder('ir')
    .innerJoinAndSelect('ir.item', 'item')
    .innerJoinAndSelect('item.ordemServico', 'os')
    .where('ir.userId = :usuarioId', { usuarioId })
    .andWhere('item.data_liberacao IS NOT NULL')
    .andWhere('item.data_liberacao BETWEEN :start AND :end', {
      start: startDate,
      end: endDate,
    })
    .orderBy('item.data_liberacao', 'DESC');

  const resultsItens = await queryItens.getMany();

  let comissaoTotal = 0;
  const itensDto: ItemLiberadoResponseDto[] = resultsItens.map((ir) => {
    const item = ir.item;
    const comissaoPercentual = ir.comissao || 0;
    const valorUnitario = parseFloat(item.valor?.toString() || '0');
    const quantidade = item.quantidade || 1;
    const valorComissao = valorUnitario * quantidade * (comissaoPercentual / 100);
    comissaoTotal += valorComissao;

    return {
      id: ir.id,
      nomeItem: item.nome,
      valor: valorUnitario,
      quantidade: quantidade,
      comissaoPercentual: comissaoPercentual,
      valorComissao: valorComissao,
      statusPagamento: item.statusPagamento,
      dataLiberacao: item.data_liberacao,
      ordemServicoId: item.ordemServicoId,
    };
  });

  // ---- Despesas (descontos) ----
  const queryDespesas = this.expenseRepository
    .createQueryBuilder('expense')
    .innerJoin('expense.responsible', 'responsible')
    .where('responsible.employeeId = :usuarioId', { usuarioId })
    .andWhere('expense.assignToOrderService = :assign', { assign: false })
    .andWhere('expense.data_liberacao IS NOT NULL')
    .andWhere('expense.data_liberacao BETWEEN :start AND :end', {
      start: startDate,
      end: endDate,
    })
    .orderBy('expense.data_liberacao', 'DESC');

  const resultsDespesas = await queryDespesas.getMany();

  let totalDescontos = 0;
  const despesasDto: DespesaResponseDto[] = resultsDespesas.map((expense) => {
    const amount = parseFloat(expense.amount?.toString() || '0');
    totalDescontos += amount;

    return {
      id: expense.id,
      descricao: expense.description,
      amount: amount,
      dataLiberacao: expense.data_liberacao,
      statusDebito: expense.statusDebito,
    };
  });

  const totalLiquido = salarioBase + comissaoTotal - totalDescontos;

  return {
    nome: targetUser.name || 'Sem nome',
    salarioBase,
    comissaoTotal,
    descontos: totalDescontos,
    totalLiquido,
    periodo: { ano, mes },
    itens: itensDto,
    despesas: despesasDto, // <-- NOVO
  };
}

async marcarPago(user: any, payload: MarcarPagoPayloadDto): Promise<MarcarPagoResponseDto> {
  const companyId = await this.userService.getCompanyIdFromRequestUser(user.id);
  if (!companyId) throw new Error('Usuário não possui empresa associada.');

  const { dados_para_folha_pagamento, itens, despesas } = payload;
  const { usuarioId } = dados_para_folha_pagamento;

  // Verificar se o funcionário pertence à empresa
  const targetUser = await this.userRepository.findOne({
    where: { id: usuarioId, companyId, active: true },
  });
  if (!targetUser) {
    throw new BadRequestException('Funcionário não encontrado ou não pertence à sua empresa');
  }

  let itensAtualizados = 0;
  let despesasAtualizadas = 0;

  // Atualizar itens (comissões)
  if (itens && itens.length > 0) {
    const itemIds = itens.map(item => item.id);
    // Buscar os registros de ItemOsResponsavel (ou ItemOs?) - precisamos atualizar o status do item em si.
    // O item é a entidade ItemOs, que possui statusPagamento.
    // O ID enviado é o id do ItemOsResponsavel? No exemplo é "id": 1, que parece ser o ID do relacionamento.
    // Mas para atualizar o status, precisamos do item (ItemOs). Vamos supor que o ID seja do ItemOsResponsavel,
    // mas o status está no ItemOs. Vamos buscar o ItemOsResponsavel e depois o ItemOs.
    // Ou podemos receber o itemId diretamente. Para simplificar, vou considerar que o id é do ItemOs (ou do responsável?).
    // No payload exemplo, "id": 1 e "ordemServicoId": 15 - parece ser do ItemOs. Vou tratar como id do ItemOs.
    // Então, vou buscar os ItemOs pelos ids fornecidos.
    const itemOsRepository = this.itemOsResponsavelRepository.manager.getRepository('ItemOs'); // ou injetar ItemOsRepository
    // Melhor: injetar o repositório de ItemOs no construtor.
    // Mas vou usar o query builder para atualizar diretamente.
    await this.itemOsResponsavelRepository.manager
      .createQueryBuilder()
      .update('ItemOs')
      .set({ statusPagamento: ItemOsStatusPagamento.PAGO })
      .whereInIds(itemIds)
      .execute();
    itensAtualizados = itemIds.length;
  }

  // Atualizar despesas (OrderServiceResponsibleExpense)
  if (despesas && despesas.length > 0) {
    const despesaIds = despesas.map(d => d.id);
    await this.expenseRepository
      .createQueryBuilder()
      .update(OrderServiceResponsibleExpense)
      .set({ statusDebito: ItemOsStatusPagamento.PAGO })
      .whereInIds(despesaIds)
      .execute();
    despesasAtualizadas = despesaIds.length;
  }

  // Opcional: criar registro de folha de pagamento (futuro)
  // Aqui você pode chamar um serviço para criar a folha.

  return {
    message: 'Pagamento registrado com sucesso',
    itensAtualizados,
    despesasAtualizadas,
  };
}
}