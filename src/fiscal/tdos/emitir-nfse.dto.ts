// emitir-nfse.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class EmitirNfseDto {
    @ApiProperty({
        example: 3000,
        description: 'Valor do serviço',
    })
    @IsNumber()
    @Min(0.01)
    valorServico!: number;

    @ApiProperty({
        example: 'b61466f5-a0e8-426f-a04c-0659b611ce4d',
        description: 'ID do serviço fiscal',
    })
    @IsString()
    @IsUUID()
    serviceId!: string;

    @ApiProperty({
        example: 4,
        description: 'ID do cliente/tomador',
    })
    @IsInt()
    clienteFornecedorId!: number;
}