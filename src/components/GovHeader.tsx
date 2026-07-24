import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Bell, Menu, X, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { AguLogo } from "./AguLogo";
import { auth, useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Headphones,
  Receipt,
  ArrowLeftRight,
  Gavel,
  Package,
  MessageCircle,
  DollarSign,
  PhoneCall,
  Building2,
  Users,
  ShieldCheck,
  Settings,
} from "lucide-react";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

// Itens de acesso rápido que ficam no topo
const TOP_NAV: NavItem[] = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/auditoria", label: "Auditoria", icon: ShieldCheck },
];

// Menu lateral principal (agrupado)
const SIDE_NAV: { title: string; items: NavItem[] }[] = [
  {
    title: "Contratual",
    items: [
      { to: "/contratos", label: "Contratos", icon: FileText },
      { to: "/ordens-servico", label: "Ordens de Serviço", icon: ClipboardList },
      { to: "/chamados", label: "Chamados", icon: Headphones },
      { to: "/glosas", label: "Glosas", icon: Receipt },
      { to: "/portabilidade", label: "Portabilidade", icon: ArrowLeftRight },
      { to: "/sancoes", label: "Sanções", icon: Gavel },
    ],
  },
  {
    title: "Operacional",
    items: [
      { to: "/inventario", label: "Inventário", icon: Package },
      { to: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
      { to: "/custos", label: "Custos", icon: DollarSign },
      { to: "/bilhetagem", label: "Bilhetagem", icon: PhoneCall },
    ],
  },
  {
    title: "Governança",
    items: [
      { to: "/estrutura", label: "Estrutura", icon: Building2 },
      { to: "/usuarios", label: "Usuários", icon: Users },
      { to: "/admin", label: "Administração", icon: Settings, adminOnly: true },
    ],
  },
];

export function GovHeader({
  onToggleSidebar,
  sidebarOpen,
}: {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}) {
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
      <div className="gov-container flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? "Recolher menu" : "Abrir menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-gov-blue-dark hover:bg-accent"
          >
            {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </button>
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <AguLogo size={44} />
            <div className="min-w-0 hidden sm:block">
              <div className="font-bold text-base md:text-lg leading-tight text-gov-blue-dark truncate">
                Sistema de Gestão de Telecomunicações - SGT AGU
              </div>
              <div className="text-xs text-muted-foreground truncate">
                Advocacia-Geral da União
              </div>
              <div className="custom-underline mt-1" />
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1">
          {/* Atalhos rápidos no topo */}
          <nav aria-label="Atalhos" className="hidden lg:flex items-center gap-1 mr-2">
            {TOP_NAV.map((n) => {
              const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-accent text-gov-blue"
                      : "text-gov-blue-dark hover:bg-accent"
                  }`}
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>

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
              <div className="text-sm font-semibold text-gov-blue-dark">{user?.nome ?? "-"}</div>
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
        </div>
      </div>
    </header>
  );
}

export function GovSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const user = useAuth();

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        aria-label="Menu principal"
        className={`fixed md:sticky top-0 md:top-0 left-0 z-40 h-screen md:h-[calc(100vh)] w-64 shrink-0 border-r border-border bg-card transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:border-r-0 md:overflow-hidden"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border">
            <span className="font-bold text-gov-blue-dark">Menu</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gov-blue-dark hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>


          <nav className="flex-1 px-3 py-4 space-y-6">
            {SIDE_NAV.map((group) => {
              const items = group.items.filter(
                (i) => !i.adminOnly || user?.perfil === "ADMIN_GERAL",
              );
              if (items.length === 0) return null;
              return (
                <div key={group.title}>
                  <div className="px-2 mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {group.title}
                  </div>
                  <ul className="space-y-0.5">
                    {items.map((n) => {
                      const active = path === n.to || path.startsWith(n.to + "/");
                      return (
                        <li key={n.to}>
                          <Link
                            to={n.to}
                            onClick={onClose}
                            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                              active
                                ? "bg-gov-blue text-white"
                                : "text-foreground/80 hover:bg-accent hover:text-gov-blue-dark"
                            }`}
                          >
                            <n.icon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{n.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>

          <div className="border-t border-border px-4 py-3 text-[11px] text-muted-foreground">
            SGT AGU · v1.0
          </div>
        </div>
      </aside>
    </>
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
