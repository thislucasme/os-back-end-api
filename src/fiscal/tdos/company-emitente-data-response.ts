export interface FiscalService {
  id: string;
  companyUid: string;
  nome: string;
  cTribNac: string;
  cTribNacDescricao: string;
  cNBS: string;
  cNBSDescricao: string;
  descricaoServico: string;
  possuiNaoTributacao: string;
  motivoNaoTributacao: string | null;
  tipoImunidade: string | null;
  aliquotaIss: string;
  percentualTributosSimples: string;
  percentualTributosFederal: string;
  percentualTributosEstadual: string;
  percentualTributosMunicipal: string;
  situacaoTributariaPisCofins: string;
  aliquotaInssRetido: string;
  aliquotaIrRetido: string;
}

export interface CompanyResponse {
  id: string;
  uid: string;
  name: string;
  corporateName: string;
  cnpj: string;
  companyEmail: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  observations: string;
  logoUrl: string;
  apiToken?: string;
  webHookToken?: string;
  companyUid: string;
  opcaoSimplesNacional?: string;
  regimeApuracaoSimplesNacional?: string;
  regimeEspecialTributacao?: string;
  inscricaoMunicipal?: string;
  codigoMunicipio?: string;
  municipioNome?: string;
  ambiente?: string;
  serieDps?: string;
  serie?: string;
  fiscalServices: FiscalService[];
  [key: string]: any;
}