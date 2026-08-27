import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisTypesService } from './analysis-types.service';
import { AnalysisTypesController } from './analysis-types.controller';
import { AnalysisType } from '../entities/analysis-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AnalysisType])],
  controllers: [AnalysisTypesController],
  providers: [AnalysisTypesService],
  exports: [AnalysisTypesService],
})
export class AnalysisTypesModule {}
