import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NbsEntity } from './entities/nbs.entity';

@Injectable()
export class NbsService {
  private readonly logger = new Logger(NbsService.name);
  
  // Usa a variável de ambiente ou assume o link oficial do governo como fallback
  private readonly urlNbs = process.env.NBS_CSV_URL || 'https://www.gov.br/mdic/pt-br/images/REPOSITORIO/scs/decos/NBS/NBSa_2-0.csv';

  constructor(
    @InjectRepository(NbsEntity)
    private readonly nbsRepository: Repository<NbsEntity>,
  ) {}

  async sincronizarNbs(): Promise<void> {
    this.logger.log('Iniciando a sincronização dos dados NBS...');

    try {
      const response = await fetch(this.urlNbs);
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.statusText}`);
      }

      // Baixa os bytes crus e decodifica usando ISO-8859-1 (Latin-1) para preservar os acentos
      const buffer = await response.arrayBuffer();
      const decoder = new TextDecoder('iso-8859-1');
      const texto = decoder.decode(buffer);

      const linhas = texto.split(/\r?\n/);

      const registrosParaSalvar: { codigoNbs: string; descricao: string }[] = [];

      // Começa do 1 para ignorar o cabeçalho (NBS 2.0;DESCRIÇÃO)
      for (let i = 1; i < linhas.length; i++) {
        const linha = linhas[i].trim();
        if (!linha) continue;

        // Divide pelo ponto e vírgula
        const partes = linha.split(';');
        if (partes.length >= 2) {
          const codigoNbs = partes[0].trim();
          const descricao = partes.slice(1).join(';').trim(); // Junta o resto caso a descrição contenha ';'

          if (codigoNbs && descricao) {
            registrosParaSalvar.push({ codigoNbs, descricao });
          }
        }
      }

      if (registrosParaSalvar.length === 0) {
        this.logger.warn('Nenhum registro encontrado para sincronizar.');
        return;
      }

      // Upsert em lotes para evitar estourar o limite de parâmetros do banco
      const tamanhoLote = 500;
      for (let i = 0; i < registrosParaSalvar.length; i += tamanhoLote) {
        const lote = registrosParaSalvar.slice(i, i + tamanhoLote);

        await this.nbsRepository.upsert(lote, {
          conflictPaths: ['codigoNbs'], // Coluna(s) que define(m) a unicidade
          skipUpdateIfNoValuesChanged: true, // Pula o update se os dados forem iguais
        });
      }

      this.logger.log(`Sincronização concluída com sucesso! ${registrosParaSalvar.length} registros processados.`);
    } catch (error) {
      this.logger.error('Falha ao sincronizar os dados NBS', error);
    }
  }
}