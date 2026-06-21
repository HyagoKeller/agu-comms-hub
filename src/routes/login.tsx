import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogIn, ShieldCheck, ChevronDown, ChevronUp, Server, Cloud, KeyRound } from "lucide-react";
import { AguLogo } from "@/components/AguLogo";
import { auth, MOCK_USERS, useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — SGT AGU" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const user = useAuth();
  const authCfg = useStore((s) => s.authConfig);
  const [email, setEmail] = useState("admin@agu.gov.br");
  const [senha, setSenha] = useState("agu");
  const [mfa, setMfa] = useState("");
  const [precisaMfa, setPrecisaMfa] = useState(false);
  const [emailPendente, setEmailPendente] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  if (user) return <Navigate to="/" />;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const candidato = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!candidato || !senha) {
      setErro("Credenciais inválidas.");
      return;
    }
    const exigeMfa = candidato.mfaEnabled
      || (authCfg.mfaObrigatorioAdmin && candidato.perfil === "ADMIN_GERAL" && candidato.mfaEnabled)
      || authCfg.mfaObrigatorioTodos && candidato.mfaEnabled;
    if (exigeMfa && !precisaMfa) {
      setPrecisaMfa(true);
      setEmailPendente(email);
      return;
    }
    if (precisaMfa) {
      if (mfa.length !== 6) { setErro("Informe o código MFA de 6 dígitos."); return; }
    }
    const u = auth.login(email, senha);
    if (!u) { setErro("Falha no login."); return; }
    navigate({ to: "/" });
  }

  const metodos = [
    authCfg.ad.habilitado ? { id: "AD", label: "Entrar com Active Directory", icon: Server } : null,
    authCfg.m365.habilitado ? { id: "M365", label: "Entrar com Microsoft 365", icon: Cloud } : null,
  ].filter(Boolean) as { id: string; label: string; icon: typeof Server }[];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="gov-topbar text-white text-xs md:text-sm">
        <div className="gov-container flex h-9 items-center justify-between">
          <span className="font-bold tracking-wide">gov.br</span>
          <span className="font-semibold">Advocacia-Geral da União</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="gov-card">
            <div className="flex flex-col items-center text-center mb-6">
              <AguLogo size={64} />
              <div className="font-bold text-lg text-gov-blue-dark leading-tight mt-3">
                Sistema de Gestão de Telecomunicações
              </div>
              <div className="text-xs text-muted-foreground">SGT AGU — Advocacia-Geral da União</div>
              <div className="custom-underline mt-2" />
            </div>

            <h1 className="text-lg mb-1 text-center">Acesso restrito</h1>
            <p className="text-xs text-muted-foreground mb-5 text-center">
              Informe suas credenciais institucionais.
            </p>

            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gov-blue-dark mb-1">E-mail institucional</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  disabled={precisaMfa}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gov-blue-dark mb-1">Senha</label>
                <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
                  disabled={precisaMfa}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
              </div>
              {precisaMfa && (
                <div>
                  <label className="block text-sm font-semibold text-gov-blue-dark mb-1 flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5" /> Código MFA (6 dígitos)
                  </label>
                  <input inputMode="numeric" maxLength={6} value={mfa}
                    onChange={(e) => setMfa(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm tracking-widest text-center font-mono" />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Verificando segundo fator para {emailPendente}.
                  </p>
                </div>
              )}
              {erro && (
                <div className="rounded-md border border-gov-danger/30 bg-gov-danger/5 px-3 py-2 text-sm text-gov-danger">
                  {erro}
                </div>
              )}
              <button type="submit" className="gov-btn-primary w-full justify-center">
                <LogIn className="h-4 w-4" /> {precisaMfa ? "Validar MFA" : "Entrar"}
              </button>
            </form>

            {metodos.length > 0 && (
              <>
                <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
                </div>
                <div className="space-y-2">
                  {metodos.map((m) => {
                    const Icon = m.icon;
                    return (
                      <button key={m.id} type="button"
                        onClick={() => { auth.switchTo("us1"); navigate({ to: "/" }); }}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card hover:bg-accent px-3 py-2 text-sm font-semibold text-gov-blue-dark">
                        <Icon className="h-4 w-4" /> {m.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <button type="button" onClick={() => setShowDemo((v) => !v)}
              className="mt-5 w-full inline-flex items-center justify-center gap-1.5 text-xs text-gov-blue hover:underline">
              <ShieldCheck className="h-3.5 w-3.5" /> Perfis de demonstração
              {showDemo ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {showDemo && (
              <ul className="mt-3 space-y-1.5">
                {MOCK_USERS.map((u) => (
                  <li key={u.id}>
                    <button type="button"
                      onClick={() => { auth.switchTo(u.id); navigate({ to: "/" }); }}
                      className="w-full text-left rounded-md border border-border bg-card hover:border-gov-blue hover:bg-accent px-3 py-2 text-xs transition-colors">
                      <div className="font-semibold text-gov-blue-dark">{u.nome}</div>
                      <div className="text-[11px] text-muted-foreground">{u.email} · {u.perfil}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="text-center text-[11px] text-muted-foreground mt-4">
            © Advocacia-Geral da União · Ambiente de homologação
          </p>
        </div>
      </div>
    </div>
  );
}
