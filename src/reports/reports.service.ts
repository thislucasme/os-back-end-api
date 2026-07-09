import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as htmlPdf from 'html-pdf-node';
import { Proposta } from 'src/ordens-servico/entities/proposta.entity';
import { propostaPdfTemplate } from './templates/proposta-pdf.template';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Proposta)
    private readonly propostaRepo: Repository<Proposta>,
  ) {}

  async generatePropostaHtml(id: number): Promise<string> {
    const proposta = await this.propostaRepo.findOne({
      where: { id },
      relations: {
        company: true,
        cliente: true,
        itens: true,
        ordemServico: {
          anexos: true,
          itens: true,
        },
      },
    });

    if (!proposta) {
      throw new NotFoundException('Proposta não encontrada');
    }

    return propostaPdfTemplate(proposta);
  }

  async generatePropostaPdf(id: number): Promise<Buffer> {
    const html = await this.generatePropostaHtml(id);

    const file = {
      content: html,
    };

    const options = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };

    const pdfBuffer = await htmlPdf.generatePdf(file, options);

    console.log('PDF SIZE:', pdfBuffer.length);

    return Buffer.from(pdfBuffer);
  }
}