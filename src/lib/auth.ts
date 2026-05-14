import { useSyncExternalStore } from "react";
import type { PerfilUsuario, Regiao } from "./types";

export const MOCK_USERS: PerfilUsuario[] = [
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
    regioes: ["R1", "R2", "R3", "R4", "R5", "R6"] as Regiao[],
    permissoes: { verCadastro: true, editar: false, excluir: false, gerirCustos: false, importarBilhetagem: false },
  },
];

const KEY = "agu-auth-v1";
let current: PerfilUsuario | null = load();
const listeners = new Set<() => void>();

function load(): PerfilUsuario | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PerfilUsuario) : null;
  } catch { return null; }
}

function persist() {
  try {
    if (current) localStorage.setItem(KEY, JSON.stringify(current));
    else localStorage.removeItem(KEY);
  } catch {}
  listeners.forEach((l) => l());
}

export const auth = {
  get current() { return current; },
  login(email: string, senha: string): PerfilUsuario | null {
    const u = MOCK_USERS.find((x) => x.email.toLowerCase() === email.toLowerCase());
    // Mock: aceita qualquer senha não vazia
    if (!u || !senha) return null;
    current = u;
    persist();
    return u;
  },
  logout() {
    current = null;
    persist();
  },
  switchTo(id: string) {
    const u = MOCK_USERS.find((x) => x.id === id);
    if (u) { current = u; persist(); }
  },
};

export function useAuth(): PerfilUsuario | null {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => current,
    () => current,
  );
}
