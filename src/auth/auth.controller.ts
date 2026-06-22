import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Auth } from './jwt.decorator';

class RegisterDto {
  email!: string;
  password!: string;
  name?: string;
}

class LoginDto {
  email!: string;
  password!: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiBody({
    schema: {
      example: {
        email: 'lucas@email.com',
        password: '123456',
        name: 'Lucas',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    schema: {
      example: {
        id: 1,
        email: 'lucas@email.com',
        name: 'Lucas',
      },
    },
  })
  async register(@Body() body: RegisterDto) {
    const user = await this.authService.register(
      body.email,
      body.password,
      body.name,
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiBody({
    schema: {
      example: {
        email: 'lucas@email.com',
        password: '123456',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'lucas@email.com',
          name: 'Lucas',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
  })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Get('me')
  @Auth()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário autenticado',
    schema: {
      example: {
        id: 1,
        email: 'lucas@email.com',
        name: 'Lucas',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou ausente',
  })
  async getMe(@Request() req) {
    return {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
    };
  }
}