import { Controller, Get, Query } from '@nestjs/common';
import { TributosService } from './tributos.service';

@Controller('tributos')
export class TributosController {
  constructor(private readonly tributosService: TributosService) {}

  // Exemplo de uso: GET /tributos/nbs?termo=10101 ou /tributos/nbs?termo=construcao
  @Get('nbs')
  async pesquisarNbs(@Query('termo') termo: string) {
    return this.tributosService.buscarNbs(termo);
  }

  // Exemplo de uso: GET /tributos/servicos-nacionais?termo=10101 ou /tributos/servicos-nacionais?termo=desenvolvimento
  @Get('servicos-nacionais')
  async pesquisarServicoNacional(@Query('termo') termo: string) {
    return this.tributosService.buscarServicoNacional(termo);
  }
}