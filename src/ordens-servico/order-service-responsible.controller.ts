import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { OrderServiceResponsibleService } from './order-service-responsible.service';
import { CreateOrderServiceResponsibleDto } from './dto/responsible/create-order-service-responsible.dto';
import { ListOrderServiceResponsibleDto } from './dto/responsible/list-order-service-responsible.dto';
import { UpdateOrderServiceResponsibleDto } from './dto/responsible/update-order-service-responsible.dto';

@Controller('order-services/:orderServiceId/responsibles')
export class OrderServiceResponsibleController {
  constructor(private readonly responsibleService: OrderServiceResponsibleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('orderServiceId', ParseIntPipe) orderServiceId: number,
    @Body() dto: CreateOrderServiceResponsibleDto,
  ) {
    console.log("hehehheheh")
    return this.responsibleService.create(orderServiceId, dto);
  }

  @Get()
  findAll(
    @Param('orderServiceId', ParseIntPipe) orderServiceId: number,
    @Query() query: ListOrderServiceResponsibleDto,
  ) {
    return this.responsibleService.findAll(orderServiceId, query);
  }

  @Get(':id')
  findOne(
    @Param('orderServiceId', ParseIntPipe) orderServiceId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.responsibleService.findOne(orderServiceId, id);
  }

  @Patch(':id')
  update(
    @Param('orderServiceId', ParseIntPipe) orderServiceId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderServiceResponsibleDto,
  ) {
    return this.responsibleService.update(orderServiceId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('orderServiceId', ParseIntPipe) orderServiceId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.responsibleService.remove(orderServiceId, id);
  }
}