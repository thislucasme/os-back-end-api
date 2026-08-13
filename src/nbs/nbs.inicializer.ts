import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { NbsService } from './nbs.service';

@Injectable()
export class NbsInitializer implements OnApplicationBootstrap {
  constructor(private readonly nbsService: NbsService) {}

  async onApplicationBootstrap() {
    // Executa assim que o NestJS inicializar todos os módulos
    await this.nbsService.sincronizarNbs();
  }
}