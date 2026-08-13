import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateWebhookConfigDto {
  @ApiProperty({
    description: 'ID da empresa no seu banco de dados',
    example: 'uuid-da-empresa-123',
  })
  @IsNotEmpty()
  @IsString()
  companyId!: string;

  @ApiProperty({
    description: 'Lista de eventos que deseja receber do Asaas',
    example: ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED', 'PAYMENT_OVERDUE'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  enabledEvents?: string[];
}