import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  AlertTriangle, ShieldCheck, FileBarChart2, Wallet, GaugeCircle, History,
  Phone, Users, TicketCheck, FileWarning,
} from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { GovTag } from "@/components/StatusTag";
import { useStore } from "@/lib/store";
import { alertasContrato, brl, calcISTMensal } from "@/lib/imr";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Painel Executivo — SGT AGU" },
    { name: "description", content: "Painel executivo IMR do Contrato STFC 12/2026: glosas, IST, portabilidade e capacidade." },
  ] }),
  component: Dashboard,
});

const LIMITE_RAMAIS = 9000;
const LIMITE_CANAIS = 2000;

function Dashboard() {
  const ativos = useStore((s) => s.ativos);
  const logs = useStore((s) => s.logs);
  const contratos = useStore((s) => s.contratos);
  const ordens = useStore((s) => s.ordensServico);
  const chamados = useStore((s) => s.chamados);
  const iars = useStore((s) => s.relatoriosIAR);
  const unidades = useStore((s) => s.unidades);
  const faixas = useStore((s) => s.faixasDDR);

  const contratoAtivo = contratos.find((c) => c.status === "ATIVO");
  const alertas = contratoAtivo ? alertasContrato(contratoAtivo) : [];

  const kpi = useMemo(() => {
    const iae = ordens
      .filter((o) => o.iaeDias != null && o.iaeDias > 5)
      .reduce((acc, o) => acc + o.iaeDias!, 0) / Math.max(1, ordens.filter((o) => o.iaeDias != null).length);
    const glosaIAE = ordens.reduce((a, o) => a + (o.glosaFinal ?? 0), 0);
    const glosaIST = chamados.reduce((a, c) => a + (c.glosaIST ?? 0), 0);
    const glosaIAR = iars.reduce((a, r) => a + (r.glosaIAR ?? 0), 0);
    const ist = calcISTMensal(chamados);
    const s1s2Abertos = chamados.filter((c) => (c.severidade === "S1" || c.severidade === "S2") && c.status !== "SOLUCIONADO" && c.status !== "CANCELADO").length;
    return {
      iaeMedio: isFinite(iae) ? iae : 0,
      glosaTotal: glosaIAE + glosaIST + glosaIAR,
      glosaIAE, glosaIST, glosaIAR,
      ist, s1s2Abertos,
    };
  }, [ordens, chamados, iars]);

  const ramaisAlocados = faixas.reduce((a, f) => a + f.totalRamais, 0);
  const canaisEstim = Math.ceil(ramaisAlocados / 4.5);
  const pctRamais = (ramaisAlocados / LIMITE_RAMAIS) * 100;
  const pctCanais = (canaisEstim / LIMITE_CANAIS) * 100;

  const totalUnid = unidades.length || 1;
  const portConcluidas = unidades.filter((u) => u.portabilidade === "CONCLUIDA").length;
  const pctPort = (portConcluidas / totalUnid) * 100;

  const valorMensal = contratoAtivo?.valorMensalTotal ?? 0;
  const valorLiquido = Math.max(0, valorMensal - kpi.glosaTotal);

  const movel = ativos.filter((a) => a.categoria === "MOVEL");
  const conformes = movel.filter((a) => a.statusMDM === "CONFORME").length;

  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel Executivo" }]} />
      <section className="gov-container pb-10">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl">Painel Executivo — Contrato STFC {contratoAtivo?.numero ?? "—"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão consolidada de execução contratual, IMR (IAE/IST/IAR), capacidade e portabilidade.
          </p>
        </div>

        {alertas.length > 0 && (
          <div className="gov-card mb-6 border-gov-yellow/40 bg-gov-yellow/5">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-5 w-5 text-gov-yellow" /><h2 className="text-lg">Próximos vencimentos</h2></div>
            <ul className="grid gap-2 md:grid-cols-2">
              {alertas.map((a, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <GovTag tone={a.severidade === "danger" ? "danger" : a.severidade === "warning" ? "warning" : "info"}>{a.tipo}</GovTag>
                  <span>{a.texto}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* KPIs IMR */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <KpiCard label="Glosa total (IMR)" value={brl(kpi.glosaTotal)} icon={Wallet} tone={kpi.glosaTotal > 0 ? "danger" : "success"} sub={`de ${brl(valorMensal)} mensais`} />
          <KpiCard label="Valor líquido a pagar" value={brl(valorLiquido)} icon={FileBarChart2} tone="success" sub="após glosas" />
          <KpiCard label="IST — conformidade" value={`${kpi.ist.pct}%`} icon={TicketCheck} tone={kpi.ist.pct >= 95 ? "success" : kpi.ist.pct >= 80 ? "warning" : "danger"} sub={`${kpi.ist.conformes}/${kpi.ist.total} chamados`} />
          <KpiCard label="IAE médio (dias)" value={kpi.iaeMedio.toFixed(1)} icon={AlertTriangle} tone={kpi.iaeMedio > 15 ? "danger" : kpi.iaeMedio > 5 ? "warning" : "success"} sub="atrasos em OS" />
        </div>

        {/* Composição das glosas */}
        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          <div className="gov-card lg:col-span-2">
            <h2 className="text-lg mb-3">Composição das glosas do período</h2>
            <GlosaBar label="IAE — Ordens de Serviço" v={kpi.glosaIAE} total={kpi.glosaTotal} />
            <GlosaBar label="IST — Chamados Técnicos" v={kpi.glosaIST} total={kpi.glosaTotal} />
            <GlosaBar label="IAR — Relatório Semestral" v={kpi.glosaIAR} total={kpi.glosaTotal} />
            <Link to="/glosas" className="mt-3 inline-block text-sm text-gov-blue font-semibold hover:underline">Abrir Painel de Glosas →</Link>
          </div>

          <div className="gov-card">
            <div className="flex items-center gap-2 mb-3"><FileWarning className="h-5 w-5 text-gov-danger" /><h2 className="text-lg">Chamados críticos</h2></div>
            <div className="text-3xl font-bold text-gov-danger">{kpi.s1s2Abertos}</div>
            <p className="text-sm text-muted-foreground">S1/S2 em aberto</p>
            <Link to="/chamados" className="mt-3 inline-block text-sm text-gov-blue font-semibold hover:underline">Ver chamados →</Link>
          </div>
        </div>

        {/* Capacidade e Portabilidade */}
        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          <div className="gov-card">
            <div className="flex items-center gap-2 mb-2"><GaugeCircle className="h-5 w-5 text-gov-blue" /><h2 className="text-lg">Ramais DDR</h2></div>
            <div className="text-3xl font-bold text-gov-blue-dark">{ramaisAlocados.toLocaleString("pt-BR")}</div>
            <div className="text-xs text-muted-foreground">/ {LIMITE_RAMAIS.toLocaleString("pt-BR")}</div>
            <Bar pct={pctRamais} />
          </div>
          <div className="gov-card">
            <div className="flex items-center gap-2 mb-2"><Phone className="h-5 w-5 text-gov-blue" /><h2 className="text-lg">Canais SIP</h2></div>
            <div className="text-3xl font-bold text-gov-blue-dark">{canaisEstim.toLocaleString("pt-BR")}</div>
            <div className="text-xs text-muted-foreground">/ {LIMITE_CANAIS.toLocaleString("pt-BR")}</div>
            <Bar pct={pctCanais} />
          </div>
          <div className="gov-card">
            <div className="flex items-center gap-2 mb-2"><ShieldCheck className="h-5 w-5 text-gov-success" /><h2 className="text-lg">Portabilidade</h2></div>
            <div className="text-3xl font-bold text-gov-blue-dark">{portConcluidas}/{totalUnid}</div>
            <div className="text-xs text-muted-foreground">unidades concluídas</div>
            <Bar pct={pctPort} />
          </div>
        </div>

        {/* MDM WhatsApp (mantido em segundo plano) */}
        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          <div className="gov-card lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg">Ativos por região</h2>
              <Link to="/inventario" className="text-sm font-semibold text-gov-blue hover:underline">Ver inventário</Link>
            </div>
            <ul className="space-y-2">
              {(["R1","R2","R3","R4","R5","R6"] as const).map((r) => {
                const count = ativos.filter((a) => a.regiao === r).length;
                const max = Math.max(1, ...["R1","R2","R3","R4","R5","R6"].map((rr) => ativos.filter((a) => a.regiao === rr).length));
                const pct = (count / max) * 100;
                return (
                  <li key={r}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-gov-blue-dark">Região {r.slice(1)}</span>
                      <span className="text-muted-foreground">{count} ativos</span>
                    </div>
                    <Bar pct={pct} />
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="gov-card">
            <div className="flex items-center gap-2 mb-2"><ShieldCheck className="h-5 w-5 text-gov-success" /><h2 className="text-lg">Trava WhatsApp</h2></div>
            <p className="text-xs text-muted-foreground mb-3">Móveis institucionais devem usar apenas WhatsApp Messenger.</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Conformes</span><GovTag tone="success">{conformes}</GovTag></div>
              <div className="flex justify-between"><span>Não sincronizados</span><GovTag tone="warning">{movel.filter((a) => a.statusMDM === "NAO_SINCRONIZADO").length}</GovTag></div>
              <div className="flex justify-between"><span>Violações</span><GovTag tone="danger">{movel.filter((a) => a.statusMDM === "VIOLACAO").length}</GovTag></div>
            </div>
          </div>
        </div>

        {/* Últimos eventos */}
        <div className="gov-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg flex items-center gap-2"><History className="h-5 w-5 text-gov-blue" /> Últimos eventos auditados</h2>
            <Link to="/auditoria" className="text-sm font-semibold text-gov-blue hover:underline">Ver auditoria</Link>
          </div>
          <ul className="divide-y divide-border">
            {logs.slice(0, 6).map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <div className="font-semibold text-gov-blue-dark">{l.modulo} · {l.acao}</div>
                  <div className="text-xs text-muted-foreground">
                    <Users className="inline h-3 w-3 mr-1" />{l.ator} · {new Date(l.ts).toLocaleString("pt-BR")}
                  </div>
                </div>
                <GovTag tone={l.acao === "EXCLUIR" ? "danger" : l.acao === "IMPORTAR" ? "info" : "success"}>{l.acao}</GovTag>
              </li>
            ))}
            {logs.length === 0 && <li className="py-3 text-sm text-muted-foreground italic">Nenhum evento registrado ainda.</li>}
          </ul>
        </div>
      </section>
    </>
  );
}

function KpiCard({ label, value, icon: Icon, tone, sub }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; tone: "success" | "warning" | "danger" | "info"; sub?: string }) {
  const color = tone === "danger" ? "text-gov-danger" : tone === "warning" ? "text-gov-yellow" : tone === "success" ? "text-gov-success" : "text-gov-blue";
  return (
    <div className="gov-card">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div className={`mt-2 text-3xl font-bold ${tone === "success" || tone === "info" ? "text-gov-blue-dark" : color}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

function Bar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const color = clamped >= 95 ? "bg-gov-danger" : clamped >= 80 ? "bg-gov-yellow" : "bg-gov-blue";
  return (
    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

function GlosaBar({ label, v, total }: { label: string; v: number; total: number }) {
  const pct = total > 0 ? (v / total) * 100 : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-semibold text-gov-blue-dark">{label}</span>
        <span className="text-muted-foreground">{brl(v)} · {pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-gov-danger" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
