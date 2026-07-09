import { Proposta } from 'src/ordens-servico/entities/proposta.entity';

function safe(value: any): string {
  if (value === null || value === undefined) return '';

  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function moeda(value: any): string {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function dataBR(value: any): string {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
  });
}

function textoComQuebra(value: any): string {
  return safe(value || '').replace(/\n/g, '<br>');
}

function toAbsoluteUrl(url?: string | null): string {
  if (!url) return '';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const baseUrl = process.env.API_PUBLIC_URL || 'http://localhost:8007';

  return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
}

function getFotoPrincipal(os: any): string | null {
  const anexos = os?.anexos || [];

  const foto =
    anexos.find((a: any) => a.tipo === 'IMAGEM') ||
    anexos.find((a: any) => a.mimeType?.startsWith('image/')) ||
    anexos.find((a: any) =>
      /\.(jpg|jpeg|png|webp|gif)$/i.test(a.url || a.filename || ''),
    );

  return foto?.url ? toAbsoluteUrl(foto.url) : null;
}

export function propostaPdfTemplate(proposta: Proposta): string {
  const company = proposta.company;
  const cliente = proposta.cliente;
  const os = proposta.ordemServico;

console.log("OS:", os?.id, os?.numero);
console.log("ANEXOS DA OS:", os?.anexos);

const fotoPrincipal =
  os?.anexos?.[0]?.url
    ? toAbsoluteUrl(os.anexos[0].url)
    : null;

console.log("FOTO PRINCIPAL:", fotoPrincipal);

  const rows = (proposta.itens || [])
    .map((item: any, index: number) => {
      const quantidade = Number(item.quantidade || 1);
      const valorUnitario = Number(item.valorUnitario || item.valor || 0);
      const valorTotal = Number(item.valorTotal || quantidade * valorUnitario);

      return `
        <tr>
          <td>${String(index + 1).padStart(2, '0')}</td>
          <td>
            <strong>${safe(item.nome || item.descricao || 'Item')}</strong><br>
            ${safe(item.detalhes || item.observacoes || '')}
          </td>
          <td>${quantidade}</td>
          <td>${moeda(valorUnitario)}</td>
          <td>${moeda(valorTotal)}</td>
        </tr>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Proposta ${safe(proposta.numero)}</title>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

@page {
  size: A4;
  margin: 0;
}

html,
body {
  width: 100%;
  min-height: 100%;
}

body {
  background: #ffffff;
  font-family: Arial, Helvetica, sans-serif;
  color: #0b2e55;
}

.page {
  width: 210mm;
  min-height: 297mm;
  background: #ffffff;
  border-top: 2mm solid #078b3e;
}

.content {
  padding: 12mm 10mm 6mm 10mm;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12mm;
  border-bottom: 1.5px solid #123b63;
  padding-bottom: 3mm;
}

.logo img {
  width: 70mm;
  max-height: 28mm;
  object-fit: contain;
  object-position: left center;
  display: block;
}

.logo h2 {
  font-size: 24px;
  color: #062b55;
}

.title {
  min-width: 58mm;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.title h1 {
  font-size: 30px;
  color: #062b55;
  line-height: 1;
}

.num {
  background: #078b3e;
  color: #ffffff;
  padding: 1.5mm 5mm;
  border-radius: 3px;
  font-weight: bold;
  font-size: 16px;
  margin: 2mm 0;
}

.contact {
  width: 58mm;
  font-size: 12px;
  line-height: 1.7;
  text-align: left;
}

.info {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 5mm;
  margin-top: 4mm;
}

.company {
  font-size: 12px;
  line-height: 1.45;
}

.company-row {
  display: grid;
  grid-template-columns: 8mm 1fr;
  gap: 2mm;
  margin-bottom: 2.5mm;
}

.ico {
  width: 7mm;
  height: 7mm;
  background: #078b3e;
  color: #ffffff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
}

.box {
  border: 1.2px solid #123b63;
  border-radius: 5px;
  overflow: hidden;
}

.box-title {
  background: #062b55;
  color: #ffffff;
  text-align: center;
  font-weight: bold;
  padding: 1.8mm;
  font-size: 12px;
}

.client {
  padding: 2.5mm 4mm;
  font-size: 12px;
}

.field {
  border-bottom: 1px solid #aab5c0;
  padding: 1.6mm 0;
}

.field:last-child {
  border-bottom: none;
}

.field strong {
  display: inline-block;
  width: 21mm;
}

.service {
  margin-top: 4mm;
  border: 1.2px solid #123b63;
  border-radius: 5px;
  overflow: hidden;
}

.service-body {
  padding: 4mm;
}

.service-layout {
  display: grid;
  grid-template-columns: 65mm 1fr;
  gap: 5mm;
  align-items: start;
}

.service-photo {
  height: 55mm;
  border: 1px solid #cfd6dd;
  border-radius: 5px;
  overflow: hidden;
  background: #f5f5f5;
}

.service-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.service-text {
  min-height: 55mm;
}

.service-text h3 {
  color: #062b55;
  font-size: 15px;
  margin-bottom: 2mm;
}

.service-text p {
  font-size: 12px;
  line-height: 1.6;
  text-align: justify;
}

.items {
  margin-top: 4mm;
  border: 1px solid #b9c3cc;
  border-radius: 5px;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10.5px;
}

thead {
  background: #062b55;
  color: #ffffff;
}

th,
td {
  border: 1px solid #b9c3cc;
  padding: 1.6mm 2mm;
}

th {
  text-align: center;
}

td:nth-child(1) {
  width: 10mm;
  text-align: center;
}

td:nth-child(3) {
  width: 12mm;
  text-align: center;
}

td:nth-child(4),
td:nth-child(5) {
  width: 26mm;
  text-align: right;
}

tbody tr:nth-child(even) {
  background: #f6f8fa;
}

.total {
  display: flex;
  justify-content: flex-end;
}

.total-label {
  background: #062b55;
  color: #ffffff;
  padding: 2.5mm 7mm;
  font-weight: bold;
  font-size: 12px;
}

.total-value {
  background: #078b3e;
  color: #ffffff;
  padding: 2.4mm 8mm;
  font-size: 16px;
  font-weight: bold;
}

.pay-note {
  text-align: right;
  font-size: 9.5px;
  margin-top: 1mm;
  color: #333333;
}

.notes {
  margin-top: 3mm;
  border: 1.2px solid #078b3e;
  border-radius: 5px;
  padding: 2.5mm 3mm;
  display: grid;
  grid-template-columns: 1fr 1.7fr;
  gap: 4mm;
}

.note {
  font-size: 9.5px;
  line-height: 1.35;
}

.note h4 {
  color: #078b3e;
  font-size: 11.5px;
  margin-bottom: 1mm;
}

.divider {
  border-left: 1px solid #b7d5c0;
  padding-left: 4mm;
}

.thanks {
  text-align: center;
  font-size: 11px;
  font-weight: bold;
  font-style: italic;
  margin-top: 2mm;
}
</style>
</head>

<body>
<div class="page">
  <div class="content">

    <header class="header">
      <div class="logo">
        ${
          company?.logoUrl
            ? `<img src="${safe(toAbsoluteUrl(company.logoUrl))}" alt="${safe(company.name)}">`
            : `<h2>${safe(company?.name || 'Empresa')}</h2>`
        }
      </div>

      <div class="title">
        <h1>PROPOSTA</h1>
        <div class="num">Nº ${safe(proposta.numero)}</div>

        <div class="contact">
          ${
            company?.whatsapp || company?.phone
              ? `<p>WhatsApp: ${safe(company.whatsapp || company.phone)}</p>`
              : ''
          }
          ${
            company?.companyEmail
              ? `<p>Email: ${safe(company.companyEmail)}</p>`
              : ''
          }
          ${
            company?.instagram
              ? `<p>Instagram: ${safe(company.instagram)}</p>`
              : ''
          }
        </div>
      </div>
    </header>

    <section class="info">
      <div class="company">
        <div class="company-row">
          <div class="ico">E</div>
          <div>
            <b>${safe(company?.name || 'Empresa')}</b><br>
            ${company?.cnpj ? `CNPJ: ${safe(company.cnpj)}` : ''}
          </div>
        </div>

        <div class="company-row">
          <div class="ico">L</div>
          <div>
            ${safe(company?.address || '')}<br>
            ${safe(company?.city || '')}${company?.state ? ` - ${safe(company.state)}` : ''}
            ${company?.zipCode ? ` | CEP: ${safe(company.zipCode)}` : ''}
          </div>
        </div>

        <div class="company-row">
          <div class="ico">S</div>
          <div>
            ${safe(company?.observations || 'Prestação de serviços, manutenção e fornecimento de produtos.')}
          </div>
        </div>
      </div>

      <div class="box">
        <div class="box-title">DADOS DO CLIENTE</div>

        <div class="client">
          <div class="field">
            <strong>Cliente:</strong>
            <b>${safe(cliente?.nome || '-')}</b>
          </div>

          <div class="field">
            <strong>Endereço:</strong>
            <b>${safe(cliente?.endereco || '-')}</b>
          </div>

          <div class="field">
            <strong>Data:</strong>
            ${dataBR(proposta.dataEmissao || proposta.createdAt)}
          </div>

          <div class="field">
            <strong>Validade:</strong>
            ${dataBR(proposta.validade)}
          </div>
        </div>
      </div>
    </section>

    <section class="service">
      <div class="box-title">DESCRIÇÃO DO SERVIÇO</div>

      <div class="service-body">
        <div class="service-layout">
<div class="service-photo">
  ${
    fotoPrincipal
      ? `<img src="${safe(fotoPrincipal)}" alt="Foto do serviço">`
      : `<div style="font-size:11px;color:#999;padding:12px;">Sem foto</div>`
  }
</div>

          <div class="service-text">
            <h3>${safe(proposta.titulo || os?.titulo || 'Serviço')}</h3>

            <p>
              ${textoComQuebra(
                proposta.descricao ||
                  os?.diagnosticoTecnico ||
                  os?.defeitoRelatado ||
                  '',
              )}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="items">
      <table>
        <thead>
          <tr>
            <th>ITEM</th>
            <th>DESCRIÇÃO</th>
            <th>QTD</th>
            <th>UNIT.</th>
            <th>TOTAL</th>
          </tr>
        </thead>

        <tbody>
          ${
            rows ||
            `
            <tr>
              <td>01</td>
              <td>Sem itens cadastrados</td>
              <td>0</td>
              <td>${moeda(0)}</td>
              <td>${moeda(0)}</td>
            </tr>
            `
          }
        </tbody>
      </table>
    </section>

    <div class="total">
      <div class="total-label">VALOR TOTAL</div>
      <div class="total-value">${moeda(proposta.valorTotal)}</div>
    </div>

    <p class="pay-note">
      * ${safe(proposta.condicoesPagamento || 'Valor à vista ou via transferência bancária.')}
    </p>

    <section class="notes">
      <div class="note">
        <h4>GARANTIA</h4>
        <p>${textoComQuebra(proposta.garantia || os?.garantia || '-')}</p>
      </div>

      <div class="note divider">
        <h4>OBSERVAÇÕES</h4>
        <p>${textoComQuebra(proposta.observacoes || '-')}</p>
      </div>
    </section>

    <div class="thanks">
      ${textoComQuebra(
        proposta.mensagemFinal ||
          os?.mensagemFinal ||
          'Agradecemos a confiança.',
      )}
    </div>

  </div>
</div>
</body>
</html>
`;
}