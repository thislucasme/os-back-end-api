// src/modules/ordens-servico/services/itens-os.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsRelations } from 'typeorm';
import { ItemOs, ItemOsTipo } from './entities/item-os.entity';
import { OrdemServico } from './entities/ordem-servico.entity';
import { ProdutoServico } from 'src/produtos-servicos/entities/produto-servico.entity';
import { User } from 'src/users/user.entity';
import { CreateItemOsDto } from './dto/itens-os/create-item-os.dto';
import { UpdateItemOsDto } from './dto/itens-os/update-item-os.dto';

@Injectable()
export class ItensOsService {
  constructor(
    @InjectRepository(ItemOs)
    private itemOsRepository: Repository<ItemOs>,
    @InjectRepository(OrdemServico)
    private ordemServicoRepository: Repository<OrdemServico>,
    @InjectRepository(ProdutoServico)
    private produtoServicoRepository: Repository<ProdutoServico>,
    @InjectRepository(User)
    private funcionarioRepository: Repository<User>,
  ) {}

  async create(createDto: CreateItemOsDto): Promise<ItemOs> {
    // Validação: ordem de serviço existe
    const os = await this.ordemServicoRepository.findOne({
      where: { id: createDto.ordemServicoId },
    });
    if (!os) {
      throw new NotFoundException('Ordem de serviço não encontrada');
    }

    // Validação: produto/serviço existe
    const produto = await this.produtoServicoRepository.findOne({
      where: { id: createDto.produtoServicoId },
    });
    if (!produto) {
      throw new NotFoundException('Produto/serviço não encontrado');
    }

    // Validação: responsável (se informado) existe
    let responsavel: User | null = null;
    if (createDto.responsavelId) {
      responsavel = await this.funcionarioRepository.findOne({
        where: { id: createDto.responsavelId },
      });
      if (!responsavel) {
        throw new NotFoundException('Responsável não encontrado');
      }
    }

    // Mapear o tipo: produto.tipo (TipoItem) -> ItemOsTipo
    let tipoItem: ItemOsTipo;
    if (produto.tipo === 'PRODUTO') {
      tipoItem = ItemOsTipo.PRODUTO;
    } else if (produto.tipo === 'SERVICO') {
      tipoItem = ItemOsTipo.SERVICO;
    } else {
      throw new BadRequestException('Tipo de produto/serviço inválido');
    }

    // Cria o item
    const item = this.itemOsRepository.create({
      ordemServicoId: createDto.ordemServicoId,
      produtoServicoId: createDto.produtoServicoId,
      tipo: tipoItem,
      nome: createDto.nome || produto.nome,
      valor: createDto.valor,
      responsavelId: createDto.responsavelId || null,
      comissao: createDto.comissao,
    });

    return this.itemOsRepository.save(item);
  }

  async findAllByOrdem(ordemServicoId: number): Promise<ItemOs[]> {
    const relations: FindOptionsRelations<ItemOs> = {
      produtoServico: true,
      responsavel: true,
    };
    return this.itemOsRepository.find({
      where: { ordemServicoId },
      relations,
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: number): Promise<ItemOs> {
    const relations: FindOptionsRelations<ItemOs> = {
      produtoServico: true,
      responsavel: true,
    };
    const item = await this.itemOsRepository.findOne({
      where: { id },
      relations,
    });
    if (!item) {
      throw new NotFoundException('Item não encontrado');
    }
    return item;
  }

  async update(id: number, updateDto: UpdateItemOsDto): Promise<ItemOs> {
    const item = await this.findOne(id);

    // Se for atualizar o produto, validar novamente
    if (updateDto.produtoServicoId && updateDto.produtoServicoId !== item.produtoServicoId) {
      const produto = await this.produtoServicoRepository.findOne({
        where: { id: updateDto.produtoServicoId },
      });
      if (!produto) {
        throw new NotFoundException('Produto/serviço não encontrado');
      }
      // Mapeia o tipo
      let tipoItem: ItemOsTipo;
      if (produto.tipo === 'PRODUTO') {
        tipoItem = ItemOsTipo.PRODUTO;
      } else if (produto.tipo === 'SERVICO') {
        tipoItem = ItemOsTipo.SERVICO;
      } else {
        throw new BadRequestException('Tipo de produto/serviço inválido');
      }
      item.tipo = tipoItem;
      // Se nome não foi enviado, usa o nome do produto
      if (!updateDto.nome) {
        item.nome = produto.nome;
      }
      // Atualiza produtoServicoId
      item.produtoServicoId = updateDto.produtoServicoId;
    }

    // Validar responsável se for alterado
    if (updateDto.responsavelId !== undefined) {
      if (updateDto.responsavelId) {
        const responsavel = await this.funcionarioRepository.findOne({
          where: { id: updateDto.responsavelId },
        });
        if (!responsavel) {
          throw new NotFoundException('Responsável não encontrado');
        }
      }
      item.responsavelId = updateDto.responsavelId;
    }

    // Atualiza os demais campos
    if (updateDto.nome) item.nome = updateDto.nome;
    if (updateDto.valor) item.valor = updateDto.valor;
    if (updateDto.comissao !== undefined) item.comissao = updateDto.comissao;

    return this.itemOsRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.itemOsRepository.remove(item);
  }

  async removeAllByOrdem(ordemServicoId: number): Promise<void> {
    await this.itemOsRepository.delete({ ordemServicoId });
  }
}