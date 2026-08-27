import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocumentsService } from './documents.service';
import { AnalysisTypesService } from '../analysis-types/analysis-types.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private documentsService: DocumentsService,
    private analysisTypesService: AnalysisTypesService,
  ) {}

  @Get()
  findAll(@Request() req) {
    if (req.user.role === 'admin') {
      return this.documentsService.findAll();
    }
    return this.documentsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(pdf|doc|docx|txt|jpg|jpeg|png)$/)) {
          return callback(new BadRequestException('Tipo de arquivo não permitido'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('analysisTypeId') analysisTypeId: string,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado');
    }

    if (!analysisTypeId) {
      throw new BadRequestException('Tipo de análise não informado');
    }

    const analysisType = await this.analysisTypesService.findOne(analysisTypeId);

    const fileUrl = this.documentsService.getFileUrl(file.filename);

    const document = await this.documentsService.create({
      userId: req.user.id,
      analysisTypeId,
      fileName: file.originalname,
      fileUrl,
    });

    await this.documentsService.sendToN8n(document.id, analysisType);

    return document;
  }

  @Post('create-chat')
  async createForChat(
    @Body() body: { fileName: string; fileUrl: string; analysisTypeId: string },
    @Request() req,
  ) {
    if (!body.analysisTypeId) {
      throw new BadRequestException('Tipo de análise não informado');
    }

    const analysisType = await this.analysisTypesService.findOne(body.analysisTypeId);

    const document = await this.documentsService.create({
      userId: req.user.id,
      analysisTypeId: body.analysisTypeId,
      fileName: body.fileName,
      fileUrl: body.fileUrl,
    });

    return document;
  }

  @Post(':id/send-n8n')
  async sendToN8n(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const document = await this.documentsService.findOne(id);
    const analysisType = await this.analysisTypesService.findOne(document.analysisTypeId);

    return this.documentsService.sendToN8nChat(id, analysisType, body);
  }
}
