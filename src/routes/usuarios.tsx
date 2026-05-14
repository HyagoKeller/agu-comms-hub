import { createFileRoute } from "@tanstack/react-router";
import { Check, X, Shield } from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { GovTag } from "@/components/StatusTag";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/usuarios")({
  head: () => ({ meta: [{ title: "Usuários e Permissões — Telefonia & WhatsApp AGU" }] }),
  component: Usuarios,
});

const PERFIL_LABEL: Record<string, string> = {
  ADMIN_GERAL: "Administrador Geral",
  GESTOR_REGIONAL: "Gestor Regional",
  OPERADOR: "Operador",
  AUDITOR: "Auditor",
};

const PERM_LABEL: Record<string, string> = {
  verCadastro: "Ver Cadastro",
  editar: "Editar",
  excluir: "Excluir",
  gerirCustos: "Gerir Custos",
  importarBilhetagem: "Importar Bilhetagem",
};

function Usuarios() {
  const usuarios = useStore((s) => s.usuarios);
  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel", to: "/" }, { label: "Usuários" }]} />
      <section className="gov-container pb-10">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl">Usuários, Perfis e Escopo Regional</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Controle de acesso (RBAC) com escopo por região. Gestores regionais visualizam exclusivamente sua(s) região(ões) atribuída(s).
          </p>
        </div>

        <div className="space-y-4">
          {usuarios.map((u) => (
            <div key={u.id} className="gov-card">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gov-blue" />
                    <h3 className="text-base font-bold text-gov-blue-dark">{u.nome}</h3>
                    <GovTag tone="info">{PERFIL_LABEL[u.perfil]}</GovTag>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{u.email}</div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {u.regioes.map((r) => <GovTag key={r} tone="neutral">R{r.slice(1)}</GovTag>)}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-5 text-sm">
                {Object.entries(u.permissoes).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
                    {v ? <Check className="h-4 w-4 text-gov-success" /> : <X className="h-4 w-4 text-gov-danger" />}
                    <span className={v ? "text-foreground" : "text-muted-foreground line-through"}>{PERM_LABEL[k]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
