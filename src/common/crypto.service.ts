
import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class CryptoCertificateService {
      private readonly key: Buffer;

  constructor() {
    const value = process.env.CERT_ENCRYPTION_KEY;
    if (!value || !/^[0-9a-fA-F]{64}$/.test(value)) {
      throw new Error('CERT_ENCRYPTION_KEY deve conter 64 caracteres hexadecimais.');
    }
    this.key = Buffer.from(value, 'hex');
  }

  encrypt(value: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`;
  }

  decrypt(value: string): string {
    const [iv, tag, encrypted] = value.split('.');
    const decipher = createDecipheriv('aes-256-gcm', this.key, Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    return Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  }
}
