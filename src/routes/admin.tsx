import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, KeyRound, ShieldCheck, Server, Cloud, Save, Sliders } from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { GovTag } from "@/components/StatusTag";
import { store, useStore } from "@/lib/store";
import { auth, useAuth } from "@/lib/auth";
import { PERM_LABELS, type Permissoes, type PerfilTipo } from "@/lib/types";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Administração — SGT AGU" }] }),
  component: AdminPage,
});

function AdminPage() {
  const user = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.perfil !== "ADMIN_GERAL") {
    return (
      <section className="gov-container py-10">
        <div className="gov-card text-center">
          <Shield className="h-10 w-10 mx-auto text-gov-danger" />
          <h1 className="text-xl mt-3">Acesso restrito</h1>
          <p className="text-sm text-muted-foreground">Apenas o perfil Administrador Geral pode acessar este módulo.</p>
        </div>
      </section>
    );
  }

  const [aba, setAba] = useState<"perfis" | "mfa" | "ad" | "m365">("perfis");

  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel", to: "/" }, { label: "Administração" }]} />
      <section className="gov-container pb-10">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl">Administração do Sistema</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Modelos de perfil, MFA e autenticação corporativa (AD / Microsoft 365).
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {([
            { id: "perfis", label: "Perfis & Permissões", icon: Sliders },
            { id: "mfa", label: "Autenticação MFA", icon: ShieldCheck },
            { id: "ad", label: "Active Directory", icon: Server },
            { id: "m365", label: "Microsoft 365", icon: Cloud },
          ] as const).map((t) => {
            const ativo = aba === t.id;
            const Icon = t.icon;
            return (
              <button key={t.id} type="button" onClick={() => setAba(t.id)}
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                  ativo ? "border-gov-blue bg-gov-blue text-white" : "border-border bg-card text-gov-blue-dark hover:bg-accent"
                }`}>
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {aba === "perfis" && <PerfisPanel />}
        {aba === "mfa" && <MfaPanel />}
        {aba === "ad" && <AdPanel />}
        {aba === "m365" && <M365Panel />}
      </section>
    </>
  );
}

function PerfisPanel() {
  const templates = useStore((s) => s.perfilTemplates);
  function toggle(id: PerfilTipo, key: keyof Permissoes, current: Permissoes) {
    if (id === "ADMIN_GERAL") return; // admin sempre full
    store.updatePerfilTemplate(id, { ...current, [key]: !current[key] });
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Personalize as permissões padrão de cada modelo de perfil. As alterações se aplicam a novos usuários e podem ser usadas como referência para os existentes.
      </p>
      {templates.map((t) => (
        <div key={t.id} className="gov-card">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gov-blue" />
                <h3 className="text-base font-bold text-gov-blue-dark">{t.label}</h3>
                {t.id === "ADMIN_GERAL" && <GovTag tone="warning">Bloqueado (sempre total)</GovTag>}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{t.descricao}</div>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4 text-sm">
            {(Object.keys(PERM_LABELS) as (keyof Permissoes)[]).map((k) => (
              <label key={k} className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 cursor-pointer">
                <input type="checkbox"
                  disabled={t.id === "ADMIN_GERAL"}
                  checked={t.permissoes[k]}
                  onChange={() => toggle(t.id, k, t.permissoes)}
                />
                <span>{PERM_LABELS[k]}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MfaPanel() {
  const cfg = useStore((s) => s.authConfig);
  const user = useAuth()!;
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  function ativarMfa() {
    if (code.length < 6) { setMsg("Informe o código de 6 dígitos do app autenticador."); return; }
    const secret = "JBSWY3DPEHPK3PXP"; // mock TOTP secret
    auth.update({ mfaEnabled: true, mfaSecret: secret });
    setMsg("MFA ativado para sua conta.");
    setCode("");
  }
  function desativarMfa() {
    auth.update({ mfaEnabled: false, mfaSecret: undefined });
    setMsg("MFA desativado.");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="gov-card">
        <h2 className="text-lg mb-2 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-gov-blue" /> Política MFA</h2>
        <p className="text-sm text-muted-foreground mb-4">Defina onde o segundo fator é exigido.</p>
        <label className="flex items-center gap-2 py-2 cursor-pointer">
          <input type="checkbox" checked={cfg.mfaObrigatorioAdmin}
            onChange={(e) => store.updateAuthConfig({ mfaObrigatorioAdmin: e.target.checked })} />
          <span>Exigir MFA para perfis <strong>Administrador Geral</strong></span>
        </label>
        <label className="flex items-center gap-2 py-2 cursor-pointer">
          <input type="checkbox" checked={cfg.mfaObrigatorioTodos}
            onChange={(e) => store.updateAuthConfig({ mfaObrigatorioTodos: e.target.checked })} />
          <span>Exigir MFA para <strong>todos</strong> os usuários</span>
        </label>
      </div>

      <div className="gov-card">
        <h2 className="text-lg mb-2 flex items-center gap-2"><KeyRound className="h-5 w-5 text-gov-blue" /> Minha conta</h2>
        <div className="text-sm mb-3">
          Status: {user.mfaEnabled
            ? <GovTag tone="success">MFA ativo</GovTag>
            : <GovTag tone="warning">MFA inativo</GovTag>}
        </div>
        {!user.mfaEnabled ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Adicione a conta ao seu autenticador (Google Authenticator / Microsoft Authenticator) e confirme um código.
            </p>
            <div className="rounded-md border border-border bg-muted/30 p-3 text-xs font-mono break-all">
              otpauth://totp/SGT-AGU:{user.email}?secret=JBSWY3DPEHPK3PXP&issuer=AGU
            </div>
            <div>
              <label className="gov-label">Código de 6 dígitos</label>
              <input className="gov-input" inputMode="numeric" maxLength={6}
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
            </div>
            <button onClick={ativarMfa} className="gov-btn-primary"><Save className="h-4 w-4" /> Ativar MFA</button>
          </div>
        ) : (
          <button onClick={desativarMfa} className="gov-btn-primary">Desativar MFA</button>
        )}
        {msg && <div className="mt-3 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs">{msg}</div>}
      </div>
    </div>
  );
}

function AdPanel() {
  const cfg = useStore((s) => s.authConfig.ad);
  const metodo = useStore((s) => s.authConfig.metodoPrimario);
  function set<K extends keyof typeof cfg>(k: K, v: typeof cfg[K]) {
    store.updateAuthConfig({ ad: { ...cfg, [k]: v } });
  }
  return (
    <div className="gov-card max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg flex items-center gap-2"><Server className="h-5 w-5 text-gov-blue" /> Active Directory (LDAP)</h2>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={cfg.habilitado} onChange={(e) => set("habilitado", e.target.checked)} />
          Habilitar AD
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Domínio" value={cfg.dominio} onChange={(v) => set("dominio", v)} />
        <Field label="Servidor LDAP" value={cfg.servidor} onChange={(v) => set("servidor", v)} placeholder="ldaps://dc.exemplo:636" />
        <Field label="Base DN" value={cfg.baseDN} onChange={(v) => set("baseDN", v)} />
        <Field label="Grupo Administrador" value={cfg.grupoAdmin} onChange={(v) => set("grupoAdmin", v)} />
        <Field label="Usuário de serviço" value={cfg.usuarioServico} onChange={(v) => set("usuarioServico", v)} />
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Método primário de login:</span>
        <select className="gov-input max-w-[220px]" value={metodo}
          onChange={(e) => store.updateAuthConfig({ metodoPrimario: e.target.value as "LOCAL" | "AD" | "M365" })}>
          <option value="LOCAL">Local (mock)</option>
          <option value="AD">Active Directory</option>
          <option value="M365">Microsoft 365</option>
        </select>
      </div>
    </div>
  );
}

function M365Panel() {
  const cfg = useStore((s) => s.authConfig.m365);
  function set<K extends keyof typeof cfg>(k: K, v: typeof cfg[K]) {
    store.updateAuthConfig({ m365: { ...cfg, [k]: v } });
  }
  return (
    <div className="gov-card max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg flex items-center gap-2"><Cloud className="h-5 w-5 text-gov-blue" /> Microsoft 365 / Entra ID</h2>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={cfg.habilitado} onChange={(e) => set("habilitado", e.target.checked)} />
          Habilitar M365
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Tenant ID" value={cfg.tenantId} onChange={(v) => set("tenantId", v)} placeholder="00000000-0000-0000-0000-000000000000" />
        <Field label="Client ID" value={cfg.clientId} onChange={(v) => set("clientId", v)} />
        <Field label="Redirect URI" value={cfg.redirectUri} onChange={(v) => set("redirectUri", v)} />
        <Field label="Escopos" value={cfg.escopos} onChange={(v) => set("escopos", v)} />
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" checked={cfg.clientSecretConfigurado}
            onChange={(e) => set("clientSecretConfigurado", e.target.checked)} />
          Client Secret configurado no cofre de credenciais
        </label>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="gov-label">{label}</label>
      <input className="gov-input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
