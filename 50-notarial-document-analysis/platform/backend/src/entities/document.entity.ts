import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { AnalysisType } from './analysis-type.entity';
import { TokenUsage } from './token-usage.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, user => user.documents)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'analysis_type_id' })
  analysisTypeId: string;

  @ManyToOne(() => AnalysisType, analysisType => analysisType.documents)
  @JoinColumn({ name: 'analysis_type_id' })
  analysisType: AnalysisType;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({ type: 'enum', enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' })
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @Column({ type: 'jsonb', nullable: true })
  result: any;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @OneToMany(() => TokenUsage, tokenUsage => tokenUsage.document)
  tokenUsages: TokenUsage[];
}
