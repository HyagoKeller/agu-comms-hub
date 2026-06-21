import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Bell, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { AguLogo } from "./AguLogo";
import { auth, useAuth } from "@/lib/auth";

const NAV: { to: string; label: string; adminOnly?: boolean }[] = [
  { to: "/", label: "Painel" },
  { to: "/inventario", label: "Inventário" },
  { to: "/whatsapp", label: "WhatsApp" },
  { to: "/custos", label: "Tabela de Custos" },
  { to: "/bilhetagem", label: "Bilhetagem" },
  { to: "/estrutura", label: "Estrutura" },
  { to: "/usuarios", label: "Usuários" },
  { to: "/relatorios", label: "Relatórios" },
  { to: "/auditoria", label: "Auditoria" },
  { to: "/admin", label: "Administração", adminOnly: true },
];

export function GovHeader() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const user = useAuth();

  function handleLogout() {
    auth.logout();
    navigate({ to: "/login" });
  }

  return (
    <header className="bg-card border-b border-border">
      {/* Faixa gov.br */}
      <div className="gov-topbar text-white text-xs md:text-sm">
        <div className="gov-container flex h-9 items-center justify-between">
          <span className="font-bold tracking-wide">gov.br</span>
          <span className="hidden md:block font-medium">
            Acesse já: <span className="underline">aguservicos.agu.gov.br</span>
          </span>
          <span className="font-semibold">Advocacia-Geral da União</span>
        </div>
      </div>

      {/* Cabeçalho principal */}
      <div className="gov-container flex items-center justify-between gap-4 py-4">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <AguLogo size={48} />
          <div className="min-w-0">
            <div className="font-bold text-base md:text-lg leading-tight text-gov-blue-dark truncate">
              Sistema de Gestão de Telecomunicações - SGT AGU
            </div>
            <div className="text-xs text-muted-foreground truncate">
              Sistema de Gestão — Advocacia-Geral da União
            </div>
            <div className="custom-underline mt-2" />
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notificações"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-gov-blue-dark hover:bg-accent"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-gov-red px-1 text-[10px] font-semibold text-white">
              2
            </span>
          </button>
          <div className="hidden md:flex items-center gap-3 border-l border-border pl-3">
            <div className="text-right leading-tight">
              <div className="text-sm font-semibold text-gov-blue-dark">{user?.nome ?? "—"}</div>
              <div className="text-xs text-muted-foreground">{user?.email ?? ""}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sair"
              title="Sair"
              className="inline-flex h-10 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-semibold text-gov-blue-dark hover:bg-accent"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-gov-blue-dark"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <nav
        aria-label="Navegação principal"
        className={`border-t border-border bg-card ${open ? "block" : "hidden md:block"}`}
      >
        <div className="gov-container flex flex-col md:flex-row md:items-stretch overflow-x-auto">
          {NAV.map((n) => {
            const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={`relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors ${
                  active
                    ? "text-gov-blue border-b-[3px] border-gov-blue"
                    : "text-foreground/80 hover:text-gov-blue border-b-[3px] border-transparent"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

export function GovBreadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Trilha de navegação" className="gov-container py-3 text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {it.to ? (
              <Link to={it.to} className="text-gov-blue hover:underline">
                {it.label}
              </Link>
            ) : (
              <span className="text-foreground">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
