import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Document } from './document.entity';
import { TokenUsage } from './token-usage.entity';

@Entity('analysis_types')
export class AnalysisType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ name: 'ai_model' })
  aiModel: string;

  @Column({ type: 'text' })
  template: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Document, document => document.analysisType)
  documents: Document[];

  @OneToMany(() => TokenUsage, tokenUsage => tokenUsage.analysisType)
  tokenUsages: TokenUsage[];
}
