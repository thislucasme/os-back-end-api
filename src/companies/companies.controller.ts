import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateCompanyDto) {
    return this.companiesService.create(req.user.id, dto);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return this.companiesService.getProfileFrontEnd(req.user.id);
  }

  @Patch('profile')
  updateProfile(
    @Request() req,
    @Body() dto: UpdateCompanyDto,
  ) {
    console.log(dto)
    return this.companiesService.updateProfile(req.user.id, dto);
  }

  @Post('logo')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/logos',
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}${extname(file.originalname)}`;

          callback(null, uniqueName);
        },
      }),
    }),
  )
  async uploadLogo(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const logoUrl = `/uploads/logos/${file.filename}`;

    return this.companiesService.updateLogo(
      req.user.id,
      logoUrl,
    );
  }
}