import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { bigintTransformer } from '../../shared/utils/bigint.transformer';

@Entity('squads')
@Index(['name'])
export class Squad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  bannerUrl: string;

  @Column()
  ownerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ default: 1 })
  level: number;

  @Column({
    type: 'bigint',
    default: 0,
    transformer: bigintTransformer,
  })
  totalFollowers: bigint;

  @Column({ default: 0 })
  memberCount: number;

  @Column({ default: 50 })
  maxMembers: number;

  @Column({ default: true })
  isOpen: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('squad_members')
@Index(['squadId', 'userId'], { unique: true })
export class SquadMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  squadId: string;

  @ManyToOne(() => Squad)
  @JoinColumn({ name: 'squadId' })
  squad: Squad;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: ['owner', 'admin', 'member'],
    default: 'member',
  })
  role: 'owner' | 'admin' | 'member';

  @Column({
    type: 'bigint',
    default: 0,
    transformer: bigintTransformer,
  })
  contributedFollowers: bigint;

  @CreateDateColumn()
  joinedAt: Date;
}
