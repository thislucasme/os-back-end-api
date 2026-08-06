// folha-pagamento.service.ts (versão com mapper)
import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PagamentosService } from '../pagamentos/pagamentos.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { FolhaPagamento, FolhaStatus } from './entities/folha-pagamento.entity';
import { CreateFolhaPagamentoDto } from './tdo/folha-pagamento-create.dto';
import { UpdateFolhaPagamentoDto } from './tdo/update-folha-pagamento.dto';
import { FolhaPagamentoResponseDto } from './tdo/folha-pagamento-response.dto';

@Injectable()
export class FolhaPagamentoService {
constructor(
  @InjectRepository(FolhaPagamento)
  private repo: Repository<FolhaPagamento>,

  @InjectRepository(User)
  private userRepo: Repository<User>,

  @Inject(forwardRef(() => PagamentosService))
  private readonly pagamentosService: PagamentosService,

  private readonly usersService: UsersService,
) {}

  // ----- Mapper: entidade -> DTO de resposta -----
private toResponseDto(entity: FolhaPagamento): FolhaPagamentoResponseDto {
  return {
    id: entity.id,
    usuarioId: entity.usuarioId,
    mes: entity.mes,
    ano: entity.ano,
    salarioBase: entity.salarioBase,
    comissaoTotal: entity.comissaoTotal,
    descontos: entity.descontos,
    totalLiquido: entity.totalLiquido,
    status: entity.status,
    observacoes: entity.observacoes || null,
    dataUltimaLiberacao: entity.dataUltimaLiberacao ? entity.dataUltimaLiberacao.toISOString() : null,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

  // ----- CREATE -----
  async create(user: any, dto: CreateFolhaPagamentoDto): Promise<FolhaPagamentoResponseDto> {
    const companyId = await this.usersService.getCompanyIdFromRequestUser(user.id);
    if (!companyId) throw new BadRequestException('Usuário sem empresa');

    const targetUser = await this.userRepo.findOne({
      where: { id: dto.usuarioId, companyId },
    });
    if (!targetUser) throw new BadRequestException('Funcionário não encontrado ou não pertence à sua empresa');

    const existing = await this.repo.findOne({
      where: { usuarioId: dto.usuarioId, mes: dto.mes, ano: dto.ano },
    });
    if (existing) {
      throw new BadRequestException('Já existe uma folha para este funcionário neste mês/ano');
    }

    let salarioBase = dto.salarioBase;
    let comissaoTotal = dto.comissaoTotal;
    let descontos = dto.descontos;
    let totalLiquido = dto.totalLiquido;
    let dataUltimaLiberacao: Date | null = null;

    if (salarioBase === undefined || comissaoTotal === undefined || descontos === undefined) {
      const resumo = await this.pagamentosService.findItensLiberadosPorUsuario(
        user,
        dto.usuarioId,
        dto.ano,
        dto.mes,
      );
      salarioBase = resumo.salarioBase;
      comissaoTotal = resumo.comissaoTotal;
      descontos = resumo.descontos;
      totalLiquido = resumo.totalLiquido;

      if (resumo.itens && resumo.itens.length > 0) {
        const datas = resumo.itens
          .map(item => item.dataLiberacao ? new Date(item.dataLiberacao) : null)
          .filter((d): d is Date => d !== null && !isNaN(d.getTime()));
        if (datas.length > 0) {
          dataUltimaLiberacao = new Date(Math.max(...datas.map(d => d.getTime())));
        }
      }
    } else {
      if (totalLiquido === undefined) {
        totalLiquido = (salarioBase || 0) + (comissaoTotal || 0) - (descontos || 0);
      }
    }

    const folha = this.repo.create({
      usuarioId: dto.usuarioId,
      mes: dto.mes,
      ano: dto.ano,
      salarioBase: salarioBase || 0,
      comissaoTotal: comissaoTotal || 0,
      descontos: descontos || 0,
      totalLiquido: totalLiquido || 0,
      status: dto.status ? (dto.status as FolhaStatus) : FolhaStatus.PENDENTE,
      observacoes: dto.observacoes || null,
      dataUltimaLiberacao,
    });

    const saved = await this.repo.save(folha);
    return this.toResponseDto(saved);
  }

  // ----- FIND ALL -----
  async findAll(
    user: any,
    query: any,
  ): Promise<{ data: FolhaPagamentoResponseDto[]; total: number }> {
    const companyId = await this.usersService.getCompanyIdFromRequestUser(user.id);
    if (!companyId) throw new BadRequestException('Usuário sem empresa');

    const qb = this.repo.createQueryBuilder('f')
      .innerJoin('f.usuario', 'u')
      .where('u.companyId = :companyId', { companyId });

    if (query.mes) qb.andWhere('f.mes = :mes', { mes: query.mes });
    if (query.ano) qb.andWhere('f.ano = :ano', { ano: query.ano });
    if (query.search) {
      qb.andWhere('u.name LIKE :search', { search: `%${query.search}%` });
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    // Aplica o mapper em cada item
    const mappedData = data.map(item => this.toResponseDto(item));

    return { data: mappedData, total };
  }

  // ----- FIND ONE -----
  async findOne(user: any, id: number): Promise<FolhaPagamentoResponseDto> {
    const companyId = await this.usersService.getCompanyIdFromRequestUser(user.id);
    if (!companyId) throw new BadRequestException('Usuário sem empresa');

    const folha = await this.repo.findOne({
      where: { id },
      relations: { usuario: true },
    });
    if (!folha) throw new NotFoundException('Folha não encontrada');
    if (folha.usuario.companyId !== companyId) {
      throw new BadRequestException('Acesso negado a esta folha');
    }
    return this.toResponseDto(folha);
  }

  // ----- UPDATE -----
  async update(
    user: any,
    id: number,
    dto: UpdateFolhaPagamentoDto,
  ): Promise<FolhaPagamentoResponseDto> {
    const folhaEntity = await this.repo.findOne({ where: { id } });
    if (!folhaEntity) throw new NotFoundException('Folha não encontrada');
    // Reutiliza a verificação de acesso do findOne
    await this.findOne(user, id); // só para verificar acesso

    const updates: any = { ...dto };
    if (dto.salarioBase !== undefined || dto.comissaoTotal !== undefined || dto.descontos !== undefined) {
      const base = dto.salarioBase ?? folhaEntity.salarioBase;
      const comissao = dto.comissaoTotal ?? folhaEntity.comissaoTotal;
      const desc = dto.descontos ?? folhaEntity.descontos;
      updates.totalLiquido = base + comissao - desc;
    }
    Object.assign(folhaEntity, updates);
    const saved = await this.repo.save(folhaEntity);
    return this.toResponseDto(saved);
  }

  // ----- DELETE -----
  async delete(user: any, id: number): Promise<void> {
    // Verifica acesso
    await this.findOne(user, id);
    await this.repo.delete(id);
  }
}