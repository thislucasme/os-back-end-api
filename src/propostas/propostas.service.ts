import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  OrdemServico,
  OrdemServicoStatus,
} from 'src/ordens-servico/entities/ordem-servico.entity';
import { Repository } from 'typeorm';

import { UpdatePropostaDto } from 'src/ordens-servico/dto/update-proposta.dto';
import { Proposta, PropostaStatus } from 'src/ordens-servico/entities/proposta.entity';
import { CreatePropostaDto } from 'src/ordens-servico/dto/create-proposta.dto';

@Injectable()
export class PropostasService {
  constructor(
    @InjectRepository(Proposta)
    private readonly propostaRepo: Repository<Proposta>,

    @InjectRepository(OrdemServico)
    private readonly osRepo: Repository<OrdemServico>,
  ) {}

  async findAll(companyId?: number) {
    return this.propostaRepo.find({
      where: companyId ? { companyId } : {},
      relations: {
        cliente: true,
        ordemServico: true,
        itens: {
          produtoServico: true,
        },
      },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const proposta = await this.propostaRepo.findOne({
      where: { id },
      relations: {
        cliente: true,
        ordemServico: true,
        itens: {
          produtoServico: true,
        },
      },
    });

    if (!proposta) {
      throw new NotFoundException('Proposta não encontrada');
    }

    return proposta;
  }

  async create(dto: CreatePropostaDto) {
    const itens =
      dto.itens?.map((item) => ({
        produtoServicoId: item.produtoServicoId,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
        valorTotal: Number(item.quantidade) * Number(item.valorUnitario),
      })) ?? [];

    const subtotal = itens.reduce((total, item) => total + item.valorTotal, 0);
    const desconto = Number(dto.desconto ?? 0);

    const proposta = this.propostaRepo.create({
      ...dto,
      numero: await this.generateNumero(),
      subtotal,
      desconto,
      valorTotal: subtotal - desconto,
      itens,
    });

    return this.propostaRepo.save(proposta);
  }

  async update(id: number, dto: UpdatePropostaDto) {
    const proposta = await this.findOne(id);

    const itens =
      dto.itens?.map((item) => ({
        produtoServicoId: item.produtoServicoId,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
        valorTotal: Number(item.quantidade) * Number(item.valorUnitario),
      })) ?? proposta.itens;

    const subtotal = itens.reduce(
      (total, item) => total + Number(item.valorTotal),
      0,
    );

    const desconto = Number(dto.desconto ?? proposta.desconto ?? 0);

    Object.assign(proposta, {
      ...dto,
      itens,
      subtotal,
      desconto,
      valorTotal: subtotal - desconto,
    });

    return this.propostaRepo.save(proposta);
  }

  async aprovar(id: number) {
    const proposta = await this.findOne(id);

    proposta.status = PropostaStatus.APROVADA;

    const saved = await this.propostaRepo.save(proposta);

    if (proposta.ordemServicoId) {
      await this.osRepo.update(proposta.ordemServicoId, {
        status: OrdemServicoStatus.APROVADO,
      });
    }

    return saved;
  }

  async recusar(id: number) {
    const proposta = await this.findOne(id);
    proposta.status = PropostaStatus.RECUSADA;
    return this.propostaRepo.save(proposta);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.propostaRepo.delete(id);
    return { deleted: true };
  }

  async pdf(id: number) {
    const proposta = await this.findOne(id);

    const itensHtml =
      proposta.itens
        ?.map(
          (item) => `
            <tr>
              <td>${item.produtoServico?.nome ?? item.descricao}</td>
              <td>${item.quantidade}</td>
              <td>R$ ${Number(item.valorUnitario).toFixed(2)}</td>
              <td>R$ ${Number(item.valorTotal).toFixed(2)}</td>
            </tr>
          `,
        )
        .join('') ?? '';

    return `
      <html>
        <body>
          <h1>${proposta.numero}</h1>
          <h2>${proposta.titulo}</h2>
          <p><strong>Cliente:</strong> ${proposta.cliente?.nome ?? '-'}</p>
          <p><strong>Status:</strong> ${proposta.status}</p>

          <table border="1" cellspacing="0" cellpadding="8">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qtd</th>
                <th>Unitário</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itensHtml}
            </tbody>
          </table>

          <h3>Total: R$ ${Number(proposta.valorTotal).toFixed(2)}</h3>
        </body>
      </html>
    `;
  }

  private async generateNumero() {
    const count = await this.propostaRepo.count();
    return `PROP-${String(count + 1).padStart(4, '0')}`;
  }
}