import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyFiscalService } from './company-service.entity';
import { CreateFiscalServiceDto, UpdateCompanyFiscalDto } from './tdos/company-fiscal.dto';
import { User } from 'src/users/user.entity';
import { Company } from 'src/companies/ company.entity';
import { CompanyFiscalSettings } from './entities/company-fiscal-settings.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PaymentResponseDto } from 'src/assas/cobrancas/dtos/payment-response.dto';
import { ClienteFornecedor } from 'src/clientes-fornecedores/entities/cliente-fornecedor.entity';
import { ConfigService } from '@nestjs/config';

export enum NfseStatus {
    PENDENTE = 'PENDENTE',
    PROCESSANDO = 'PROCESSANDO',
    OK = 'OK',
    REJEITADA = 'REJEITADA',
    FALHA_COMUNICACAO = 'FALHA_COMUNICACAO',
    ERRO_INTERNO = 'ERRO_INTERNO',
}

export type ListarNfseQuery = {
    page?: number;
    limit?: number;
    tomadorDocumento?: string;
    tomadorNome?: string;
    numeroDps?: string;
    serieDps?: string;
    chaveAcesso?: string;
};

@Injectable()
export class CompanyFiscalServiceManager {
    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
        @InjectRepository(CompanyFiscalSettings)
        private settingsRepository: Repository<CompanyFiscalSettings>,
        @InjectRepository(CompanyFiscalService)
        private serviceRepository: Repository<CompanyFiscalService>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(ClienteFornecedor)
        private clienteFornecedorRepository: Repository<ClienteFornecedor>,
        private readonly configService: ConfigService
    ) { }


    public async getUserWithCompany(userId: number) {
        const user = await this.userRepository.findOne({
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

    async findOneClienteFornecedorBy(userId: number, clienteFornecedorId: number) {
        const company = await this.getUserWithCompany(userId);

        const item = await this.clienteFornecedorRepository.findOne({
            where: {
                id: clienteFornecedorId,
                companyId: company.id,
            },
        });

        if (!item) {
            throw new NotFoundException('Cadastro não encontrado.');
        }

        return item;
    }

    async create(userId: number, dto: CreateFiscalServiceDto) {
        const user = await this.getUserWithCompany(userId);
        const company = user.company;

        if (!company || !company.uid) {
            throw new NotFoundException('Empresa não encontrada ou sem UID.');
        }

        const fiscalService = this.serviceRepository.create({
            ...dto,
            companyUid: company.uid,
        });

        return await this.serviceRepository.save(fiscalService);
    }

    async findByUserId(userId: string | number) {
        const user = await this.getUserWithCompany(Number(userId));
        const company = user.company;

        if (!company || !company.uid) {
            throw new NotFoundException('Empresa não encontrada ou sem UID.');
        }

        // Busca ou inicializa as configurações fiscais gerais da empresa
        let settings = await this.settingsRepository.findOne({
            where: { companyUid: company.uid },
        });

        if (!settings) {
            settings = this.settingsRepository.create({ companyUid: company.uid });
            await this.settingsRepository.save(settings);
        }

        const fiscalServices = await this.serviceRepository.find({
            where: { companyUid: company.uid },
        });

        // Retorna unificando os dados da empresa, as configurações gerais e os serviços contendo suas tributações específicas
        return {
            ...company,
            ...settings,
            fiscalServices,
        };
    }

    async emitirNota(userId: string | number, valorServico: number, serviceId: string, clienteFornecedorId: number) {
        // 1. Pega os dados unificados direto da sua função do back-end
        const dadosEmpresaCompleto = await this.findByUserId(userId);
        // 2. Executa a lógica de cálculo e montagem do payload
        const payloadPronto = this.gerarPayloadEmissao(dadosEmpresaCompleto, valorServico, serviceId, userId, clienteFornecedorId);

        // 3. Envia o payload para o seu endpoint de emissão ou biblioteca open-nfse
        // const respostaEmissao = await this.enviarParaOpenNfse(payloadPronto);

        return payloadPronto;
    }

    async gerarPayloadEmissao(dadosEmpresa: any, valorServico: number, serviceId: string, userId: string | number, clienteFornecedorId: number) {
        const servicoConfig = await this.serviceRepository.findOne({ where: { id: serviceId, companyUid: dadosEmpresa.uid } });
        const clienteFornecedor = await this.findOneClienteFornecedorBy(Number(userId), clienteFornecedorId)
        const nfseApiUrl = this.configService.get<string>('NFSE_API_URL');
        if (!servicoConfig) {
            throw new BadRequestException("Serviço não encontrado")
        }
        if (!clienteFornecedor) {
            throw new BadRequestException("Cliente ou fornecedor não encontrado")
        }
        const aliqIss = Number(servicoConfig.aliquotaIss) || undefined;
        const percTribSimples = Number(servicoConfig.percentualTributosSimples) || undefined;
        const percTribFed = Number(servicoConfig.percentualTributosFederal) || 0;
        const percTribEst = Number(servicoConfig.percentualTributosEstadual) || 0;
        const percTribMun = Number(servicoConfig.percentualTributosMunicipal) || 0;

        // Monta o objeto de valores seguindo estritamente a interface ValoresInput do open-nfse
        const valores: any = {
            vServ: valorServico,
        };

        if (aliqIss !== undefined && !isNaN(aliqIss)) {
            valores.aliqIss = aliqIss;
        }

        if (percTribSimples !== undefined && !isNaN(percTribSimples)) {
            valores.pTotTribSN = percTribSimples;
        }

        // Se houver tributos percentuais ou em valor para preencher o choice totTrib
        if (percTribFed > 0 || percTribEst > 0 || percTribMun > 0) {
            valores.pTotTrib = {
                pTotTribFed: percTribFed,
                pTotTribEst: percTribEst,
                pTotTribMun: percTribMun,
            };
        }

        const payload = {
            serie: dadosEmpresa.serie,
            servico: {
                cTribNac: servicoConfig.cTribNac || "",
                cNBS: servicoConfig.cNBS || undefined,
                descricao: servicoConfig.descricaoServico || "",
            },
            valores,
            tomador: {
                documento: {
                    CNPJ: clienteFornecedor.documento
                },
                nome: clienteFornecedor.nome,
                email: clienteFornecedor.email,
                endereco: {
                    codMunicipio: "5208707",
                    cep: "74255220",
                    logradouro: "Av. T-9",
                    numero: "2310",
                    bairro: "Setor Jardim América"
                }
            }
        };

        try {
            const response = await firstValueFrom(
                this.httpService.post<any>(
                    `${nfseApiUrl}/api/nfse/emissores/${dadosEmpresa.nfseEmitenteUid}`,
                    payload,
                ),
            );

            return response.data;
        } catch (error: any) {
            if (error.response) {
                console.error("Detalhes do erro:", error.response.data);
            }
            throw new BadRequestException("Erro ao emitir nfse", error.response.data)
        }

        return payload
    }

    async gerarPayloadUpdateEmitente(userId: number) {
        const nfseApiUrl = this.configService.get<string>('NFSE_API_URL');
        //getUserWithCompany
        const dadosEmpresaCompleto = await this.findByUserId(userId);
        const payload = {
            cnpj: dadosEmpresaCompleto.cnpj,
            codigoMunicipio: dadosEmpresaCompleto.codigoMunicipio,
            razaoSocial: dadosEmpresaCompleto.corporateName,
            nomeFantasia: dadosEmpresaCompleto.name,
            inscricaoMunicipal: dadosEmpresaCompleto.inscricaoMunicipal || null,
            opcaoSimplesNacional: dadosEmpresaCompleto.opcaoSimplesNacional ? String(dadosEmpresaCompleto.opcaoSimplesNacional) : null,
            regimeApuracaoSimplesNacional: dadosEmpresaCompleto.regimeApuracaoSimplesNacional ? String(dadosEmpresaCompleto.regimeApuracaoSimplesNacional) : null,
            regimeEspecialTributacao: dadosEmpresaCompleto.regimeEspecialTributacao ? String(dadosEmpresaCompleto.regimeEspecialTributacao) : null,
            ambiente: dadosEmpresaCompleto.ambiente,
            serieDps: dadosEmpresaCompleto.serie ? String(dadosEmpresaCompleto.serie) : null,
            proximoNumeroDps: dadosEmpresaCompleto.serieDps ? Number(dadosEmpresaCompleto.serieDps) : 0,
        };
        console.log(payload)
        try {
            const response = await firstValueFrom(
                this.httpService.post<PaymentResponseDto>(
                    `${nfseApiUrl}/api/emissores`,
                    payload,
                ),
            );

            return response.data;
        } catch (error: any) {
            if (error.response) {
                console.error("Detalhes do erro:", error.response.data);
            }
            throw new BadRequestException(error.response.data)
        }
    }

    async listarNfsePorCnpjEmissor(cnpjEmissor: string, query?: ListarNfseQuery) {
        const nfseApiUrl = this.configService.get<string>('NFSE_API_URL');
        try {
            const urlCompleta = this.httpService.axiosRef.getUri({
                url: `${nfseApiUrl}/api/nfse/emissores/${cnpjEmissor}/filtrar`,
                params: query,
            });

            console.log(`curl -X GET "${urlCompleta}"`);

            const response = await firstValueFrom(
                this.httpService.get(
                    `${nfseApiUrl}/api/nfse/emissores/${cnpjEmissor}/filtrar`,
                    { params: query },
                ),
            );

            return response.data;
        } catch (error: any) {
            if (error.response) {
                console.error('Detalhes do erro:', error);
            }
            throw new BadRequestException(error.response?.data || 'Erro ao listar NFS-e');
        }
    }

    async upsertSettings(userId: string | number, dto: UpdateCompanyFiscalDto) {
        const user = await this.getUserWithCompany(Number(userId));
        const company = user.company;

        if (!company || !company.uid) {
            throw new NotFoundException('Empresa não encontrada ou sem UID.');
        }

        const { services, ...settingsData } = dto;

        // Busca ou cria as configurações fiscais gerais da empresa
        let settings = await this.settingsRepository.findOne({
            where: { companyUid: company.uid },
        });

        if (!settings) {
            settings = this.settingsRepository.create({ companyUid: company.uid });
        }



        // Gerenciamento dos serviços fiscais (agora salvando as alíquotas e tributos específicos por serviço)
        if (services) {
            const incomingServiceIds = services.filter((s) => s.id).map((s) => s.id);

            const existingServices = await this.serviceRepository.find({ where: { companyUid: company.uid } });
            const servicesToDelete = existingServices.filter((s) => !incomingServiceIds.includes(s.id));

            if (servicesToDelete.length > 0) {
                await this.serviceRepository.remove(servicesToDelete);
            }
            for (const sDto of services) {
                let service: CompanyFiscalService | null = null;

                if (sDto.id) {
                    service = await this.serviceRepository.findOne({ where: { id: sDto.id, companyUid: company.uid } });
                }

                if (!service) {
                    service = this.serviceRepository.create({ ...sDto, companyUid: company.uid });
                } else {
                    Object.assign(service, sDto);
                }
                await this.serviceRepository.save(service);
            }
        }

        const nfseEmitente = await this.gerarPayloadUpdateEmitente(Number(userId))

        if (nfseEmitente.id)
            settings.nfseEmitenteUid = nfseEmitente.id

        // Atualiza apenas os dados gerais na tabela de configurações da empresa
        Object.assign(settings, settingsData);
        await this.settingsRepository.save(settings);

        return this.findByUserId(userId);
    }

    async deleteService(userId: string | number, serviceId: string) {
        const user = await this.getUserWithCompany(Number(userId));
        const company = user.company;

        if (!company || !company.uid) {
            throw new NotFoundException('Empresa não encontrada ou sem UID.');
        }

        const service = await this.serviceRepository.findOne({ where: { id: serviceId, companyUid: company.uid } });
        if (!service) {
            throw new NotFoundException('Serviço não encontrado.');
        }

        await this.serviceRepository.remove(service);
        return { success: true };
    }

    async getCompanySerices(userId: string | number) {
        const user = await this.getUserWithCompany(Number(userId));
        const company = user.company;

        if (!company || !company.uid) {
            throw new NotFoundException('Empresa não encontrada ou sem UID.');
        }

        const services = await this.serviceRepository.find({ where: { companyUid: company.uid } });
        if (!services) {
            throw new NotFoundException('Serviços não encontrado.');
        }

        return services
    }

    async createSettings(userId: string | number, dto: UpdateCompanyFiscalDto) {
        const user = await this.getUserWithCompany(Number(userId));
        const company = user.company;

        if (!company || !company.uid) {
            throw new NotFoundException('Empresa não encontrada ou sem UID.');
        }

        const existingSettings = await this.settingsRepository.findOne({
            where: { companyUid: company.uid },
        });

        if (existingSettings) {
            throw new BadRequestException('As configurações fiscais desta empresa já existem. Utilize o PUT para atualizar.');
        }

        const { services, ...settingsData } = dto;

        const settings = this.settingsRepository.create({
            ...settingsData,
            companyUid: company.uid,
        });
        await this.settingsRepository.save(settings);

        if (services && services.length > 0) {
            for (const sDto of services) {
                const service = this.serviceRepository.create({ ...sDto, companyUid: company.uid });
                await this.serviceRepository.save(service);
            }
        }

        return this.findByUserId(userId);
    }
}