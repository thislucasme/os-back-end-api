import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ItemOs, ItemOsTipo, ItemOsOrigem, ItemOsLiberacao } from './entities/item-os.entity';
import { ItemOsResponsavel } from './entities/item-os-responsavel.entity';
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
    @InjectRepository(ItemOsResponsavel)
    private itemOsResponsavelRepository: Repository<ItemOsResponsavel>,
    @InjectRepository(OrdemServico)
    private ordemServicoRepository: Repository<OrdemServico>,
    @InjectRepository(ProdutoServico)
    private produtoServicoRepository: Repository<ProdutoServico>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createDto: CreateItemOsDto): Promise<ItemOs> {
    const os = await this.ordemServicoRepository.findOne({
      where: { id: createDto.ordemServicoId },
    });
    if (!os) throw new NotFoundException('Ordem de serviço não encontrada');

    const produto = await this.produtoServicoRepository.findOne({
      where: { id: createDto.produtoServicoId },
    });
    if (!produto) throw new NotFoundException('Produto/serviço não encontrado');

    const responsaveisData = createDto.responsaveis || [];
    if (responsaveisData.length === 0) {
      throw new BadRequestException('Pelo menos um responsável com comissão é obrigatório');
    }
    const userIds = responsaveisData.map(r => r.responsavelId);
    const users = await this.userRepository.find({
      where: { id: In(userIds) }, // ✅ corrigido
    });
    if (users.length !== userIds.length) {
      throw new NotFoundException('Um ou mais responsáveis não encontrados');
    }

    let tipoItem: ItemOsTipo;
    if (produto.tipo === 'PRODUTO') tipoItem = ItemOsTipo.PRODUTO;
    else if (produto.tipo === 'SERVICO') tipoItem = ItemOsTipo.SERVICO;
    else throw new BadRequestException('Tipo de produto/serviço inválido');

    const item = this.itemOsRepository.create({
      ordemServicoId: createDto.ordemServicoId,
      produtoServicoId: createDto.produtoServicoId,
      tipo: tipoItem,
      nome: createDto.nome || produto.nome,
      valor: createDto.valor,
      quantidade: createDto.quantidade ?? 1,
      origem: createDto.origem || ItemOsOrigem.OS,
      liberacao: createDto.liberacao
    });
    const savedItem = await this.itemOsRepository.save(item);

    const responsaveisEntities = responsaveisData.map(r =>
      this.itemOsResponsavelRepository.create({
        itemId: savedItem.id,
        userId: r.responsavelId,
        comissao: r.comissao,
      }),
    );
    await this.itemOsResponsavelRepository.save(responsaveisEntities);

    return this.findOne(savedItem.id);
  }


  async findAllByOrdem(ordemServicoId: number): Promise<ItemOs[]> {
    return this.itemOsRepository.find({
      where: { ordemServicoId },
      relations: { responsaveis: { user: true } },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: number): Promise<ItemOs> {
    const item = await this.itemOsRepository.findOne({
      where: { id },
      relations: { responsaveis: { user: true } },
    });
    if (!item) throw new NotFoundException('Item não encontrado');
    return item;
  }

  async update(id: number, updateDto: UpdateItemOsDto): Promise<ItemOs> {
    const item = await this.findOne(id);

    // Atualizar campos básicos
    if (updateDto.produtoServicoId && updateDto.produtoServicoId !== item.produtoServicoId) {
      const produto = await this.produtoServicoRepository.findOne({
        where: { id: updateDto.produtoServicoId },
      });
      if (!produto) throw new NotFoundException('Produto/serviço não encontrado');
      let tipoItem: ItemOsTipo;
      if (produto.tipo === 'PRODUTO') tipoItem = ItemOsTipo.PRODUTO;
      else if (produto.tipo === 'SERVICO') tipoItem = ItemOsTipo.SERVICO;
      else throw new BadRequestException('Tipo inválido');
      item.tipo = tipoItem;
      item.produtoServicoId = updateDto.produtoServicoId;
      if (!updateDto.nome) item.nome = produto.nome;
    }
    if (updateDto.nome) item.nome = updateDto.nome;
    if (updateDto.valor !== undefined) item.valor = updateDto.valor;
    if (updateDto.quantidade !== undefined) item.quantidade = updateDto.quantidade;
    if (updateDto.origem) item.origem = updateDto.origem;
    if (updateDto.liberacao) item.liberacao = updateDto.liberacao;

    // Atualizar responsáveis/comissões (substituir)
    if (updateDto.responsaveis !== undefined) {
      const responsaveisData = updateDto.responsaveis;
      if (responsaveisData.length === 0) {
        throw new BadRequestException('Pelo menos um responsável com comissão é obrigatório');
      }
      const userIds = responsaveisData.map(r => r.responsavelId);
      const users = await this.userRepository.findBy({ id: userIds as any });
      if (users.length !== userIds.length) {
        throw new NotFoundException('Um ou mais responsáveis não encontrados');
      }

      // Remover antigos
      await this.itemOsResponsavelRepository.delete({ itemId: id });

      // Criar novos
      const newResponsaveis = responsaveisData.map(r =>
        this.itemOsResponsavelRepository.create({
          itemId: id,
          userId: r.responsavelId,
          comissao: r.comissao,
        }),
      );
      await this.itemOsResponsavelRepository.save(newResponsaveis);
    }

    // Salvar item
    await this.itemOsRepository.save(item);

    // Recarregar com relações
    return this.findOne(id);
  }
  async marcarLiberacaoNaConclusao(ordemServicoId: number): Promise<void> {
  await this.itemOsRepository.update(
    {
      ordemServicoId,
      liberacao: ItemOsLiberacao.NA_CONCLUSAO_OS,
    },
    {
      data_liberacao: new Date(),
    }
  );
}

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.itemOsRepository.remove(item);
  }

  async removeAllByOrdem(ordemServicoId: number): Promise<void> {
    await this.itemOsRepository.delete({ ordemServicoId });
  }
}