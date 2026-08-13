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

export type AtivoTipo = "RAMAL_FISICO" | "SOFTPHONE" | "CHIP_OPERADORA";

export const TIPOS_ATIVO: { value: AtivoTipo; label: string; categoria: "PABX" | "MOVEL" }[] = [
  { value: "RAMAL_FISICO", label: "Aparelho Físico Tipo 1", categoria: "PABX" },
  { value: "SOFTPHONE", label: "Softphone", categoria: "PABX" },
  { value: "CHIP_OPERADORA", label: "Chip Operadora (Móvel)", categoria: "MOVEL" },
];

export type CategoriaWhats = "MESSENGER_PESSOAL" | "WABA_INSTITUCIONAL" | null;

export type StatusOperacional = "ATIVO" | "DISPONIVEL" | "MANUTENCAO" | "BLOQUEADO" | "INATIVO";
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
  unidadeId?: string;
  faixaDdrValidada?: boolean;
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
  protocoloAGUServicos?: string;
  criadoEm: string;
}

export type EtapaPortabilidade = "NAO_INICIADA" | "E1" | "E2" | "E3" | "CONCLUIDA";
export const ETAPAS_PORT: { value: EtapaPortabilidade; label: string }[] = [
  { value: "NAO_INICIADA", label: "Não iniciada" },
  { value: "E1", label: "Etapa 1 - Levantamento" },
  { value: "E2", label: "Etapa 2 - Solicitação ANATEL" },
  { value: "E3", label: "Etapa 3 - Ativação" },
  { value: "CONCLUIDA", label: "Concluída" },
];

export interface FaixaDDR {
  id: string;
  unidadeId: string;
  prefixo: string;    // ex.: "2027"
  faixaInicio: string; // ex.: "0000"
  faixaFim: string;    // ex.: "0099"
  totalRamais: number;
  observacao?: string;
}

export interface Unidade {
  id: string;
  nome: string;
  regiao: Regiao;
  regiaoLabel?: string;
  estado?: string;
  cidade?: string;
  endereco?: string;
  cep?: string;
  ddd?: string;
  troncoPrincipal?: string;
  totalRamaisPlanejados?: number;
  portabilidade?: EtapaPortabilidade;
  portabilidadeAtualizadaEm?: string;
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

export type PerfilTipo =
  | "ADMIN_GERAL"
  | "GESTOR_REGIONAL"
  | "OPERADOR"
  | "AUDITOR"
  | "GESTOR_CONTRATO"
  | "FISCAL_TECNICO"
  | "FISCAL_ADMINISTRATIVO";

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
  unidades?: string[];
  contratosVinculados?: string[]; // ids de contratos que fiscaliza
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
    dominio: string;
    servidor: string;
    baseDN: string;
    grupoAdmin: string;
    usuarioServico: string;
  };
  m365: {
    habilitado: boolean;
    tenantId: string;
    clientId: string;
    clientSecretConfigurado: boolean;
    redirectUri: string;
    escopos: string;
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
  GESTOR_CONTRATO: "Gestor do Contrato",
  FISCAL_TECNICO: "Fiscal Técnico",
  FISCAL_ADMINISTRATIVO: "Fiscal Administrativo",
};

// =====================================================
// Contratos (Fase 1)
// =====================================================

export type ContratoStatus = "ATIVO" | "SUSPENSO" | "ENCERRADO";

export interface ContratoItem {
  id: string;
  grupo?: string;
  item: string;
  descricao: string;
  catser?: string;
  unidadeMedida: string;
  quantidade: number;
  valorUnitario: number;
  valorMensal: number;
  valorTotal: number;
}

export type GarantiaModalidade = "CAUCAO" | "SEGURO_GARANTIA" | "FIANCA_BANCARIA" | "TITULO_CAPITALIZACAO";

export interface ContratoGarantia {
  modalidade: GarantiaModalidade;
  percentual: number;
  valor: number;
  vigenciaInicio: string;
  vigenciaFim: string;
  observacao?: string;
}

