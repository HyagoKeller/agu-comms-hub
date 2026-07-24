import { useSyncExternalStore } from "react";
import type {
  Ativo, AuditoriaLog, AuthConfig, Contrato, CustoItem, OrdemServico, OSGlosaOverride,
  PerfilTemplate, PerfilUsuario, Permissoes, StatusOS, Unidade, WhatsappNumero,
} from "./types";
import { addDias, aplicaIAE } from "./imr";

interface State {
  ativos: Ativo[];
  unidades: Unidade[];
  custos: CustoItem[];
  logs: AuditoriaLog[];
  usuarios: PerfilUsuario[];
  whats: WhatsappNumero[];
  perfilTemplates: PerfilTemplate[];
  authConfig: AuthConfig;
  contratos: Contrato[];
  ordensServico: OrdemServico[];
}

const KEY = "agu-telefonia-v3";


const FULL: Permissoes = {
  verCadastro: true, editar: true, excluir: true,
  gerirCustos: true, importarBilhetagem: true,
  gerirUsuarios: true, gerirEstrutura: true, exportarRelatorios: true,
};
const READONLY: Permissoes = {
  verCadastro: true, editar: false, excluir: false,
  gerirCustos: false, importarBilhetagem: false,
  gerirUsuarios: false, gerirEstrutura: false, exportarRelatorios: true,
};

