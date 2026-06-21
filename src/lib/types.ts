export type Regiao = "R1" | "R2" | "R3" | "R4" | "R5" | "R6";
export const REGIOES: Regiao[] = ["R1", "R2", "R3", "R4", "R5", "R6"];

export const REGIAO_LABELS: Record<Regiao, string> = {
  R1: "SAD 1ª Região",
  R2: "SAD 2ª Região",
  R3: "SAD 3ª Região",
  R4: "SAD 4ª Região",
  R5: "SAD 5ª Região",
  R6: "SAD 6ª Região",
};

export type AtivoTipo =
  | "RAMAL_FISICO"
  | "SOFTPHONE"
  | "CHIP_OPERADORA";

export const TIPOS_ATIVO: { value: AtivoTipo; label: string; categoria: "PABX" | "MOVEL" }[] = [
  { value: "RAMAL_FISICO", label: "Aparelho Físico Tipo 1", categoria: "PABX" },
  { value: "SOFTPHONE", label: "Softphone", categoria: "PABX" },
  { value: "CHIP_OPERADORA", label: "Chip Operadora (Móvel)", categoria: "MOVEL" },
];

export type CategoriaWhats = "MESSENGER_PESSOAL" | "WABA_INSTITUCIONAL" | null;

export type StatusOperacional =
  | "ATIVO"
  | "DISPONIVEL"
  | "MANUTENCAO"
  | "BLOQUEADO"
  | "INATIVO";

export type StatusMDM = "CONFORME" | "NAO_SINCRONIZADO" | "VIOLACAO" | "NA";
export type StatusTermo = "ASSINADO" | "PENDENTE" | "NA";

export interface Ativo {
  id: string;
  categoria: "PABX" | "MOVEL";
  identificador: string;
  tipo: AtivoTipo;
  catWhats: CategoriaWhats;
  regiao: Regiao;
  unidade: string;
  sala?: string;
  usuarioNome?: string;
  usuarioLogin?: string;
  setor?: string;
  dataAtribuicao?: string;
  enderecoMac?: string;
  status: StatusOperacional;
  statusMDM: StatusMDM;
  statusTermo: StatusTermo;
  observacoes?: string;
  anexos?: string[];
  dominio?: string;
  ip?: string;
  modeloAparelho?: string;
  fabricante?: string;
  permissaoChamada?: string;
  hotdesking?: string;
  origemImport?: string;
  protocoloAGUServicos?: string; // nº do chamado/protocolo no ITSM AGU Serviços
  criadoEm: string;
}

export interface Unidade {
  id: string;
  nome: string;            // "PU - Procuradoria da União"
  regiao: Regiao;          // R1..R6
  regiaoLabel?: string;    // "SAD 4ª Região"
  estado?: string;         // "Santa Catarina"
  cidade?: string;         // "Florianópolis"
}

export interface CustoItem {
  id: string;
  tipo: AtivoTipo;
  valorMensal: number;
  vigenciaInicio: string;
  vigenciaFim?: string;
}

export interface AuditoriaLog {
  id: string;
  ts: string;
  ator: string;
  modulo: string;
  acao: "CRIAR" | "EDITAR" | "EXCLUIR" | "IMPORTAR" | "EXPORTAR";
  registroId?: string;
  antes?: Record<string, unknown>;
  depois?: Record<string, unknown>;
}

export type WhatsCategoria = "MESSENGER_PESSOAL" | "WABA_INSTITUCIONAL" | "BUSINESS_APP";

export interface WhatsappNumero {
  id: string;
  msisdn: string;
  operadora?: string;
  plano?: string;
  categoria: WhatsCategoria;
  responsavelNome?: string;
  responsavelLogin?: string;
  setor?: string;
  regiao: Regiao;
  unidade: string;
  imei?: string;
  statusMDM: StatusMDM;
  statusTermo: StatusTermo;
  status: StatusOperacional;
  dataAtivacao?: string;
  observacoes?: string;
  criadoEm: string;
}

export type PerfilTipo = "ADMIN_GERAL" | "GESTOR_REGIONAL" | "OPERADOR" | "AUDITOR";

export interface Permissoes {
  verCadastro: boolean;
  editar: boolean;
  excluir: boolean;
  gerirCustos: boolean;
  importarBilhetagem: boolean;
  gerirUsuarios: boolean;
  gerirEstrutura: boolean;
  exportarRelatorios: boolean;
}

export interface PerfilTemplate {
  id: PerfilTipo;
  label: string;
  descricao: string;
  permissoes: Permissoes;
}

export interface PerfilUsuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilTipo;
  regioes: Regiao[];
  permissoes: Permissoes;
  mfaEnabled?: boolean;
  mfaSecret?: string;
}

export interface AuthConfig {
  metodoPrimario: "LOCAL" | "AD" | "M365";
  mfaObrigatorioAdmin: boolean;
  mfaObrigatorioTodos: boolean;
  ad: {
    habilitado: boolean;
    dominio: string;        // ex.: AGU.GOV.BR
    servidor: string;       // ldap://dc.agu.gov.br
    baseDN: string;         // OU=Usuarios,DC=agu,DC=gov,DC=br
    grupoAdmin: string;     // CN=SGT-Admins
    usuarioServico: string;
  };
  m365: {
    habilitado: boolean;
    tenantId: string;
    clientId: string;
    clientSecretConfigurado: boolean;
    redirectUri: string;
    escopos: string;        // "openid profile email"
  };
}

export const PERM_LABELS: Record<keyof Permissoes, string> = {
  verCadastro: "Ver Cadastro",
  editar: "Editar",
  excluir: "Excluir",
  gerirCustos: "Gerir Custos",
  importarBilhetagem: "Importar Bilhetagem",
  gerirUsuarios: "Gerir Usuários",
  gerirEstrutura: "Gerir Estrutura",
  exportarRelatorios: "Exportar Relatórios",
};

export const PERFIL_LABELS: Record<PerfilTipo, string> = {
  ADMIN_GERAL: "Administrador Geral",
  GESTOR_REGIONAL: "Gestor Regional",
  OPERADOR: "Operador",
  AUDITOR: "Auditor",
};
