import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('servicos_nacionais')
@Index('UQ_servico_nacional', ['item', 'subitem', 'desdobroNacional'], { unique: true })
export class ServicoNacionalEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Defina explicitamente o type: 'varchar' para o MySQL não se confundir
  @Column({ name: 'codigo_tributacao_nacional', type: 'varchar', length: 50, nullable: true })
  codigoTributacaoNacional!: string | null;

  @Column({ type: 'int' })
  item!: number;

  @Column({ type: 'int' })
  subitem!: number;

  @Column({ name: 'desdobro_nacional', type: 'int' })
  desdobroNacional!: number;

  @Column({ type: 'text' })
  descricao!: string;
}