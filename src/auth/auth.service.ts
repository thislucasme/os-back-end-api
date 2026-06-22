import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name?: string) {
    return this.usersService.create(email, password, name);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email ou senha invalidos');
    }

    const token = this.jwtService.sign({ id: user.id, email: user.email });

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
}