export interface ContratoReajuste {
  dataBaseOrcamento: string;
  indice: string;
  interregnoMeses: number;
  proximoElegivelEm?: string;
  historico: { data: string; percentual: number; observacao?: string }[];
}

export interface ContratoFiscalizacao {
  gestorContratoId?: string;
  fiscalTecnicoId?: string;
  fiscalAdministrativoId?: string;
  fiscalSetorialId?: string;
}

export interface ContratoAnexo {
  id: string;
  nome: string;
  tipo: "TR" | "CONTRATO" | "APOLICE" | "OUTRO";
  tamanhoBytes?: number;
  uploadedAt: string;
  observacao?: string;
}

export interface Contrato {
  id: string;
  numero: string;
  processoAdministrativo: string;
  uasg?: string;
  orgaoContratante: string;
  fornecedorRazaoSocial: string;
  fornecedorCnpj: string;
  modalidade: "PREGAO" | "SRP" | "DISPENSA" | "INEXIGIBILIDADE" | "OUTRO";
  objeto: string;
  itens: ContratoItem[];
  vigenciaAssinatura: string;
  vigenciaInicio: string;
  vigenciaFim: string;
  prazoMeses: number;
  prorrogavelAteAnos: number;
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
  numero: string;
  contratoId: string;
  tipo: TipoOS;
  descricao: string;
  unidadesAlvo: string[];
  regiao?: Regiao;
  fiscalRequisitanteId?: string;
  gestorContratoId?: string;
  dataEmissao: string;
  prazoDias: number;
  dataLimite: string;
  dataInicioExecucao?: string;
  dataConclusao?: string;
  status: StatusOS;
  valorOS: number;
  iaeDias?: number;
  glosaCalculada?: number;
  glosaFinal?: number;
  override?: OSGlosaOverride;
  observacoes?: string;
  criadoEm: string;
}

// =====================================================
// Fase 2.3 - Chamados Técnicos e IST
// =====================================================

export type SeveridadeChamado = "S1" | "S2" | "S3" | "S4" | "S5";

/** Prazos exatos do TR (item 7.1.3 - IST) - em horas. */
export const SEVERIDADES: {
  value: SeveridadeChamado;
  label: string;
  prazoRespostaH: number;
  prazoSolucaoH: number;
  penalidadeHoraPct: number; // % do valor mensal da OS por hora de atraso
}[] = [
  { value: "S1", label: "S1 - Crítica (indisponibilidade total)", prazoRespostaH: 0.5, prazoSolucaoH: 4,   penalidadeHoraPct: 0.5 },
  { value: "S2", label: "S2 - Alta (múltiplos usuários afetados)", prazoRespostaH: 1,   prazoSolucaoH: 8,   penalidadeHoraPct: 0.3 },
  { value: "S3", label: "S3 - Média (usuário isolado)",             prazoRespostaH: 2,   prazoSolucaoH: 24,  penalidadeHoraPct: 0.1 },
  { value: "S4", label: "S4 - Baixa (impacto reduzido)",            prazoRespostaH: 4,   prazoSolucaoH: 48,  penalidadeHoraPct: 0.05 },
  { value: "S5", label: "S5 - Informativa / solicitação",           prazoRespostaH: 8,   prazoSolucaoH: 120, penalidadeHoraPct: 0.02 },
];

export type StatusChamado = "ABERTO" | "RESPONDIDO" | "SOLUCIONADO" | "CANCELADO";

