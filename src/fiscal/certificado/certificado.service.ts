import { Injectable, NotFoundException } from '@nestjs/common';
import { CryptoCertificateService } from 'src/common/crypto.service';
import { UploadCertificadoDto } from './tdo/upload-certificado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Certificate } from './entities/certificado.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';

@Injectable()
export class CertificadoService {
    constructor(
        private readonly crypto: CryptoCertificateService,
        @InjectRepository(Certificate)
        private certificateRepository: Repository<Certificate>,
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

    async uploadCertificado(
        userId: number,
        dto: UploadCertificadoDto,
    ) {
        const user = await this.getUserWithCompany(userId);
        const company = user.company;

        // Alterado de company.uid para company.id
        if (!company || !company.id) {
            throw new NotFoundException('Empresa não encontrada ou sem ID.');
        }

        Buffer.from(dto.pfxBase64, 'base64');

        const certificadoPfxCriptografado = this.crypto.encrypt(dto.pfxBase64);
        const certificadoSenhaCriptografada = this.crypto.encrypt(dto.password);

        // Busca pelo ID numérico da empresa
        let certificate = await this.certificateRepository.findOne({
            where: { company: { id: company.id } },
            relations: { company: true },
        });

        if (certificate) {
            certificate.certificadoPfxCriptografado = certificadoPfxCriptografado;
            certificate.certificadoSenhaCriptografada = certificadoSenhaCriptografada;
            certificate.companyId = company.id; // Garante que o ID está preenchido
        } else {
            certificate = this.certificateRepository.create({
                companyId: company.id,
                certificadoPfxCriptografado,
                certificadoSenhaCriptografada,
            });
        }

        const saved = await this.certificateRepository.save(certificate);

        const savedWithCompany = await this.certificateRepository.findOne({
            where: { id: saved.id },
            relations: { company: true },
        });

        return {
            id: saved.id,
            companyId: savedWithCompany?.company?.id || company.id,
            companyUid: savedWithCompany?.company?.uid, // Mantido caso queira retornar o uid para o front-end
            certificadoPfx: this.crypto.decrypt(saved.certificadoPfxCriptografado!),
            certificadoSenha: this.crypto.decrypt(saved.certificadoSenhaCriptografada!),
            createdAt: saved.createdAt,
            updatedAt: saved.updatedAt,
        };
    }

    async getCertificado(userId: number) {
        const user = await this.getUserWithCompany(userId);
        const company = user.company;

        if (!company || !company.id) {
            throw new NotFoundException('Empresa não encontrada ou sem ID.');
        }

        const certificate = await this.certificateRepository.findOne({
            where: { company: { id: company.id } },
            relations: { company: true },
        });

        if (!certificate) {
            throw new NotFoundException('Certificado não encontrado para esta empresa.');
        }

        return {
            id: certificate.id,
            companyId: certificate.company.id,
            companyUid: certificate.company.uid,
            certificadoPfx: this.crypto.decrypt(certificate.certificadoPfxCriptografado!),
            certificadoSenha: this.crypto.decrypt(certificate.certificadoSenhaCriptografada!),
            createdAt: certificate.createdAt,
            updatedAt: certificate.updatedAt,
        };
    }

    async removeCertificado(userId: number) {
        const user = await this.getUserWithCompany(userId);
        const company = user.company;

        if (!company || !company.id) {
            throw new NotFoundException('Empresa não encontrada ou sem ID.');
        }

        const certificate = await this.certificateRepository.findOne({
            where: { company: { id: company.id } },
        });

        if (!certificate) {
            throw new NotFoundException('Nenhum certificado encontrado para esta empresa.');
        }

        await this.certificateRepository.remove(certificate);

        return { message: 'Certificado removido com sucesso.' };
    }
}