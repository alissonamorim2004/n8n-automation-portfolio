import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalysisType } from '../entities/analysis-type.entity';

@Injectable()
export class AnalysisTypesService {
  constructor(
    @InjectRepository(AnalysisType)
    private analysisTypeRepository: Repository<AnalysisType>,
  ) {}

  async findAll(onlyActive?: boolean) {
    const where = onlyActive ? { isActive: true } : {};
    return this.analysisTypeRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const analysisType = await this.analysisTypeRepository.findOne({
      where: { id },
    });

    if (!analysisType) {
      throw new NotFoundException('Tipo de análise não encontrado');
    }

    return analysisType;
  }

  async create(data: {
    name: string;
    description: string;
    aiModel: string;
    template: string;
    createdBy: string;
    isActive?: boolean;
  }) {
    const analysisType = this.analysisTypeRepository.create(data);
    return this.analysisTypeRepository.save(analysisType);
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
    aiModel?: string;
    template?: string;
    isActive?: boolean;
  }) {
    const analysisType = await this.findOne(id);
    Object.assign(analysisType, data);
    return this.analysisTypeRepository.save(analysisType);
  }

  async remove(id: string) {
    const analysisType = await this.findOne(id);
    await this.analysisTypeRepository.remove(analysisType);
    return { message: 'Tipo de análise removido com sucesso' };
  }
}
