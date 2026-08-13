import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { NbsEntity } from './entities/nbs.entity';
import { ServicoNacionalEntity } from './entities/servico-nacional.entity';

@Injectable( )
export class TributosService {
  private readonly logger = new Logger(TributosService.name);

  constructor(
    @InjectRepository(NbsEntity)
    private readonly nbsRepo: Repository<NbsEntity>,
    @InjectRepository(ServicoNacionalEntity)
    private readonly servicoNacionalRepo: Repository<ServicoNacionalEntity>,
  ) {}

  // ==========================================
  // BUSCA INTELIGENTE PARA NBS (Código ou Descrição)
  // ==========================================
  async buscarNbs(termo: string): Promise<NbsEntity[]> {
    if (!termo) return [];

    const termoLimpo = termo.trim();
    const isNumero = !isNaN(Number(termoLimpo));

    if (isNumero) {
      // Se for número, busca por código exato ou que comece com o termo digitado
      return this.nbsRepo.find({
        where: [
          { codigoNbs: termoLimpo },
          { codigoNbs: Like(`${termoLimpo}%`) }
        ],
        take: 20,
      });
    }

    // Se for texto, busca na descrição
    return this.nbsRepo.find({
      where: { descricao: Like(`%${termoLimpo}%`) },
      take: 20,
    });
  }

  // ==========================================
  // BUSCA INTELIGENTE PARA SERVIÇO NACIONAL (Código, Item/Subitem ou Descrição)
  // ==========================================
  async buscarServicoNacional(termo: string): Promise<ServicoNacionalEntity[]> {
    if (!termo) return [];

    const termoLimpo = termo.trim();
    const isNumero = !isNaN(Number(termoLimpo));

    if (isNumero) {
      // Se for número, busca pelo código de tributação nacional ou item/subitem
      return this.servicoNacionalRepo.find({
        where: [
          { codigoTributacaoNacional: termoLimpo },
          { codigoTributacaoNacional: Like(`${termoLimpo}%`) }
        ],
        take: 20,
      });
    }

    // Se for texto, busca na descrição
    return this.servicoNacionalRepo.find({
      where: { descricao: Like(`%${termoLimpo}%`) },
      take: 20,
    });
  }
}