import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectDataSource() private dataSource: DataSource) { }

  async create(email: string, password: string, name?: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await queryRunner.manager.findOne(User, { where: { email } });

      if (existingUser) {
        throw new ConflictException('Email já existe');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = queryRunner.manager.create(User, {
        email,
        password: hashedPassword,
        name,
      });

      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();

      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findByEmail(email: string) {
    return this.dataSource.manager.findOne(User, { where: { email } });
  }

  async findById(id: number) {
    const user = await this.dataSource.manager.findOne(User, { where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario não encontrado');
    }
    return user;
  }

  public async getCompanyIdFromRequestUser(userId: string): Promise<number> {

    if (!userId) {
      throw new ForbiddenException('Usuário inválido no token.');
    }

    const user = await this.dataSource.manager.findOne(User, {
      where: { id: Number(userId) },
      select: { companyId: true },
    });

    if (!user?.companyId) {
      throw new ForbiddenException('Usuário sem empresa vinculada.');
    }

    return user.companyId;
  }
}
