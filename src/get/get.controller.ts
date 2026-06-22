import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiBearerAuth()
@Controller()
export class GetController {

  @UseGuards(JwtAuthGuard)
  @Get()
  getHello(@Request() req) {
   return { 
      id: req.user.id, 
      email: req.user.email 
    };
  }
}
