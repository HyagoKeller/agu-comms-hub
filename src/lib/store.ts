import { useSyncExternalStore } from "react";
import type {
  Ativo, AuditoriaLog, AuthConfig, CustoItem, PerfilTemplate, PerfilUsuario,
  Permissoes, Unidade, WhatsappNumero,
} from "./types";

interface State {
  ativos: Ativo[];
  unidades: Unidade[];
  custos: CustoItem[];
  logs: AuditoriaLog[];
  usuarios: PerfilUsuario[];
  whats: WhatsappNumero[];
  perfilTemplates: PerfilTemplate[];
  authConfig: AuthConfig;
}

const KEY = "agu-telefonia-v2";

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
  return { ativos, unidades, custos, logs, usuarios, whats, perfilTemplates, authConfig };
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
