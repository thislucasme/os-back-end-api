import { Body, Controller, Request, Post, Get, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UploadCertificadoDto } from './tdo/upload-certificado.dto';
import { CertificadoService } from './certificado.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("certificado")
export class CertificadoController {
  constructor(private readonly certificadoService: CertificadoService) { }

  @Post()
  @ApiOperation({ summary: 'Cadastrar/atualizar certificado A1 PFX' })
  uploadCreateOrUpdate(@Request() req, @Body() dto: UploadCertificadoDto) {
    return this.certificadoService.uploadCertificado(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar certificado da empresa com dados descriptografados' })
  get(@Request() req) {
    return this.certificadoService.getCertificado(req.user.id);
  }

  @Delete()
  @ApiOperation({ summary: 'Remover certificado A1 PFX da empresa' })
  remove(@Request() req) {
    return this.certificadoService.removeCertificado(req.user.id);
  }
}