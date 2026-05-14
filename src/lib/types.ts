export type Regiao = "R1" | "R2" | "R3" | "R4" | "R5" | "R6";
export const REGIOES: Regiao[] = ["R1", "R2", "R3", "R4", "R5", "R6"];

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
  identificador: string; // ramal ou MSISDN
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
  criadoEm: string;
}

export interface Unidade {
  id: string;
  nome: string;
  regiao: Regiao;
}

export interface CustoItem {
  id: string;
  tipo: AtivoTipo;
  valorMensal: number;
  vigenciaInicio: string; // YYYY-MM
  vigenciaFim?: string;   // YYYY-MM
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
  msisdn: string;             // ex: +5561999110011
  operadora?: string;         // Vivo / Claro / Tim / Oi
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

export interface PerfilUsuario {
  id: string;
  nome: string;
  email: string;
  perfil: "ADMIN_GERAL" | "GESTOR_REGIONAL" | "OPERADOR" | "AUDITOR";
  regioes: Regiao[];
  permissoes: {
    verCadastro: boolean;
    editar: boolean;
    excluir: boolean;
    gerirCustos: boolean;
    importarBilhetagem: boolean;
  };
}
