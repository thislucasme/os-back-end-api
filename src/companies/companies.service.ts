import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { randomUUID } from 'crypto';

import { User } from 'src/users/user.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './ company.entity';
import { CryptoService } from 'src/assas/cypto/crypto.service';
import { WebhookService } from 'src/assas/webhook/webhook.service';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly cryptoService: CryptoService,
    @Inject(forwardRef(() => WebhookService))
    private readonly webhookService: WebhookService,
  ) { }
  async getApiTokenByUserId(userId: number): Promise<string> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: {
        company: true,
      },
    });

    if (!user || !user.company || !user.company.apiToken) {
      throw new NotFoundException('Token da empresa não encontrado');
    }

    return this.cryptoService.decrypt(user.company.apiToken);
  }

  async getApiTokenByCompanyId(companyId: number): Promise<string | null> {
    const company = await this.companyRepo.findOne({
      where: { id: companyId },
      select: {
        apiToken: true,
      },
    });

    if (company && company.apiToken) {
      return this.cryptoService.decrypt(company.apiToken);
    }
    return null


  }
  async getWebHookTokenByCompanyId(companyId: number): Promise<string> {
    const company = await this.companyRepo.findOne({
      where: { id: companyId },
      select: {
        webHookToken: true,
      },
    });

    if (!company || !company.webHookToken) {
      throw new NotFoundException('WebHookToken da empresa não encontrado');
    }

    return this.cryptoService.decrypt(company.webHookToken);
  }

  public async getUserWithCompany(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: {
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  public async getCompanyByCompanyId(companyId: number) {
    const user = await this.userRepo.findOne({
      where: { companyId },
      relations: {
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }
  public async getHookTokenByCompanyId(companyId: number) {
    const user = await this.userRepo.findOne({
      where: { companyId },
      relations: {
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async create(userId: number, dto: CreateCompanyDto) {
    const user = await this.getUserWithCompany(userId);
    if (dto.apiToken) {
      const assasApiTokenCrypted = this.cryptoService.encrypt(dto.apiToken)
      dto.apiToken = assasApiTokenCrypted
    }

    if (user.companyId) {
      throw new BadRequestException(
        'Usuário já possui empresa vinculada',
      );
    }

    const company = this.companyRepo.create({
      ...dto,
      uid: randomUUID(),
    });

    const savedCompany = await this.companyRepo.save(company);

    user.companyId = savedCompany.id;
    await this.userRepo.save(user);

    return savedCompany;
  }

  async getProfileFrontEnd(userId: number) {
    const user = await this.getUserWithCompany(userId);
    if (user && user.company && user.company.apiToken) {
      const assasApiTokenCrypted = this.cryptoService.decrypt(user.company.apiToken)
      user.company.apiToken = assasApiTokenCrypted
    }

    if (!user.company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return user.company;
  }

  public async getCompanyEntity(userId: number) {
    const user = await this.getUserWithCompany(userId);

    if (!user.company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return user.company;
  }

  async updateProfile(userId: number, dto: UpdateCompanyDto) {
    const company = await this.getCompanyEntity(userId);

    if (dto.apiToken) {
      const assasApiTokenCrypted = this.cryptoService.encrypt(dto.apiToken)
      dto.apiToken = assasApiTokenCrypted
    }
    Object.assign(company, dto);

    if (!company.uid) {
      company.uid = randomUUID();
    }

    if (company.apiToken && !company.webHookToken) {
      const assasApiKeyDecryped = this.cryptoService.decrypt(company.apiToken)
      const createdWebHook = await this.cadastrarEmpresaComAsaas(company, assasApiKeyDecryped, String(company.id))
      if (createdWebHook.success) {
        const assasWebHookTokenCrypted = this.cryptoService.encrypt(createdWebHook.webhook.authToken)
        company.webHookToken = assasWebHookTokenCrypted
      }
    }

    return this.companyRepo.save(company);
  }

  async updateLogo(userId: number, logoUrl: string) {
    const company = await this.getCompanyEntity(userId);
    if (company.apiToken && !company.webHookToken) {
      const assasApiKeyDecryped = this.cryptoService.decrypt(company.apiToken)
      const createdWebHook = await this.cadastrarEmpresaComAsaas(company, assasApiKeyDecryped, String(company.id))
      if (createdWebHook.success) {

        const assasWebHookTokenCrypted = this.cryptoService.encrypt(createdWebHook.webhook.authToken)
        company.webHookToken = assasWebHookTokenCrypted
      }
    }
    company.logoUrl = logoUrl;

    return this.companyRepo.save(company);
  }

  async cadastrarEmpresaComAsaas(dadosEmpresa: any, asaasToken: string, companyId: string) {
    try {
      // ... sua lógica de salvar a empresa no banco de dados local ...
      // const novaEmpresa = await this.prisma.company.create({ ... });

      this.logger.log(`Cadastrando webhook no Asaas para a empresa: ${companyId}`);

      // 2. Chama o método do WebhookService
      const webhookResponse = await this.webhookService.createOrUpdateWebhook(
        asaasToken,
        companyId
      );
      console.log("token webhook criado:", webhookResponse)
      this.logger.log(`Webhook configurado com sucesso no Asaas: ${webhookResponse.url}`);

      // (Opcional) Se o Asaas retornar um authToken/secret do webhook, salve-o no banco aqui:
      // await this.salvarTokenWebhookNoBanco(companyId, webhookResponse.authToken);

      return {
        success: true,
        message: 'Empresa cadastrada e webhook configurado com sucesso!',
        webhook: webhookResponse,
      };

    } catch (error) {
      this.logger.error(`Erro ao configurar webhook para a empresa ${companyId}`, error);

      // Se o erro lançado pelo WebhookService for um HttpException do NestJS, você pode repassá-lo
      if (error instanceof HttpException) {
        throw error;
      }

      // Caso seja outro tipo de erro inesperado
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erro ao registrar empresa e configurar integração de pagamentos.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}