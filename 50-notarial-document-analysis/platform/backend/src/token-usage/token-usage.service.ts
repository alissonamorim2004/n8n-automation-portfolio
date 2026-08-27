import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { TokenUsage } from '../entities/token-usage.entity';

@Injectable()
export class TokenUsageService {
  constructor(
    @InjectRepository(TokenUsage)
    private tokenUsageRepository: Repository<TokenUsage>,
  ) {}

  async getStats(dateRange?: '7d' | '30d' | '90d' | 'all') {
    let dateFilter: Date | undefined;

    if (dateRange && dateRange !== 'all') {
      const days = parseInt(dateRange);
      dateFilter = new Date();
      dateFilter.setDate(dateFilter.getDate() - days);
    }

    const query = this.tokenUsageRepository
      .createQueryBuilder('tu')
      .leftJoinAndSelect('tu.user', 'user')
      .leftJoinAndSelect('tu.analysisType', 'analysisType')
      .orderBy('tu.createdAt', 'DESC');

    if (dateFilter) {
      query.where('tu.createdAt >= :date', { date: dateFilter });
    }

    const data = await query.getMany();

    const totalTokens = data.reduce((sum, item) => sum + item.tokensUsed, 0);
    const totalCost = data.reduce((sum, item) => sum + Number(item.cost), 0);

    const userMap = new Map();
    data.forEach((item) => {
      const userId = item.userId;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user_id: userId,
          full_name: item.user?.fullName || 'Unknown',
          email: item.user?.email || '',
          tokens_used: 0,
          cost: 0,
          document_count: 0,
        });
      }
      const user = userMap.get(userId);
      user.tokens_used += item.tokensUsed;
      user.cost += Number(item.cost);
      user.document_count += 1;
    });

    const typeMap = new Map();
    data.forEach((item) => {
      const typeId = item.analysisTypeId;
      if (!typeMap.has(typeId)) {
        typeMap.set(typeId, {
          analysis_type_id: typeId,
          name: item.analysisType?.name || 'Unknown',
          tokens_used: 0,
          cost: 0,
          usage_count: 0,
        });
      }
      const type = typeMap.get(typeId);
      type.tokens_used += item.tokensUsed;
      type.cost += Number(item.cost);
      type.usage_count += 1;
    });

    return {
      totalTokens,
      totalCost,
      totalDocuments: data.length,
      totalUsers: userMap.size,
      byUser: Array.from(userMap.values()).sort((a, b) => b.tokens_used - a.tokens_used),
      byAnalysisType: Array.from(typeMap.values()).sort((a, b) => b.tokens_used - a.tokens_used),
      recentUsage: data.slice(0, 20),
    };
  }

  async create(data: {
    documentId?: string;
    analysisTypeId: string;
    userId: string;
    tokensUsed: number;
    cost: number;
  }) {
    const tokenUsage = this.tokenUsageRepository.create(data);
    return this.tokenUsageRepository.save(tokenUsage);
  }
}
