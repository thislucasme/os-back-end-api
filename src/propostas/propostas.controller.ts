// src/propostas/propostas.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PropostasService } from './propostas.service';
import { CreatePropostaDto } from 'src/ordens-servico/dto/create-proposta.dto';
import { UpdatePropostaDto } from 'src/ordens-servico/dto/update-proposta.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
@Controller('propostas')
export class PropostasController {
  constructor(private readonly service: PropostasService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    console.log(req.user)
    return this.service.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Get(':id/pdf')
  @Header('Content-Type', 'text/html')
  pdf(@Param('id') id: string) {
    return this.service.pdf(Number(id));
  }

  @Post()
  create(@Body() dto: CreatePropostaDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePropostaDto) {
    return this.service.update(Number(id), dto);
  }

  @Patch(':id/aprovar')
  aprovar(@Param('id') id: string) {
    return this.service.aprovar(Number(id));
  }

  @Patch(':id/recusar')
  recusar(@Param('id') id: string) {
    return this.service.recusar(Number(id));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}