function seed(): State {
  const unidades: Unidade[] = [
    { id: "u1", nome: "Ed. Sede I - Setor de Autarquias Sul (SAS)", regiao: "R1", regiaoLabel: "SAD 1ª Região", estado: "Distrito Federal", cidade: "Brasília" },
    { id: "u2", nome: "SEDE 2", regiao: "R2", regiaoLabel: "SAD 2ª Região", estado: "Bahia", cidade: "Salvador" },
    { id: "u3", nome: "SEDE 3", regiao: "R3", regiaoLabel: "SAD 3ª Região", estado: "Rio de Janeiro", cidade: "Rio de Janeiro" },
    { id: "u4", nome: "PU - Procuradoria da União", regiao: "R4", regiaoLabel: "SAD 4ª Região", estado: "Santa Catarina", cidade: "Florianópolis" },
    { id: "u5", nome: "PF - Procuradoria Federal", regiao: "R5", regiaoLabel: "SAD 5ª Região", estado: "Ceará", cidade: "Fortaleza" },
    { id: "u6", nome: "PRF - Procuradoria Regional Federal", regiao: "R6", regiaoLabel: "SAD 6ª Região", estado: "Minas Gerais", cidade: "Belo Horizonte" },
  ];
  const ativos: Ativo[] = [
    { id: "a1", categoria: "PABX", identificador: "2101", tipo: "RAMAL_FISICO", catWhats: null, regiao: "R1", unidade: "Ed. Sede I - Setor de Autarquias Sul (SAS)", sala: "302", usuarioNome: "Mariana Souza", usuarioLogin: "mariana.souza@agu.gov.br", setor: "Procuradoria", dataAtribuicao: "2024-09-12", enderecoMac: "AC:DE:48:00:11:22", status: "ATIVO", statusMDM: "NA", statusTermo: "ASSINADO", criadoEm: "2024-09-12T10:00:00Z" },
    { id: "a2", categoria: "PABX", identificador: "2102", tipo: "SOFTPHONE", catWhats: null, regiao: "R3", unidade: "SEDE 3", sala: "104", usuarioNome: "João Lima", usuarioLogin: "joao.lima@agu.gov.br", setor: "Contencioso", dataAtribuicao: "2025-01-05", status: "ATIVO", statusMDM: "NA", statusTermo: "ASSINADO", criadoEm: "2025-01-05T10:00:00Z" },
    { id: "a3", categoria: "MOVEL", identificador: "+5561999110011", tipo: "CHIP_OPERADORA", catWhats: "MESSENGER_PESSOAL", regiao: "R3", unidade: "SEDE 3", usuarioNome: "Ana Beatriz", usuarioLogin: "ana.beatriz@agu.gov.br", setor: "Consultivo", dataAtribuicao: "2025-03-10", status: "ATIVO", statusMDM: "CONFORME", statusTermo: "ASSINADO", criadoEm: "2025-03-10T10:00:00Z" },
  ];
  const custos: CustoItem[] = [
    { id: "c1", tipo: "RAMAL_FISICO", valorMensal: 38.5, vigenciaInicio: "2024-01" },
    { id: "c2", tipo: "SOFTPHONE", valorMensal: 22.0, vigenciaInicio: "2024-01" },
    { id: "c3", tipo: "CHIP_OPERADORA", valorMensal: 71.9, vigenciaInicio: "2025-06" },
  ];
  const usuarios: PerfilUsuario[] = [
    { id: "us1", nome: "Admin AGU", email: "admin@agu.gov.br", perfil: "ADMIN_GERAL", regioes: ["R1","R2","R3","R4","R5","R6"], permissoes: FULL, mfaEnabled: false },
    { id: "us2", nome: "Gestora R3", email: "gestora.r3@agu.gov.br", perfil: "GESTOR_REGIONAL", regioes: ["R3"], permissoes: { ...FULL, excluir: false, gerirCustos: false, gerirUsuarios: false, gerirEstrutura: false } },
    { id: "us3", nome: "Auditor", email: "auditor@agu.gov.br", perfil: "AUDITOR", regioes: ["R1","R2","R3","R4","R5","R6"], permissoes: READONLY },
  ];
  const logs: AuditoriaLog[] = [];
  const whats: WhatsappNumero[] = [];
  const perfilTemplates: PerfilTemplate[] = [
    { id: "ADMIN_GERAL", label: "Administrador Geral", descricao: "Acesso irrestrito a todos os módulos.", permissoes: FULL },
    { id: "GESTOR_REGIONAL", label: "Gestor Regional", descricao: "Gerencia ativos da(s) sua(s) região(ões).", permissoes: { ...FULL, excluir: false, gerirCustos: false, gerirUsuarios: false, gerirEstrutura: false } },
    { id: "OPERADOR", label: "Operador", descricao: "Cadastro e atualização operacional.", permissoes: { ...FULL, excluir: false, gerirCustos: false, gerirUsuarios: false, gerirEstrutura: false, importarBilhetagem: false } },
    { id: "AUDITOR", label: "Auditor", descricao: "Somente leitura e exportação.", permissoes: READONLY },
  ];
  const authConfig: AuthConfig = {
    metodoPrimario: "LOCAL",
    mfaObrigatorioAdmin: true,
    mfaObrigatorioTodos: false,
    ad: {
      habilitado: false,
      dominio: "AGU.GOV.BR",
      servidor: "ldaps://dc.agu.gov.br:636",
      baseDN: "OU=Usuarios,DC=agu,DC=gov,DC=br",
      grupoAdmin: "CN=SGT-Admins,OU=Grupos,DC=agu,DC=gov,DC=br",
      usuarioServico: "svc-sgt@agu.gov.br",
    },
    m365: {
      habilitado: false,
      tenantId: "",
      clientId: "",
      clientSecretConfigurado: false,
      redirectUri: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "",
      escopos: "openid profile email User.Read",
    },
  };

  // Seed do Contrato STFC nº 12/2026 (TR item 1.1)
  const contratoSTFC: Contrato = {
    id: "ct1",
    numero: "12/2026",
    processoAdministrativo: "00400.001234/2025-99",
    uasg: "110061",
    orgaoContratante: "Advocacia-Geral da União",
    fornecedorRazaoSocial: "Operadora STFC S.A.",
    fornecedorCnpj: "00.000.000/0001-00",
    modalidade: "PREGAO",
    objeto: "Serviço Telefônico Fixo Comutado (STFC) via SIP Trunk, com 2.000 canais simultâneos e 9.000 ramais DDR distribuídos em 158 unidades da AGU.",
    itens: [
      { id: "ci1", item: "1", descricao: "Assinatura de tronco SIP (canal simultâneo)", catser: "26069", unidadeMedida: "Canal/mês", quantidade: 2000, valorUnitario: 12.50, valorMensal: 25000, valorTotal: 900000 },
      { id: "ci2", item: "2", descricao: "Ramal DDR (numeração)", catser: "26069", unidadeMedida: "Ramal/mês", quantidade: 9000, valorUnitario: 0.65, valorMensal: 5850, valorTotal: 210600 },
      { id: "ci3", item: "3", descricao: "Franquia de minutagem (local, DDD, móvel)", catser: "26077", unidadeMedida: "Verba/mês", quantidade: 36, valorUnitario: 122.28, valorMensal: 122.28, valorTotal: 4402.08 },
    ],
    vigenciaAssinatura: "2026-02-01",
    vigenciaInicio: "2026-02-15",
    vigenciaFim: "2029-02-14",
    prazoMeses: 36,
    prorrogavelAteAnos: 5,
    valorMensalTotal: 30972.28,
    valorAnualTotal: 371667.36,
    valorTotalPeriodo: 1115002.08,
    dotacao: {
      gestaoUnidade: "110061",
      fonte: "0100",
      programaTrabalho: "03.032.0032.2000",
      elementoDespesa: "339040",
      planoInterno: "SGT-AGU-2026",
      notaEmpenho: "2026NE000123",
    },
    garantia: {
      modalidade: "SEGURO_GARANTIA",
      percentual: 5,
      valor: 55750.10,
      vigenciaInicio: "2026-02-15",
      vigenciaFim: "2029-05-15",
      observacao: "Vigência = execução contratual + 90 dias.",
    },
    reajuste: {
      dataBaseOrcamento: "2025-10",
      indice: "IST-ANATEL",
      interregnoMeses: 12,
      proximoElegivelEm: "2026-10-01",
      historico: [],
    },
    fiscalizacao: {},
    anexos: [],
    status: "ATIVO",
    criadoEm: "2026-02-01T10:00:00Z",
  };

  return {
    ativos, unidades, custos, logs, usuarios, whats, perfilTemplates, authConfig,
    contratos: [contratoSTFC],
    ordensServico: [],
  };
}

