import { ClientesFornecedoresModule } from './clientes-fornecedores/clientes-fornecedores.module';
import { CompaniesModule } from './companies/companies.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GetModule } from './get/get.module';
import { Company } from './companies/ company.entity';

@Module({
  imports: [
    ClientesFornecedoresModule,
    CompaniesModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST || 'localhost',
      port: Number(process.env.MYSQL_PORT) || 3306,
      username: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root',
      database: process.env.MYSQL_DATABASE || 'auth_api',
      autoLoadEntities: true,
      synchronize: true,
    }),

    TypeOrmModule.forFeature([User, Company]),

    UsersModule,
    AuthModule,
    GetModule,
  ],
})
export class AppModule { }