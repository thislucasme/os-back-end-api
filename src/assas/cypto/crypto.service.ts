import {
    createCipheriv,
    createDecipheriv,
    randomBytes,
} from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CryptoService {

    constructor() {
        const key = process.env.CRYPTO_KEY;
        console.log("KEY", key)

        if (!key) {
            throw new Error('CRYPTO_KEY não configurada');
        }

        this.key = Buffer.from(key, 'hex');

        if (this.key.length !== 32) {
            throw new Error(
                'CRYPTO_KEY precisa ter 32 bytes (64 caracteres hex)',
            );
        }
    }

    private readonly algorithm = 'aes-256-gcm';
    private readonly key = Buffer.from(process.env.CRYPTO_KEY!, 'hex');

    encrypt(text: string): string {
        const iv = randomBytes(16);

        const cipher = createCipheriv(this.algorithm, this.key, iv);

        const encrypted = Buffer.concat([
            cipher.update(text, 'utf8'),
            cipher.final(),
        ]);

        const authTag = cipher.getAuthTag();

        return [
            iv.toString('hex'),
            authTag.toString('hex'),
            encrypted.toString('hex'),
        ].join(':');
    }

    decrypt(payload: string): string {
        const [ivHex, authTagHex, encryptedHex] = payload.split(':');

        const decipher = createDecipheriv(
            this.algorithm,
            this.key,
            Buffer.from(ivHex, 'hex'),
        );

        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedHex, 'hex')),
            decipher.final(),
        ]);

        return decrypted.toString('utf8');
    }
}