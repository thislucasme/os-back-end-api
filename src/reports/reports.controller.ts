import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('propostas/:id/html')
  @ApiOperation({ summary: 'Gerar HTML da proposta pelo ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiProduces('text/html')
  @ApiOkResponse({ description: 'HTML da proposta gerado com sucesso.' })
  async propostaHtml(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const html = await this.reportsService.generatePropostaHtml(id);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  }

  @Get('propostas/:id/pdf')
  @ApiOperation({ summary: 'Visualizar PDF da proposta pelo ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiProduces('application/pdf')
  @ApiOkResponse({
    description: 'PDF da proposta gerado com sucesso.',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async propostaPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const pdf = await this.reportsService.generatePropostaPdf(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="proposta-${id}.pdf"`,
    );
    res.setHeader('Content-Length', pdf.length);

    return res.end(pdf);
  }

  @Get('propostas/:id/download')
  @ApiOperation({ summary: 'Baixar PDF da proposta pelo ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiProduces('application/pdf')
  @ApiOkResponse({
    description: 'Download do PDF da proposta gerado com sucesso.',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async propostaDownload(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const pdf = await this.reportsService.generatePropostaPdf(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="proposta-${id}.pdf"`,
    );
    res.setHeader('Content-Length', pdf.length);

    return res.end(pdf);
  }
}