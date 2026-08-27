import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { AnalysisType } from './analysis-type.entity';
import { Document } from './document.entity';

@Entity('token_usage')
export class TokenUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'document_id', nullable: true })
  documentId: string;

  @ManyToOne(() => Document, document => document.tokenUsages, { nullable: true })
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @Column({ name: 'analysis_type_id' })
  analysisTypeId: string;

  @ManyToOne(() => AnalysisType, analysisType => analysisType.tokenUsages)
  @JoinColumn({ name: 'analysis_type_id' })
  analysisType: AnalysisType;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, user => user.tokenUsages)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'tokens_used', type: 'int', default: 0 })
  tokensUsed: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  cost: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
