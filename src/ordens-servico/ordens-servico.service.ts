// src/ordens-servico/ordens-servico.service.ts

import {
    ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/users/user.entity';

import {
  OrdemServico,
  OrdemServicoStatus,
} from './entities/ordem-servico.entity';

import { OrdemServicoAnexo } from './entities/ordem-servico-anexo.entity';
import { OrdemServicoHistorico } from './entities/ordem-servico-historico.entity';

import {
  Proposta,
  PropostaStatus,
} from './entities/proposta.entity';

import { CreateOrdemServicoDto } from './dto/create-ordem-servico.dto';
import { UpdateOrdemServicoDto } from './dto/update-ordem-servico.dto';
import { GerarPropostaDto } from './dto/gerar-proposta.dto';

@Injectable()
export class OrdensServicoService {
  constructor(
    @InjectRepository(OrdemServico)
    private readonly osRepo: Repository<OrdemServico>,

    @InjectRepository(OrdemServicoAnexo)
    private readonly anexosRepo: Repository<OrdemServicoAnexo>,

    @InjectRepository(OrdemServicoHistorico)
    private readonly historicoRepo: Repository<OrdemServicoHistorico>,

    @InjectRepository(Proposta)
    private readonly propostaRepo: Repository<Proposta>,

    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  // =========================================================
  // HELPERS
  // =========================================================

  private async getCompanyId(
    userId: number,
  ): Promise<number> {
    const user = await this.usersRepo.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new ForbiddenException(
        'Usuário não encontrado',
      );
    }

    if (!user.companyId) {
      throw new ForbiddenException(
        'Usuário não possui empresa vinculada',
      );
    }

    return user.companyId;
  }
private async generateNumero(companyId: number): Promise<string> {
  const last = await this.osRepo
    .createQueryBuilder('os')
    .where('os.companyId = :companyId', { companyId })
    .andWhere('os.numero LIKE :prefix', { prefix: 'OS-%' })
    .orderBy('os.id', 'DESC')
    .getOne();

  const lastNumber = last?.numero
    ? Number(last.numero.replace('OS-', ''))
    : 0;

  const nextNumber = lastNumber + 1;

  return `OS-${String(nextNumber).padStart(4, '0')}`;
}

  private async generateNumeroProposta() {
    const total =
      await this.propostaRepo.count();

    return `PROP-${String(
      total + 1,
    ).padStart(4, '0')}`;
  }

  private async addHistorico(
    ordemServicoId: number,
    acao: string,
    descricao?: string,
  ) {
    const historico =
      this.historicoRepo.create({
        ordemServicoId,
        acao,
        descricao,
      });

    await this.historicoRepo.save(
      historico,
    );
  }

  // =========================================================
  // LISTAR
  // =========================================================

  async findAll(userId: number) {
    const companyId =
      await this.getCompanyId(userId);

    return this.osRepo.find({
      where: {
        companyId,
      },
      relations: {
        cliente: true,
        responsavel: true,
        itens: {
          produtoServico: true,
        },
        anexos: true,
        propostas: true,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  // =========================================================
  // BUSCAR
  // =========================================================

  async findOne(
    id: number,
    userId: number,
  ) {
    const companyId =
      await this.getCompanyId(userId);

    const os =
      await this.osRepo.findOne({
        where: {
          id,
          companyId,
        },
        relations: {
          cliente: true,
          responsavel: true,

          itens: {
            produtoServico: true,
          },

          anexos: true,

          propostas: {
            itens: {
              produtoServico: true,
            },
          },
        },
      });

    if (!os) {
      throw new NotFoundException(
        'Ordem de serviço não encontrada',
      );
    }

    return os;
  }

  // =========================================================
  // CRIAR
  // =========================================================

async create(dto: CreateOrdemServicoDto, userId: number) {
  const companyId = await this.getCompanyId(userId);

  for (let attempt = 0; attempt < 5; attempt++) {
    const numero = await this.generateNumero(companyId);

    try {
      const os = this.osRepo.create({
        ...dto,
        companyId,
        numero,
        valorTotal: dto['valorTotal'] ?? 0,
      });

      const saved = await this.osRepo.save(os);

      await this.addHistorico(
        saved.id,
        'OS criada',
        'Ordem de serviço criada.',
      );

      return this.findOne(saved.id, userId);
    } catch (error: any) {
      if (error?.code !== 'ER_DUP_ENTRY') {
        throw error;
      }
    }
  }

  throw new ConflictException('Não foi possível gerar número único para a OS.');
}

  // =========================================================
  // EDITAR
  // =========================================================

  async update(
    id: number,
    dto: UpdateOrdemServicoDto,
    userId: number,
  ) {
    const os =
      await this.findOne(
        id,
        userId,
      );

    Object.assign(os, dto);

    const saved =
      await this.osRepo.save(os);

    await this.addHistorico(
      saved.id,
      'OS editada',
      'Dados atualizados.',
    );

    return this.findOne(
      saved.id,
      userId,
    );
  }

  // =========================================================
  // STATUS
  // =========================================================

  async updateStatus(
    id: number,
    status: OrdemServicoStatus,
    userId: number,
  ) {
    const os =
      await this.findOne(
        id,
        userId,
      );

    const anterior =
      os.status;

    os.status = status;

    const saved =
      await this.osRepo.save(os);

    await this.addHistorico(
      saved.id,
      'Status alterado',
      `Status alterado de "${anterior}" para "${status}".`,
    );

    return this.findOne(
      saved.id,
      userId,
    );
  }

  // =========================================================
  // GERAR PROPOSTA
  // =========================================================

  async gerarProposta(
    id: number,
    dto: GerarPropostaDto,
    userId: number,
  ) {
    const os =
      await this.findOne(
        id,
        userId,
      );

    const proposta =
      new Proposta();

    proposta.companyId =
      os.companyId;

    proposta.ordemServicoId =
      os.id;

    proposta.clienteId =
      os.clienteId ?? null;

    proposta.numero =
      await this.generateNumeroProposta();

    proposta.titulo =
      `Proposta da ${os.numero}`;

    proposta.descricao =
      os.diagnosticoTecnico ||
      os.defeitoRelatado ||
      os.titulo;

    proposta.status =
      PropostaStatus.RASCUNHO;

    proposta.dataEmissao =
      new Date()
        .toISOString()
        .slice(0, 10);

    proposta.validade =
      dto.validade ?? null;

    proposta.condicoesPagamento =
      dto.condicoesPagamento ??
      '';

    proposta.observacoes =
      dto.observacoes ?? '';

    proposta.garantia =
      os.garantia ?? '';

    proposta.mensagemFinal =
      os.mensagemFinal ?? '';

    proposta.subtotal = 0;
    proposta.desconto = 0;
    proposta.valorTotal = 0;
    proposta.itens = [];

    const saved =
      await this.propostaRepo.save(
        proposta,
      );

    await this.addHistorico(
      os.id,
      'Proposta gerada',
      `Proposta ${saved.numero} criada a partir da OS.`,
    );

    return saved;
  }

  // =========================================================
  // ANEXOS
  // =========================================================

  async addAnexos(
    id: number,
    files: Express.Multer.File[],
    userId: number,
  ) {
    const os =
      await this.findOne(
        id,
        userId,
      );

    const anexos = files.map(
      (file) =>
        this.anexosRepo.create({
          ordemServicoId:
            os.id,
          filename:
            file.filename,
          originalName:
            file.originalname,
          mimeType:
            file.mimetype,
          url: `/uploads/os/${file.filename}`,
        }),
    );

    const saved =
      await this.anexosRepo.save(
        anexos,
      );

    await this.addHistorico(
      os.id,
      'Anexos enviados',
      `${saved.length} anexo(s) enviados.`,
    );

    return saved;
  }

  // =========================================================
  // REMOVER ANEXO
  // =========================================================

  async removeAnexo(
    anexoId: number,
    userId: number,
  ) {
    const companyId =
      await this.getCompanyId(userId);

    const anexo =
      await this.anexosRepo.findOne({
        where: {
          id: anexoId,
        },
        relations: {
          ordemServico: true,
        },
      });

    if (!anexo) {
      throw new NotFoundException(
        'Anexo não encontrado',
      );
    }

    if (
      anexo.ordemServico
        ?.companyId !== companyId
    ) {
      throw new ForbiddenException(
        'Sem permissão',
      );
    }

    await this.anexosRepo.delete(
      anexoId,
    );

    await this.addHistorico(
      anexo.ordemServicoId,
      'Anexo removido',
      `Anexo ${anexo.originalName} removido.`,
    );

    return {
      deleted: true,
    };
  }

  // =========================================================
  // EXCLUIR OS
  // =========================================================

  async remove(
    id: number,
    userId: number,
  ) {
    const os =
      await this.findOne(
        id,
        userId,
      );

    await this.osRepo.delete(
      os.id,
    );

    return {
      deleted: true,
    };
  }

  // =========================================================
  // PDF
  // =========================================================

  async pdf(
    id: number,
    userId: number,
  ) {
    const os =
      await this.findOne(
        id,
        userId,
      );

    return `
      <html>
        <body>
          <h1>${os.numero}</h1>

          <h2>${os.titulo}</h2>

          <p>
            <strong>Cliente:</strong>
            ${os.cliente?.nome ?? '-'}
          </p>

          <p>
            <strong>Equipamento:</strong>
            ${os.equipamento ?? '-'}
          </p>

          <p>
            <strong>Status:</strong>
            ${os.status}
          </p>

          <p>
            <strong>Defeito:</strong>
            ${
              os.defeitoRelatado ??
              '-'
            }
          </p>

          <p>
            <strong>Diagnóstico:</strong>
            ${
              os.diagnosticoTecnico ??
              '-'
            }
          </p>
        </body>
      </html>
    `;
  }
}