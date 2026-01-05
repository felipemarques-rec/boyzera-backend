import {
  Entity,
  Column,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('app_config')
export class AppConfig {
  @PrimaryColumn()
  key: string;

  @Column({ type: 'jsonb', nullable: true })
  value: any;

  @Column({ nullable: true })
  description: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
