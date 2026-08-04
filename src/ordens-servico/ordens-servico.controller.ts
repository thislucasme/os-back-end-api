import {
    Body,
    Controller,
    Delete,
    Get,
    Header,
    Param,
    Patch,
    Post,
    Request,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import { CreateOrdemServicoDto } from './dto/create-ordem-servico.dto';
import { GerarPropostaDto } from './dto/gerar-proposta.dto';
import { UpdateOrdemServicoDto } from './dto/update-ordem-servico.dto';
import { UpdateStatusOrdemServicoDto } from './dto/update-status-ordem-servico.dto';
import { OrdensServicoService } from './ordens-servico.service';
import { ConcluirOrdemServicoDto } from './dto/concluir-os/concluir-ordem-servico.dto';

@UseGuards(JwtAuthGuard)
@Controller('ordens-servico')
export class OrdensServicoController {
    constructor(
        private readonly service: OrdensServicoService,
    ) { }

    @Get()
    findAll(@Request() req) {
        return this.service.findAll(req.user.id);
    }

    @Get(':id')
    findOne(
        @Param('id') id: string,
        @Request() req,
    ) {
        return this.service.findOne(
            Number(id),
            req.user.id,
        );
    }

    @Get(':id/pdf')
    @Header('Content-Type', 'text/html')
    pdf(
        @Param('id') id: string,
        @Request() req,
    ) {
        return this.service.pdf(
            Number(id),
            req.user.id,
        );
    }

    @Post()
    create(
        @Body() dto: CreateOrdemServicoDto,
        @Request() req,
    ) {
        return this.service.create(
            dto,
            req.user.id,
        );
    }

    @Post(':id/gerar-proposta')
    gerarProposta(
        @Param('id') id: string,
        @Body() dto: GerarPropostaDto,
        @Request() req,
    ) {
        return this.service.gerarProposta(
            Number(id),
            dto,
            req.user.id,
        );
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateOrdemServicoDto,
        @Request() req,
    ) {
        return this.service.update(
            Number(id),
            dto,
            req.user.id,
        );
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateStatusOrdemServicoDto,
        @Request() req,
    ) {
        return this.service.updateStatus(
            Number(id),
            dto.status,
            req.user.id,
        );
    }

    @Post(':id/anexos')
    @UseInterceptors(
        FilesInterceptor('files'),
    )
    addAnexos(
        @Param('id') id: string,
        @UploadedFiles()
        files: Express.Multer.File[],
        @Request() req,
    ) {
        return this.service.addAnexos(
            Number(id),
            files,
            req.user.id,
        );
    }

    @Delete('anexos/:anexoId')
    removeAnexo(
        @Param('anexoId') anexoId: string,
        @Request() req,
    ) {
        return this.service.removeAnexo(
            Number(anexoId),
            req.user.id,
        );
    }

    @Delete(':id')
    remove(
        @Param('id') id: string,
        @Request() req,
    ) {
        return this.service.remove(
            Number(id),
            req.user.id,
        );
    }

    @Post(':id/concluir')
    concluir(
        @Param('id') id: string,
        @Body() dto: ConcluirOrdemServicoDto,
        @Request() req,
    ) {
        return this.service.concluir(
            Number(id),
            dto,
            req.user.id,
        );

    }
}