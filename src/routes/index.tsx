import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, Smartphone, ShieldCheck, AlertTriangle, FileBarChart2, Plus, Users, History } from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { GovTag, StatusBadge } from "@/components/StatusTag";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Painel — SGT AGU" }] }),
  component: Dashboard,
});

function Dashboard() {
  const ativos = useStore((s) => s.ativos);
  const logs = useStore((s) => s.logs);

  const pabx = ativos.filter((a) => a.categoria === "PABX");
  const movel = ativos.filter((a) => a.categoria === "MOVEL");
  const conformes = movel.filter((a) => a.statusMDM === "CONFORME").length;
  const violacoes = movel.filter((a) => a.statusMDM === "VIOLACAO").length;

  const cards = [
    { label: "Ramais PABX", value: pabx.length, Icon: Phone, tone: "text-gov-blue" },
    { label: "Linhas Móveis WhatsApp", value: movel.length, Icon: Smartphone, tone: "text-gov-success" },
    { label: "MDM em Conformidade", value: conformes, Icon: ShieldCheck, tone: "text-gov-success" },
    { label: "Violações MDM", value: violacoes, Icon: AlertTriangle, tone: "text-gov-danger" },
  ];

  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel" }]} />
      <section className="gov-container pb-10">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl">Painel de Governança</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Visão consolidada do inventário de telefonia fixa (PABX) e linhas móveis institucionais.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/inventario/novo" className="gov-btn-primary">
              <Plus className="h-4 w-4" /> Cadastrar Ativo
            </Link>
            <Link to="/relatorios" className="gov-btn-secondary">
              <FileBarChart2 className="h-4 w-4" /> Relatórios
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {cards.map((c) => (
            <div key={c.label} className="gov-card">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-medium">{c.label}</span>
                <c.Icon className={`h-5 w-5 ${c.tone}`} />
              </div>
              <div className="mt-2 text-3xl font-bold text-gov-blue-dark">{c.value}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="gov-card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg">Distribuição por Região</h2>
              <Link to="/inventario" className="text-sm font-semibold text-gov-blue hover:underline">Ver inventário</Link>
            </div>
            <ul className="space-y-3">
              {(["R1", "R2", "R3", "R4", "R5", "R6"] as const).map((r) => {
                const count = ativos.filter((a) => a.regiao === r).length;
                const max = Math.max(1, ...["R1", "R2", "R3", "R4", "R5", "R6"].map((rr) => ativos.filter((a) => a.regiao === rr).length));
                const pct = (count / max) * 100;
                return (
                  <li key={r}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-gov-blue-dark">Região {r.slice(1)}</span>
                      <span className="text-muted-foreground">{count} ativos</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-gov-blue" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="gov-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg">Trava de Conformidade</h2>
              <ShieldCheck className="h-5 w-5 text-gov-success" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Linhas móveis devem usar exclusivamente o aplicativo <strong>WhatsApp Messenger</strong>. O uso de WhatsApp Business é vedado.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Conformes</span><GovTag tone="success">{conformes}</GovTag></div>
              <div className="flex justify-between"><span>Não sincronizados</span><GovTag tone="warning">{movel.filter((a) => a.statusMDM === "NAO_SINCRONIZADO").length}</GovTag></div>
              <div className="flex justify-between"><span>Violações detectadas</span><GovTag tone="danger">{violacoes}</GovTag></div>
            </div>
          </div>
        </div>

        <div className="gov-card mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg flex items-center gap-2"><History className="h-5 w-5 text-gov-blue" /> Últimos eventos auditados</h2>
            <Link to="/auditoria" className="text-sm font-semibold text-gov-blue hover:underline">Ver auditoria</Link>
          </div>
          <ul className="divide-y divide-border">
            {logs.slice(0, 5).map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <div className="font-semibold text-gov-blue-dark">{l.modulo} · {l.acao}</div>
                  <div className="text-xs text-muted-foreground">
                    <Users className="inline h-3 w-3 mr-1" />{l.ator} · {new Date(l.ts).toLocaleString("pt-BR")}
                  </div>
                </div>
                <StatusBadge status={l.acao === "EXCLUIR" ? "BLOQUEADO" : "ATIVO"} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
