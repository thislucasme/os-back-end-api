// src/modules/ordens-servico/dto/item-os-response.dto.ts
import { Expose, Type } from 'class-transformer';

export class ProdutoServicoResponseDto {
  @Expose()
  id!: number;

  @Expose()
  nome!: string;

  @Expose()
  tipo!: string;
}

export class FuncionarioResponseDto {
  @Expose()
  id!: number;

  @Expose()
  name!: string;
}

export class ItemOsResponseDto {
  @Expose()
  id!: number;

  @Expose()
  ordemServicoId!: number;

  @Expose()
  produtoServicoId!: number;

  @Expose()
  @Type(() => ProdutoServicoResponseDto)
  produtoServico!: ProdutoServicoResponseDto;

  @Expose()
  tipo!: string;

  @Expose()
  nome!: string;

  @Expose()
  valor!: number;

  @Expose()
  responsavelId!: number | null;

  @Expose()
  @Type(() => FuncionarioResponseDto)
  responsavel!: FuncionarioResponseDto | null;

  @Expose()
  comissao!: number;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}