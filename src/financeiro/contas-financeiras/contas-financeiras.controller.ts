import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { ContasFinanceirasService } from './contas-financeiras.service';
import { CreateContaFinanceiraDto } from './dto/create-conta-financeira.dto';
import { UpdateContaFinanceiraDto } from './dto/update-conta-financeira.dto';
import { FindContaFinanceiraDto } from './dto/find-conta-financeira.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Contas Financeiras')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contas-financeiras')
export class ContasFinanceirasController {
  constructor(
    private readonly service: ContasFinanceirasService,
  ) {}

  @Post()
  create(
    @Req() req,
    @Body() dto: CreateContaFinanceiraDto,
  ) {
    return this.service.create(
      req.user,
      dto,
    );
  }

@Get()
findAll(
  @Req() req,
  @Query() query: FindContaFinanceiraDto,
) {
    console.log(req.user)
  return this.service.findAll(
    req.user,
    query,
  );
}

  @Get(':id')
  findOne(
    @Req() req,
    @Param('id') id: number,
  ) {
    return this.service.findOne(
      req.user,
      Number(id),
    );
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: number,
    @Body() dto: UpdateContaFinanceiraDto,
  ) {
    return this.service.update(
      req.user,
      Number(id),
      dto,
    );
  }

  @Delete(':id')
  remove(
    @Req() req,
    @Param('id') id: number,
  ) {
    return this.service.remove(
      req.user,
      Number(id),
    );
  }
}