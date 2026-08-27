import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AnalysisTypesModule } from './analysis-types/analysis-types.module';
import { DocumentsModule } from './documents/documents.module';
import { TokenUsageModule } from './token-usage/token-usage.module';
import { User } from './entities/user.entity';
import { AnalysisType } from './entities/analysis-type.entity';
import { Document } from './entities/document.entity';
import { TokenUsage } from './entities/token-usage.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, AnalysisType, Document, TokenUsage],
        synchronize: false,
        logging: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    UsersModule,
    AnalysisTypesModule,
    DocumentsModule,
    TokenUsageModule,
  ],
})
export class AppModule {}
