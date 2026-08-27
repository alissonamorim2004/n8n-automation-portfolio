import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AnalysisTypesService } from './analysis-types.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('analysis-types')
@UseGuards(JwtAuthGuard)
export class AnalysisTypesController {
  constructor(private analysisTypesService: AnalysisTypesService) {}

  @Get()
  findAll(@Query('onlyActive') onlyActive?: string) {
    return this.analysisTypesService.findAll(onlyActive === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.analysisTypesService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(
    @Body() data: {
      name: string;
      description: string;
      aiModel: string;
      template: string;
      isActive?: boolean;
    },
    @Request() req,
  ) {
    return this.analysisTypesService.create({
      ...data,
      createdBy: req.user.id,
    });
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() data: {
      name?: string;
      description?: string;
      aiModel?: string;
      template?: string;
      isActive?: boolean;
    },
  ) {
    return this.analysisTypesService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.analysisTypesService.remove(id);
  }
}
