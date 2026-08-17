import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
  ) {}

  @Post('upload/:empresaId/:tipo/:ano/:mes/:documentoId/:arquivo')
  @ApiOperation({
    summary: 'Fazer upload de um arquivo',
  })
  @ApiParam({
    name: 'empresaId',
    description: 'ID da empresa',
    example: '123',
  })
  @ApiParam({
    name: 'tipo',
    description: 'Tipo do documento',
    example: 'nfse',
  })
  @ApiParam({
    name: 'ano',
    description: 'Ano do documento',
    example: '2026',
  })
  @ApiParam({
    name: 'mes',
    description: 'Mês do documento',
    example: '08',
  })
  @ApiParam({
    name: 'documentoId',
    description: 'ID interno do documento',
    example: '5501',
  })
  @ApiParam({
    name: 'arquivo',
    description: 'Nome do arquivo',
    example: 'nfse.pdf',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Arquivo enviado com sucesso',
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('empresaId') empresaId: string,
    @Param('tipo') tipo: string,
    @Param('ano') ano: string,
    @Param('mes') mes: string,
    @Param('documentoId') documentoId: string,
    @Param('arquivo') arquivo: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const key =
      `empresas/${empresaId}` +
      `/documentos/${tipo}` +
      `/${ano}/${mes}` +
      `/${documentoId}` +
      `/${arquivo}`;

    await this.storageService.upload(
      key,
      file.buffer,
      file.mimetype,
    );

    return {
      success: true,
      key,
    };
  }

  @Post('url')
  @ApiOperation({
    summary: 'Gerar URL temporária para um arquivo',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          example:
            'empresas/123/documentos/nfse/2026/08/5501/nfse.pdf',
        },
        expiresIn: {
          type: 'number',
          example: 300,
          description: 'Tempo de validade em segundos',
        },
      },
      required: ['key'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'URL temporária gerada',
  })
  async getUrl(
    @Body('key') key: string,
    @Body('expiresIn') expiresIn?: number,
  ) {
    const expiration = expiresIn ?? 300;

    const url = await this.storageService.getUrl(
      key,
      expiration,
    );

    return {
      url,
      expiresIn: expiration,
    };
  }

  @Delete(':empresaId/*key')
  @ApiOperation({
    summary: 'Excluir um arquivo',
  })
  @ApiParam({
    name: 'empresaId',
    description: 'ID da empresa',
    example: '123',
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo excluído com sucesso',
  })
  async delete(
    @Param('empresaId') empresaId: string,
    @Param('key') key: string,
  ) {
    const objectKey = `empresas/${empresaId}/${key}`;

    await this.storageService.delete(objectKey);

    return {
      success: true,
    };
  }
}