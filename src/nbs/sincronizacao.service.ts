import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import * as path from 'path';
import { NbsEntity } from './entities/nbs.entity';
import { ServicoNacionalEntity } from './entities/servico-nacional.entity';

@Injectable()
export class SincronizacaoService {
  private readonly logger = new Logger(SincronizacaoService.name);
  private readonly urlNbs = process.env.NBS_CSV_URL || 'https://www.gov.br/mdic/pt-br/images/REPOSITORIO/scs/decos/NBS/NBSa_2-0.csv';

  constructor(
    @InjectRepository(NbsEntity)
    private readonly nbsRepo: Repository<NbsEntity>,
    @InjectRepository(ServicoNacionalEntity)
    private readonly servicoNacionalRepo: Repository<ServicoNacionalEntity>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Iniciando rotina de sincronização de dados...');
    await this.sincronizarNbsViaUrl();
    await this.sincronizarListaNacionalViaExcel();
    this.logger.log('Sincronização finalizada.');
  }

  // 1. Sincronização via URL (Mantém NBS sempre atualizado)
  private async sincronizarNbsViaUrl(): Promise<void> {
    try {
      const response = await fetch(this.urlNbs);
      if (!response.ok) throw new Error(`Status: ${response.status}`);

      const buffer = await response.arrayBuffer();
      const decoder = new TextDecoder('iso-8859-1');
      const texto = decoder.decode(buffer);
      const linhas = texto.split(/\r?\n/);

      const registros = linhas.slice(1)
        .map(l => l.trim())
        .filter(l => l)
        .map(l => {
          const [codigoNbs, ...desc] = l.split(';');
          return { codigoNbs: codigoNbs.trim(), descricao: desc.join(';').trim() };
        });

      await this.nbsRepo.upsert(registros, { conflictPaths: ['codigoNbs'], skipUpdateIfNoValuesChanged: true });
      this.logger.log(`NBS atualizado via URL: ${registros.length} registros.`);
    } catch (e) {
      this.logger.error('Erro na sincronização NBS via URL:', e);
    }
  }

  // 2. Sincronização via Excel (Lista Nacional de Serviços)
  private async sincronizarListaNacionalViaExcel(): Promise<void> {
    try {
      const filePath = path.resolve(process.cwd(), 'anexob-listasservnac_nbs-snnfse_v1-01-00-homologacao.xlsx');
      const workbook = XLSX.readFile(filePath);
      
      // Processa a aba de Serviços Nacionais
      const sheet = workbook.Sheets['LISTA.SERV.NAC.'];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);
      
      const registros = rows.map(row => ({
        codigoTributacaoNacional: row['CÓDIGOS DE TRIBUTAÇÃO NACIONAL'] ? String(row['CÓDIGOS DE TRIBUTAÇÃO NACIONAL']).trim() : null,
        item: Number(row['ITEM']),
        subitem: Number(row['SUBITEM']),
        desdobroNacional: Number(row['DESDOBRO NACIONAL']),
        descricao: String(row['DESCRIÇÃO']).trim(),
      }));

      await this.servicoNacionalRepo.upsert(registros, {
        conflictPaths: ['item', 'subitem', 'desdobroNacional'],
        skipUpdateIfNoValuesChanged: true,
      });
      this.logger.log(`Lista Nacional atualizada via Excel: ${registros.length} registros.`);
    } catch (e) {
      this.logger.error('Erro ao processar Excel de Lista Nacional:', e);
    }
  }
}