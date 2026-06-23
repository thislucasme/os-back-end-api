import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { CreateProdutoServicoDto } from './dto/create-produto-servico.dto';
import { UpdateProdutoServicoDto } from './dto/update-produto-servico.dto';
import {
  ProdutoServico,
  TipoItem,
} from './entities/produto-servico.entity';
import { Company } from 'src/companies/ company.entity';

@Injectable()
export class ProdutosServicosService {
  constructor(
    @InjectRepository(ProdutoServico)
    private readonly repo: Repository<ProdutoServico>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  private async getCompanyByUserId(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: {
        company: true,
      },
    });

    if (!user || !user.company) {
      throw new BadRequestException('Usuário não possui empresa vinculada.');
    }

    return user.company;
  }

  async create(userId: number, dto: CreateProdutoServicoDto) {
    const company = await this.getCompanyByUserId(userId);

    if (dto.sku) {
      const exists = await this.repo.findOne({
        where: {
          companyId: company.id,
          sku: dto.sku,
        },
      });

      if (exists) {
        throw new BadRequestException('Já existe um item com este SKU.');
      }
    }

    const item = this.repo.create({
      ...dto,
      companyId: company.id,
      quantidade:
        dto.tipo === TipoItem.PRODUTO
          ? dto.quantidade ?? dto.saldoInicial ?? 0
          : 0,
    });

    return this.repo.save(item);
  }

  async findAll(
    userId: number,
    query: {
      search?: string;
      page?: string;
      limit?: string;
      tipo?: TipoItem;
    },
  ) {
    const company = await this.getCompanyByUserId(userId);

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = query.search?.trim();

    const qb = this.repo
      .createQueryBuilder('item')
      .where('item.companyId = :companyId', {
        companyId: company.id,
      });

    if (query.tipo) {
      qb.andWhere('item.tipo = :tipo', {
        tipo: query.tipo,
      });
    }

    if (search) {
      qb.andWhere(
        `(
          item.nome LIKE :search OR
          item.sku LIKE :search OR
          item.marca LIKE :search OR
          item.categoria LIKE :search OR
          item.fornecedor LIKE :search OR
          item.deposito LIKE :search
        )`,
        {
          search: `%${search}%`,
        },
      );
    }

    const [data, total] = await qb
      .orderBy('item.id', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(userId: number, id: number) {
    const company = await this.getCompanyByUserId(userId);

    const item = await this.repo.findOne({
      where: {
        id,
        companyId: company.id,
      },
    });

    if (!item) {
      throw new NotFoundException('Produto ou serviço não encontrado.');
    }

    return item;
  }

  async update(userId: number, id: number, dto: UpdateProdutoServicoDto) {
    const company = await this.getCompanyByUserId(userId);
    const item = await this.findOne(userId, id);

    if (dto.sku && dto.sku !== item.sku) {
      const exists = await this.repo.findOne({
        where: {
          companyId: company.id,
          sku: dto.sku,
        },
      });

      if (exists) {
        throw new BadRequestException('Já existe um item com este SKU.');
      }
    }

    Object.assign(item, dto);

    if (item.tipo === TipoItem.SERVICO) {
      item.quantidade = 0;
      item.estoqueMinimo = 0;
      item.estoqueMaximo = 0;
      item.saldoInicial = 0;
      item.precoCompraUnitario = 0;
    }

    return this.repo.save(item);
  }

  async remove(userId: number, id: number) {
    const item = await this.findOne(userId, id);

    await this.repo.remove(item);

    return {
      message: 'Produto ou serviço removido com sucesso.',
    };
  }
}