export interface ChamadoTecnico {
  id: string;
  numero: string;               // CH-0001
  contratoId: string;
  osId?: string;                // vínculo com OS (opcional)
  severidade: SeveridadeChamado;
  unidade: string;
  regiao?: Regiao;
  fiscalId?: string;
  titulo: string;
  descricao: string;
  valorMensalOS: number;        // base para cálculo IST
  abertoEm: string;             // ISO - automático
  respondidoEm?: string;        // ISO - automático ao marcar
  solucionadoEm?: string;       // ISO - automático ao marcar
  status: StatusChamado;
  conforme?: boolean;           // resultado do SLA (após solução)
  glosaIST?: number;            // penalidade calculada em R$
  observacoes?: string;
  criadoEm: string;
}

// =====================================================
// Fase 2.4 - IAR (Relatório Semestral)
// =====================================================

export type StatusIAR = "PENDENTE" | "ENTREGUE" | "ATRASADO" | "INEXECUCAO";

export interface RelatorioIAR {
  id: string;
  contratoId: string;
  periodo: string;             // "2026-S1" / "2026-S2"
  prazoEntrega: string;        // YYYY-MM-DD
  dataUpload?: string;         // ISO - automático
  arquivoNome?: string;
  arquivoTamanhoBytes?: number;
  totalChamadas?: number;
  troncosCobertos?: number;
  ramaisCobertos?: number;
  valorMensalReferencia: number; // base da glosa IAR
  diasUteisAtraso?: number;
  glosaIAR?: number;             // R$
  percentualGlosa?: number;      // %, teto 10%
  status: StatusIAR;
  observacoes?: string;
  criadoEm: string;
}

// =====================================================
// Fase 4 - Sanções
// =====================================================

export type TipoSancao =
  | "ADVERTENCIA"
  | "MULTA_MORATORIA"
  | "MULTA_COMPENSATORIA"
  | "IMPEDIMENTO_LICITAR"
  | "DECLARACAO_INIDONEIDADE";

export const TIPOS_SANCAO: { value: TipoSancao; label: string }[] = [
  { value: "ADVERTENCIA",            label: "Advertência" },
  { value: "MULTA_MORATORIA",        label: "Multa moratória" },
  { value: "MULTA_COMPENSATORIA",    label: "Multa compensatória" },
  { value: "IMPEDIMENTO_LICITAR",    label: "Impedimento de licitar/contratar" },
  { value: "DECLARACAO_INIDONEIDADE",label: "Declaração de inidoneidade" },
];

export type StatusSancao = "EM_DEFESA" | "APLICADA" | "RECORRIDA" | "CANCELADA";

export interface Sancao {
  id: string;
  numero: string;                 // SAN-0001
  contratoId: string;
  tipo: TipoSancao;
  infracaoAlinea: string;         // ex.: "a", "b" (item 8.1 TR)
  descricao: string;
  processoAdministrativo?: string;
  valor?: number;
  dataAbertura: string;           // ISO automática
  dataAplicacao?: string;
  status: StatusSancao;
  observacoes?: string;
  criadoEm: string;
}

// ---------- Glosas lançadas manualmente pela fiscalização ----------
export type OrigemGlosa = "IAE" | "IST" | "IAR" | "IDT" | "OUTRA";

export const ORIGENS_GLOSA: { value: OrigemGlosa; label: string }[] = [
  { value: "IAE", label: "IAE - Atraso na execução de OS" },
  { value: "IST", label: "IST - Solução de chamado técnico" },
  { value: "IAR", label: "IAR - Relatório semestral" },
  { value: "IDT", label: "IDT - Disponibilidade do tronco/serviço" },
  { value: "OUTRA", label: "Outra ocorrência contratual" },
];

export type StatusGlosaManual = "LANCADA" | "HOMOLOGADA" | "CANCELADA";

export interface GlosaManual {
  id: string;
  numero: string;
  contratoId: string;
  origem: OrigemGlosa;
  competencia: string; // AAAA-MM
  referencia?: string; // nº da OS, chamado, unidade etc.
  descricao: string;
  valor: number;
  baseCalculo?: string;
  status: StatusGlosaManual;
  registradoPor: string;
  registradoEm: string;
  homologadoPor?: string;
  homologadoEm?: string;
}
