import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DanfseHtmlBuilder, DanfseXmlParser } from '@notaas/danfse-viewer';

import puppeteer from 'puppeteer';

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET_NAME;

    if (!accountId) {
      throw new Error('R2_ACCOUNT_ID não configurado');
    }

    if (!accessKeyId) {
      throw new Error('R2_ACCESS_KEY_ID não configurado');
    }

    if (!secretAccessKey) {
      throw new Error('R2_SECRET_ACCESS_KEY não configurado');
    }

    if (!bucket) {
      throw new Error('R2_BUCKET_NAME não configurado');
    }

    this.bucket = bucket;

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async upload(
    key: string,
    data: Buffer,
    contentType: string,
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
      }),
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async getUrl(
    key: string,
    expiresIn = 300,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, {
      expiresIn,
    });
  }

private extrairEmpresaIdDaKey(key: string): string {
  const match = key.match(/^empresas\/([^/]+)\//);

  if (!match) {
    throw new Error(`Key de storage inválida: ${key}`);
  }

  return match[1];
}

async gerarDanfseDoXml(key: string): Promise<Buffer> {
  const response = await this.client.send(
    new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error(`XML não encontrado no storage: ${key}`);
  }

  const xml = await response.Body.transformToString('utf-8');

  if (!xml.trim()) {
    throw new Error(`XML vazio: ${key}`);
  }

  const parser = new DanfseXmlParser();
  const data = await parser.parse(xml);

  const builder = new DanfseHtmlBuilder();
  const html = builder.build(data);

const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    const pdf = await page.pdf({
      format: 'a4',
      printBackground: true,
      preferCSSPageSize: true,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

async getXml(key: string): Promise<Buffer> {
    const response = await this.client.send(
        new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        }),
    );

    if (!response.Body) {
        throw new Error(`XML não encontrado no storage: ${key}`);
    }

    const xml = await response.Body.transformToByteArray();

    return Buffer.from(xml);
}
}