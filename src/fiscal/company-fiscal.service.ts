import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyFiscalService } from './company-service.entity';
import { CreateFiscalServiceDto, UpdateCompanyFiscalDto } from './tdos/company-fiscal.dto';
import { User } from 'src/users/user.entity';
import { Company } from 'src/companies/ company.entity';
import { CompanyFiscalSettings } from './entities/company-fiscal-settings.entity';

@Injectable()
export class CompanyFiscalServiceManager {
    constructor(
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
        @InjectRepository(CompanyFiscalSettings)
        private settingsRepository: Repository<CompanyFiscalSettings>,
        @InjectRepository(CompanyFiscalService)
        private serviceRepository: Repository<CompanyFiscalService>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
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

        // Busca ou inicializa as configurações fiscais da tabela própria
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

        // Retorna unificando os dados da empresa, as configurações fiscais e os serviços
        return {
            ...company,
            ...settings,
            fiscalServices,
        };
    }

    async upsertSettings(userId: string | number, dto: UpdateCompanyFiscalDto) {
        const user = await this.getUserWithCompany(Number(userId));
        const company = user.company;

        if (!company || !company.uid) {
            throw new NotFoundException('Empresa não encontrada ou sem UID.');
        }

        const { services, ...settingsData } = dto;

        // Busca ou cria as configurações fiscais na tabela própria
        let settings = await this.settingsRepository.findOne({
            where: { companyUid: company.uid },
        });

        if (!settings) {
            settings = this.settingsRepository.create({ companyUid: company.uid });
        }

        // Atualiza os dados fiscais na nova tabela
        Object.assign(settings, settingsData);
        await this.settingsRepository.save(settings);

        // Gerenciamento dos serviços fiscais
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

    async createSettings(userId: string | number, dto: UpdateCompanyFiscalDto) {
        const user = await this.getUserWithCompany(Number(userId));
        const company = user.company;

        if (!company || !company.uid) {
            throw new NotFoundException('Empresa não encontrada ou sem UID.');
        }

        // Verifica se já existe configuração fiscal para esta empresa
        const existingSettings = await this.settingsRepository.findOne({
            where: { companyUid: company.uid },
        });

        if (existingSettings) {
            throw new BadRequestException('As configurações fiscais desta empresa já existem. Utilize o PUT para atualizar.');
        }

        const { services, ...settingsData } = dto;

        // Cria a nova configuração fiscal
        const settings = this.settingsRepository.create({
            ...settingsData,
            companyUid: company.uid,
        });
        await this.settingsRepository.save(settings);

        // Se enviou serviços junto na criação, cadastra-os também
        if (services && services.length > 0) {
            for (const sDto of services) {
                const service = this.serviceRepository.create({ ...sDto, companyUid: company.uid });
                await this.serviceRepository.save(service);
            }
        }

        return this.findByUserId(userId);
    }
}