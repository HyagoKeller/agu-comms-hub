import { useSyncExternalStore } from "react";
import type { Ativo, AuditoriaLog, CustoItem, PerfilUsuario, Unidade } from "./types";

interface State {
  ativos: Ativo[];
  unidades: Unidade[];
  custos: CustoItem[];
  logs: AuditoriaLog[];
  usuarios: PerfilUsuario[];
}

const KEY = "agu-telefonia-v1";

function seed(): State {
  const unidades: Unidade[] = [
    { id: "u1", nome: "SEDE 1", regiao: "R1" },
    { id: "u2", nome: "SEDE 2", regiao: "R2" },
    { id: "u3", nome: "SEDE 3", regiao: "R3" },
    { id: "u4", nome: "PRU 4", regiao: "R4" },
    { id: "u5", nome: "PRU 5", regiao: "R5" },
    { id: "u6", nome: "PRU 6", regiao: "R6" },
  ];
  const ativos: Ativo[] = [
    {
      id: "a1", categoria: "PABX", identificador: "2101", tipo: "RAMAL_FISICO", catWhats: null,
      regiao: "R1", unidade: "SEDE 1", sala: "302",
      usuarioNome: "Mariana Souza", usuarioLogin: "mariana.souza@agu.gov.br", setor: "Procuradoria",
      dataAtribuicao: "2024-09-12", enderecoMac: "AC:DE:48:00:11:22",
      status: "ATIVO", statusMDM: "NA", statusTermo: "ASSINADO",
      observacoes: "", anexos: [], criadoEm: "2024-09-12T10:00:00Z",
    },
    {
      id: "a2", categoria: "PABX", identificador: "2102", tipo: "SOFTPHONE", catWhats: null,
      regiao: "R3", unidade: "SEDE 3", sala: "104",
      usuarioNome: "João Lima", usuarioLogin: "joao.lima@agu.gov.br", setor: "Contencioso",
      dataAtribuicao: "2025-01-05",
      status: "ATIVO", statusMDM: "NA", statusTermo: "ASSINADO",
      criadoEm: "2025-01-05T10:00:00Z",
    },
    {
      id: "a3", categoria: "MOVEL", identificador: "+5561999110011", tipo: "CHIP_OPERADORA",
      catWhats: "MESSENGER_PESSOAL",
      regiao: "R3", unidade: "SEDE 3",
      usuarioNome: "Ana Beatriz", usuarioLogin: "ana.beatriz@agu.gov.br", setor: "Consultivo",
      dataAtribuicao: "2025-03-10",
      status: "ATIVO", statusMDM: "CONFORME", statusTermo: "ASSINADO",
      observacoes: "Linha funcional com WhatsApp Messenger.",
      criadoEm: "2025-03-10T10:00:00Z",
    },
    {
      id: "a4", categoria: "MOVEL", identificador: "+5511988221122", tipo: "CHIP_OPERADORA",
      catWhats: "MESSENGER_PESSOAL",
      regiao: "R2", unidade: "SEDE 2",
      usuarioNome: "Carlos Mendes", usuarioLogin: "carlos.mendes@agu.gov.br", setor: "Procuradoria",
      dataAtribuicao: "2025-04-18",
      status: "ATIVO", statusMDM: "VIOLACAO", statusTermo: "PENDENTE",
      observacoes: "Detectado WhatsApp Business ativo — abrir chamado.",
      criadoEm: "2025-04-18T10:00:00Z",
    },
    {
      id: "a5", categoria: "PABX", identificador: "4501", tipo: "RAMAL_FISICO", catWhats: null,
      regiao: "R5", unidade: "PRU 5", sala: "208",
      status: "DISPONIVEL", statusMDM: "NA", statusTermo: "NA",
      enderecoMac: "AC:DE:48:11:22:33",
      criadoEm: "2025-02-01T10:00:00Z",
    },
  ];
  const custos: CustoItem[] = [
    { id: "c1", tipo: "RAMAL_FISICO", valorMensal: 38.50, vigenciaInicio: "2024-01" },
    { id: "c2", tipo: "SOFTPHONE", valorMensal: 22.00, vigenciaInicio: "2024-01" },
    { id: "c3", tipo: "CHIP_OPERADORA", valorMensal: 65.00, vigenciaInicio: "2024-01", vigenciaFim: "2025-05" },
    { id: "c4", tipo: "CHIP_OPERADORA", valorMensal: 71.90, vigenciaInicio: "2025-06" },
  ];
  const usuarios: PerfilUsuario[] = [
    {
      id: "us1", nome: "Admin AGU", email: "admin@agu.gov.br", perfil: "ADMIN_GERAL",
      regioes: ["R1", "R2", "R3", "R4", "R5", "R6"],
      permissoes: { verCadastro: true, editar: true, excluir: true, gerirCustos: true, importarBilhetagem: true },
    },
    {
      id: "us2", nome: "Gestora R3", email: "gestora.r3@agu.gov.br", perfil: "GESTOR_REGIONAL",
      regioes: ["R3"],
      permissoes: { verCadastro: true, editar: true, excluir: false, gerirCustos: false, importarBilhetagem: true },
    },
    {
      id: "us3", nome: "Auditor", email: "auditor@agu.gov.br", perfil: "AUDITOR",
      regioes: ["R1", "R2", "R3", "R4", "R5", "R6"],
      permissoes: { verCadastro: true, editar: false, excluir: false, gerirCustos: false, importarBilhetagem: false },
    },
  ];
  const logs: AuditoriaLog[] = [
    {
      id: "l1", ts: new Date().toISOString(), ator: "admin@agu.gov.br",
      modulo: "Inventário", acao: "CRIAR", registroId: "a1",
      depois: { identificador: "2101", status: "ATIVO" },
    },
    {
      id: "l2", ts: new Date().toISOString(), ator: "gestora.r3@agu.gov.br",
      modulo: "Inventário", acao: "EDITAR", registroId: "a4",
      antes: { statusMDM: "CONFORME" }, depois: { statusMDM: "VIOLACAO" },
    },
  ];
  return { ativos, unidades, custos, logs, usuarios };
}

let state: State = load();
const listeners = new Set<() => void>();

function load(): State {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as State;
  } catch {}
  const s = seed();
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  return s;
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
  reset() {
    state = seed();
    persist();
  },
};

function log(entry: Omit<AuditoriaLog, "id" | "ts" | "ator">) {
  const full: AuditoriaLog = {
    id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    ator: "admin@agu.gov.br",
    ...entry,
  };
  setState((s) => ({ ...s, logs: [full, ...s.logs] }));
}

export function uid(prefix = ""): string {
  return prefix + crypto.randomUUID().slice(0, 8);
}
