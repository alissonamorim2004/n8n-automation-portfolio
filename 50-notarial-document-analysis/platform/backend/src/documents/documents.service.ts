import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private configService: ConfigService,
  ) {
    const uploadDir = this.configService.get<string>('UPLOAD_DIR') || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  async findAll(userId?: string) {
    const where = userId ? { userId } : {};
    return this.documentRepository.find({
      where,
      relations: ['analysisType', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['analysisType', 'user'],
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    return document;
  }

  async create(data: {
    userId: string;
    analysisTypeId: string;
    fileName: string;
    fileUrl: string;
  }) {
    const document = this.documentRepository.create({
      ...data,
      status: 'processing',
    });

    return this.documentRepository.save(document);
  }

  async update(id: string, data: {
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    result?: any;
    errorMessage?: string;
    completedAt?: Date;
  }) {
    const document = await this.findOne(id);
    Object.assign(document, data);
    return this.documentRepository.save(document);
  }

  async sendToN8n(documentId: string, analysisType: any) {
    const document = await this.findOne(documentId);

    try {
      const response = await fetch('${N8N_WEBHOOK_URL}', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: document.id,
          file_url: document.fileUrl,
          file_name: document.fileName,
          ai_model: analysisType.aiModel,
          template: analysisType.template,
        }),
      });

      const result = await response.json();

      await this.update(documentId, {
        status: 'completed',
        result: result.output || result,
        completedAt: new Date(),
      });

      return result;
    } catch (error) {
      await this.update(documentId, {
        status: 'failed',
        errorMessage: error.message,
      });
      throw error;
    }
  }

  async sendToN8nChat(documentId: string, analysisType: any, extraData: any) {
    const document = await this.findOne(documentId);

    try {
      const response = await fetch('${N8N_WEBHOOK_CHAT_URL}', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: document.id,
          analysis_type_id: analysisType.id,
          file_url: document.fileUrl,
          file_name: document.fileName,
          ai_model: analysisType.aiModel,
          template: analysisType.template,
          ...extraData,
        }),
      });

      const result = await response.json();

      await this.update(documentId, {
        status: 'completed',
        result: result.output || result,
        completedAt: new Date(),
      });

      return result;
    } catch (error) {
      await this.update(documentId, {
        status: 'failed',
        errorMessage: error.message,
      });
      throw error;
    }
  }

  getFileUrl(filename: string): string {
    return `${this.configService.get<string>('BACKEND_URL') || 'http://localhost:3001'}/uploads/${filename}`;
  }
}
