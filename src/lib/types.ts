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
  unidades?: string[]; // escopo opcional por unidade (granular). Vazio/undefined = todas da(s) região(ões).
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

// =====================================================
// Contratos (Fase 1) — Lei 14.133/2021 + STFC 12/2026
// =====================================================

export type ContratoStatus = "ATIVO" | "SUSPENSO" | "ENCERRADO";

export interface ContratoItem {
  id: string;
  grupo?: string;
  item: string;                 // ex.: "1"
  descricao: string;            // ex.: "Serviço Telefônico Fixo Comutado — SIP Trunk"
  catser?: string;
  unidadeMedida: string;        // ex.: "Canal", "Ramal DDR", "Mês"
  quantidade: number;
  valorUnitario: number;
  valorMensal: number;
  valorTotal: number;
}

export type GarantiaModalidade =
  | "CAUCAO"
  | "SEGURO_GARANTIA"
  | "FIANCA_BANCARIA"
  | "TITULO_CAPITALIZACAO";

export interface ContratoGarantia {
  modalidade: GarantiaModalidade;
  percentual: number;
  valor: number;
  vigenciaInicio: string;   // YYYY-MM-DD
  vigenciaFim: string;      // YYYY-MM-DD (execução + 90 dias)
  observacao?: string;
}

export interface ContratoReajuste {
  dataBaseOrcamento: string;    // YYYY-MM
  indice: string;               // ex.: "IST-ANATEL"
  interregnoMeses: number;      // 12
  proximoElegivelEm?: string;   // YYYY-MM-DD (calculado)
  historico: { data: string; percentual: number; observacao?: string }[];
}

export interface ContratoFiscalizacao {
  gestorContratoId?: string;    // referência a PerfilUsuario.id
  fiscalTecnicoId?: string;
  fiscalAdministrativoId?: string;
  fiscalSetorialId?: string;
}

export interface ContratoAnexo {
  id: string;
  nome: string;                 // "Contrato assinado.pdf"
  tipo: "TR" | "CONTRATO" | "APOLICE" | "OUTRO";
  tamanhoBytes?: number;
  uploadedAt: string;
  observacao?: string;
}

export interface Contrato {
  id: string;
  numero: string;               // "12/2026"
  processoAdministrativo: string;
  uasg?: string;
  orgaoContratante: string;     // "Advocacia-Geral da União"
  fornecedorRazaoSocial: string;
  fornecedorCnpj: string;
  modalidade: "PREGAO" | "SRP" | "DISPENSA" | "INEXIGIBILIDADE" | "OUTRO";
  objeto: string;
  itens: ContratoItem[];
  vigenciaAssinatura: string;   // YYYY-MM-DD
  vigenciaInicio: string;
  vigenciaFim: string;
  prazoMeses: number;           // 36
  prorrogavelAteAnos: number;   // 5 (padrão Lei 14.133)
  valorMensalTotal: number;
  valorAnualTotal: number;
  valorTotalPeriodo: number;
  dotacao?: {
    gestaoUnidade?: string;
    fonte?: string;
    programaTrabalho?: string;
    elementoDespesa?: string;
    planoInterno?: string;
    notaEmpenho?: string;
  };
  garantia?: ContratoGarantia;
  reajuste?: ContratoReajuste;
  fiscalizacao: ContratoFiscalizacao;
  anexos: ContratoAnexo[];
  status: ContratoStatus;
  criadoEm: string;
}

// =====================================================
// Ordens de Serviço (Fase 2.1) e cálculo IAE (2.2)
// =====================================================

export type TipoOS =
  | "INSTALACAO"
  | "PORTABILIDADE"
  | "MANUTENCAO_CORRETIVA"
  | "ENTREGA_RELATORIO"
  | "OUTRO";

export const TIPOS_OS: { value: TipoOS; label: string; tcePadraoDias: number }[] = [
  { value: "INSTALACAO", label: "Instalação", tcePadraoDias: 30 },
  { value: "PORTABILIDADE", label: "Portabilidade Numérica", tcePadraoDias: 60 },
  { value: "MANUTENCAO_CORRETIVA", label: "Manutenção Corretiva", tcePadraoDias: 5 },
  { value: "ENTREGA_RELATORIO", label: "Entrega de Relatório", tcePadraoDias: 15 },
  { value: "OUTRO", label: "Outro", tcePadraoDias: 15 },
];

export type StatusOS =
  | "ABERTA"
  | "EM_EXECUCAO"
  | "RECEBIMENTO_PROVISORIO"
  | "RECEBIMENTO_DEFINITIVO"
  | "FATURADA"
  | "CANCELADA";

export const STATUS_OS_LABELS: Record<StatusOS, string> = {
  ABERTA: "Aberta",
  EM_EXECUCAO: "Em execução",
  RECEBIMENTO_PROVISORIO: "Recebimento provisório",
  RECEBIMENTO_DEFINITIVO: "Recebimento definitivo",
  FATURADA: "Faturada",
  CANCELADA: "Cancelada",
};

export interface OSGlosaOverride {
  valorOriginal: number;
  valorAjustado: number;
  justificativa: string;
  ator: string;
  ts: string;
}

export interface OrdemServico {
  id: string;
  numero: string;                 // sequencial, ex.: "OS-0001"
  contratoId: string;
  tipo: TipoOS;
  descricao: string;
  unidadesAlvo: string[];         // nomes das unidades
  regiao?: Regiao;
  fiscalRequisitanteId?: string;
  gestorContratoId?: string;
  dataEmissao: string;            // ISO — automático na criação
  prazoDias: number;              // TCE
  dataLimite: string;             // YYYY-MM-DD (calculado: dataEmissao + prazoDias)
  dataInicioExecucao?: string;    // ISO — ao mover para EM_EXECUCAO
  dataConclusao?: string;         // ISO — TEC, automático ao concluir
  status: StatusOS;
  valorOS: number;                // base de cálculo da glosa (R$)
  iaeDias?: number;               // calculado
  glosaCalculada?: number;        // R$
  glosaFinal?: number;            // R$ (após override)
  override?: OSGlosaOverride;
  observacoes?: string;
  criadoEm: string;
}

