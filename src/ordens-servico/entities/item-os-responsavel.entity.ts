import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ItemOs } from './item-os.entity';
import { User } from 'src/users/user.entity';

@Entity('itens_os_responsaveis')
@Unique(['itemId', 'userId']) // evita duplicidade
export class ItemOsResponsavel {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ItemOs, (item) => item.responsaveis, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: ItemOs;

  @Column({ name: 'item_id' })
  itemId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  comissao!: number; // percentual individual
}