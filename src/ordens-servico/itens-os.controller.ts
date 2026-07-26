// src/modules/ordens-servico/controllers/itens-os.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ItensOsService } from './itens-os.service';
import { CreateItemOsDto } from './dto/itens-os/create-item-os.dto';
import { ItemOs } from './entities/item-os.entity';
import { UpdateItemOsDto } from './dto/itens-os/update-item-os.dto';

@Controller('ordens-servico/:ordemServicoId/itens')
export class ItensOsController {
  constructor(private readonly itensOsService: ItensOsService) {}

  @Post()
  async create(
    @Param('ordemServicoId', ParseIntPipe) ordemServicoId: number,
    @Body() createDto: CreateItemOsDto,
  ): Promise<ItemOs> {
    // Garante que o DTO tenha o ID da OS
    createDto.ordemServicoId = ordemServicoId;
    return this.itensOsService.create(createDto);
  }

  @Get()
  async findAll(@Param('ordemServicoId', ParseIntPipe) ordemServicoId: number): Promise<ItemOs[]> {
    return this.itensOsService.findAllByOrdem(ordemServicoId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ItemOs> {
    return this.itensOsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateItemOsDto,
  ): Promise<ItemOs> {
    return this.itensOsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.itensOsService.remove(id);
  }
}