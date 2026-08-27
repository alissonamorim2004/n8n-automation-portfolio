import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { Document } from '../entities/document.entity';
import { AnalysisTypesModule } from '../analysis-types/analysis-types.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    AnalysisTypesModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