let state: State = load();
const listeners = new Set<() => void>();

function load(): State {
  const def = seed();
  if (typeof window === "undefined") return def;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>;

      return {
        ...def,
        ...parsed,
        whats: parsed.whats ?? def.whats,
        perfilTemplates: parsed.perfilTemplates ?? def.perfilTemplates,
        authConfig: parsed.authConfig ?? def.authConfig,
        contratos: parsed.contratos ?? def.contratos,
        ordensServico: parsed.ordensServico ?? def.ordensServico,
      };

    }
  } catch {}
  try { localStorage.setItem(KEY, JSON.stringify(def)); } catch {}
  return def;
}

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  listeners.forEach((l) => l());
}

function setState(updater: (s: State) => State) {
  state = updater(state);
  persist();
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => selector(state),
    () => selector(state),
  );
}

export const store = {
  get: () => state,
  addAtivo(a: Ativo) {
    setState((s) => ({ ...s, ativos: [a, ...s.ativos] }));
    log({ modulo: "Inventário", acao: "CRIAR", registroId: a.id, depois: a as unknown as Record<string, unknown> });
  },
  bulkAddAtivos(items: Ativo[], origem: string) {
    if (!items.length) return;
    setState((s) => ({ ...s, ativos: [...items, ...s.ativos] }));
    log({ modulo: "Inventário", acao: "IMPORTAR", registroId: origem, depois: { quantidade: items.length, origem } });
  },
  bulkAddWhats(items: WhatsappNumero[], origem: string) {
    if (!items.length) return;
    setState((s) => ({ ...s, whats: [...items, ...s.whats] }));
    log({ modulo: "WhatsApp", acao: "IMPORTAR", registroId: origem, depois: { quantidade: items.length, origem } });
  },
  addWhats(w: WhatsappNumero) {
    setState((s) => ({ ...s, whats: [w, ...s.whats] }));
    log({ modulo: "WhatsApp", acao: "CRIAR", registroId: w.id, depois: w as unknown as Record<string, unknown> });
  },
  updateWhats(id: string, patch: Partial<WhatsappNumero>) {
    const antes = state.whats.find((x) => x.id === id);
    setState((s) => ({ ...s, whats: s.whats.map((x) => x.id === id ? { ...x, ...patch } : x) }));
    log({ modulo: "WhatsApp", acao: "EDITAR", registroId: id, antes: antes as unknown as Record<string, unknown>, depois: patch as Record<string, unknown> });
  },
  removeWhats(id: string) {
    const antes = state.whats.find((x) => x.id === id);
    setState((s) => ({ ...s, whats: s.whats.filter((x) => x.id !== id) }));
    log({ modulo: "WhatsApp", acao: "EXCLUIR", registroId: id, antes: antes as unknown as Record<string, unknown> });
  },
  updateAtivo(id: string, patch: Partial<Ativo>) {
    const antes = state.ativos.find((x) => x.id === id);
    setState((s) => ({ ...s, ativos: s.ativos.map((x) => x.id === id ? { ...x, ...patch } : x) }));
    log({ modulo: "Inventário", acao: "EDITAR", registroId: id, antes: antes as unknown as Record<string, unknown>, depois: patch as Record<string, unknown> });
  },
  removeAtivo(id: string) {
    const antes = state.ativos.find((x) => x.id === id);
    setState((s) => ({ ...s, ativos: s.ativos.filter((x) => x.id !== id) }));
    log({ modulo: "Inventário", acao: "EXCLUIR", registroId: id, antes: antes as unknown as Record<string, unknown> });
  },
  addCusto(c: CustoItem) {
    setState((s) => ({ ...s, custos: [c, ...s.custos] }));
    log({ modulo: "Custos", acao: "CRIAR", registroId: c.id, depois: c as unknown as Record<string, unknown> });
  },
  removeCusto(id: string) {
    const antes = state.custos.find((x) => x.id === id);
    setState((s) => ({ ...s, custos: s.custos.filter((x) => x.id !== id) }));
    log({ modulo: "Custos", acao: "EXCLUIR", registroId: id, antes: antes as unknown as Record<string, unknown> });
  },
  addUnidade(u: Unidade) {
    setState((s) => ({ ...s, unidades: [...s.unidades, u] }));
    log({ modulo: "Estrutura", acao: "CRIAR", registroId: u.id, depois: u as unknown as Record<string, unknown> });
  },
  bulkAddUnidades(items: Unidade[], origem: string) {
    if (!items.length) return;
    setState((s) => ({ ...s, unidades: [...s.unidades, ...items] }));
    log({ modulo: "Estrutura", acao: "IMPORTAR", registroId: origem, depois: { quantidade: items.length, origem } });
  },
  removeUnidade(id: string) {
    const antes = state.unidades.find((x) => x.id === id);
    setState((s) => ({ ...s, unidades: s.unidades.filter((x) => x.id !== id) }));
    log({ modulo: "Estrutura", acao: "EXCLUIR", registroId: id, antes: antes as unknown as Record<string, unknown> });
  },
  updatePerfilTemplate(id: string, permissoes: Permissoes) {
    const antes = state.perfilTemplates.find((t) => t.id === id);
    setState((s) => ({ ...s, perfilTemplates: s.perfilTemplates.map((t) => t.id === id ? { ...t, permissoes } : t) }));
    log({ modulo: "Administração", acao: "EDITAR", registroId: id, antes: antes as unknown as Record<string, unknown>, depois: { permissoes } });
  },
  updateUsuario(id: string, patch: Partial<PerfilUsuario>) {
    const antes = state.usuarios.find((u) => u.id === id);
    setState((s) => ({ ...s, usuarios: s.usuarios.map((u) => u.id === id ? { ...u, ...patch } : u) }));
    log({ modulo: "Usuários", acao: "EDITAR", registroId: id, antes: antes as unknown as Record<string, unknown>, depois: patch as Record<string, unknown> });
  },
  updateAuthConfig(patch: Partial<AuthConfig>) {
    const antes = state.authConfig;
    setState((s) => ({ ...s, authConfig: { ...s.authConfig, ...patch } }));
    log({ modulo: "Administração", acao: "EDITAR", registroId: "authConfig", antes: antes as unknown as Record<string, unknown>, depois: patch as Record<string, unknown> });
  },

  // ---------- Contratos ----------
  addContrato(c: Contrato) {
    setState((s) => ({ ...s, contratos: [c, ...s.contratos] }));
    log({ modulo: "Contratos", acao: "CRIAR", registroId: c.id, depois: c as unknown as Record<string, unknown> });
  },
  updateContrato(id: string, patch: Partial<Contrato>) {
    const antes = state.contratos.find((x) => x.id === id);
    setState((s) => ({ ...s, contratos: s.contratos.map((x) => x.id === id ? { ...x, ...patch } : x) }));
    log({ modulo: "Contratos", acao: "EDITAR", registroId: id, antes: antes as unknown as Record<string, unknown>, depois: patch as Record<string, unknown> });
  },
  addContratoAnexo(contratoId: string, anexo: Contrato["anexos"][number]) {
    setState((s) => ({ ...s, contratos: s.contratos.map((x) => x.id === contratoId ? { ...x, anexos: [anexo, ...x.anexos] } : x) }));
    log({ modulo: "Contratos", acao: "CRIAR", registroId: contratoId, depois: { anexo } as unknown as Record<string, unknown> });
  },

  // ---------- Ordens de Serviço + IAE ----------
  addOS(input: Omit<OrdemServico, "id" | "numero" | "dataEmissao" | "dataLimite" | "status" | "criadoEm">) {
    const dataEmissao = new Date().toISOString();
    const dataLimite = addDias(dataEmissao, input.prazoDias);
    const seq = state.ordensServico.length + 1;
    const os: OrdemServico = {
      ...input,
      id: uid("os"),
      numero: `OS-${String(seq).padStart(4, "0")}`,
      dataEmissao,
      dataLimite,
      status: "ABERTA",
      criadoEm: dataEmissao,
    };
    setState((s) => ({ ...s, ordensServico: [os, ...s.ordensServico] }));
    log({ modulo: "OrdensServico", acao: "CRIAR", registroId: os.id, depois: os as unknown as Record<string, unknown> });
    return os;
  },
  moverOS(id: string, novoStatus: StatusOS) {
    const antes = state.ordensServico.find((o) => o.id === id);
    if (!antes) return;
    const patch: Partial<OrdemServico> = { status: novoStatus };
    // Ao entrar em execução, marca timestamp automático.
    if (novoStatus === "EM_EXECUCAO" && !antes.dataInicioExecucao) {
      patch.dataInicioExecucao = new Date().toISOString();
    }
    // Ao passar para recebimento provisório, aplica IAE se ainda não concluída.
    if (novoStatus === "RECEBIMENTO_PROVISORIO" && !antes.dataConclusao) {
      Object.assign(patch, aplicaIAE(antes, new Date().toISOString()));
    }
    setState((s) => ({ ...s, ordensServico: s.ordensServico.map((o) => o.id === id ? { ...o, ...patch } : o) }));
    log({ modulo: "OrdensServico", acao: "EDITAR", registroId: id, antes: { status: antes.status } as Record<string, unknown>, depois: patch as Record<string, unknown> });
  },
  concluirOS(id: string) {
    const antes = state.ordensServico.find((o) => o.id === id);
    if (!antes) return;
    const patch = { ...aplicaIAE(antes, new Date().toISOString()), status: "RECEBIMENTO_PROVISORIO" as StatusOS };
    setState((s) => ({ ...s, ordensServico: s.ordensServico.map((o) => o.id === id ? { ...o, ...patch } : o) }));
    log({ modulo: "OrdensServico", acao: "EDITAR", registroId: id, antes: { status: antes.status } as Record<string, unknown>, depois: patch as unknown as Record<string, unknown> });
  },
  overrideGlosaOS(id: string, override: OSGlosaOverride) {
    const antes = state.ordensServico.find((o) => o.id === id);
    if (!antes) return;
    const patch: Partial<OrdemServico> = { override, glosaFinal: override.valorAjustado };
    setState((s) => ({ ...s, ordensServico: s.ordensServico.map((o) => o.id === id ? { ...o, ...patch } : o) }));
    log({ modulo: "OrdensServico", acao: "EDITAR", registroId: id, antes: { glosaFinal: antes.glosaFinal } as Record<string, unknown>, depois: patch as Record<string, unknown> });
  },

  reset() {
    state = seed();
    persist();
  },
};


function log(entry: Omit<AuditoriaLog, "id" | "ts" | "ator">) {
  let ator = "sistema@agu.gov.br";
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("agu-auth-v1") : null;
    if (raw) {
      const u = JSON.parse(raw) as { email?: string };
      if (u?.email) ator = u.email;
    }
  } catch {}
  const full: AuditoriaLog = {
    id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    ator,
    ...entry,
  };
  setState((s) => ({ ...s, logs: [full, ...s.logs] }));
}

export function uid(prefix = ""): string {
  return prefix + crypto.randomUUID().slice(0, 8);
}
