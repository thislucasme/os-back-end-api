import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UploadCertificadoDto {
  @ApiProperty({ description: 'Arquivo PFX/P12 em base64.', format: 'byte' })
  @IsString()
  @MinLength(10)
  pfxBase64!: string;

  @ApiProperty({ description: 'Senha do certificado A1.' })
  @IsString()
  password!: string;
}
