import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogIn, ShieldCheck } from "lucide-react";
import { AguLogo } from "@/components/AguLogo";
import { auth, MOCK_USERS, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Telefonia & WhatsApp AGU" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const user = useAuth();
  const [email, setEmail] = useState("admin@agu.gov.br");
  const [senha, setSenha] = useState("agu");
  const [erro, setErro] = useState<string | null>(null);

  if (user) return <Navigate to="/" />;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const u = auth.login(email, senha);
    if (!u) {
      setErro("Credenciais inválidas. Use um dos perfis sugeridos abaixo.");
      return;
    }
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="gov-topbar text-white text-xs md:text-sm">
        <div className="gov-container flex h-9 items-center justify-between">
          <span className="font-bold tracking-wide">gov.br</span>
          <span className="font-semibold">Advocacia-Geral da União</span>
        </div>
      </div>

      <div className="gov-container py-12 grid gap-8 lg:grid-cols-2 items-start">
        <div className="gov-card">
          <div className="flex items-center gap-3 mb-6">
            <AguLogo size={56} />
            <div>
              <div className="font-bold text-lg text-gov-blue-dark leading-tight">
                Telefonia & WhatsApp Institucional
              </div>
              <div className="text-xs text-muted-foreground">Sistema de Gestão — AGU</div>
              <div className="custom-underline mt-2" />
            </div>
          </div>

          <h1 className="text-xl mb-1">Acesso restrito</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Informe suas credenciais institucionais para continuar.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gov-blue-dark mb-1">E-mail institucional</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gov-blue-dark mb-1">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            {erro && (
              <div className="rounded-md border border-gov-danger/30 bg-gov-danger/5 px-3 py-2 text-sm text-gov-danger">
                {erro}
              </div>
            )}
            <button type="submit" className="gov-btn-primary w-full justify-center">
              <LogIn className="h-4 w-4" /> Entrar
            </button>
          </form>
        </div>

        <div className="gov-card">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-gov-blue" />
            <h2 className="text-lg">Perfis de demonstração</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Ambiente de homologação. Clique em um perfil para entrar (qualquer senha é aceita).
          </p>
          <ul className="space-y-2">
            {MOCK_USERS.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => { auth.switchTo(u.id); navigate({ to: "/" }); }}
                  className="w-full text-left rounded-md border border-border bg-card hover:border-gov-blue hover:bg-accent px-4 py-3 transition-colors"
                >
                  <div className="font-semibold text-gov-blue-dark">{u.nome}</div>
                  <div className="text-xs text-muted-foreground">{u.email} · {u.perfil}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
