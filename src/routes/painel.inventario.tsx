import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Package, Smartphone, PhoneCall, ShieldCheck, AlertTriangle, Filter,
} from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { GovTag, StatusBadge } from "@/components/StatusTag";
import { useStore } from "@/lib/store";
import { REGIOES, TIPOS_ATIVO } from "@/lib/types";

export const Route = createFileRoute("/painel/inventario")({
  head: () => ({ meta: [{ title: "Painel de Inventário - SGT AGU" }] }),
  component: PainelInventario,
});

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function PainelInventario() {
  const ativos = useStore((s) => s.ativos);

  const hoje = new Date();
  const defDe = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);
  const [de, setDe] = useState(toISODate(defDe));
  const [ate, setAte] = useState(toISODate(hoje));
  const [regiao, setRegiao] = useState("");
  const [categoria, setCategoria] = useState<"" | "PABX" | "MOVEL">("");

  const filtrados = useMemo(() => {
    const deTs = new Date(de + "T00:00:00").getTime();
    const ateTs = new Date(ate + "T23:59:59").getTime();
    return ativos.filter((a) => {
      const t = new Date(a.criadoEm).getTime();
      if (t < deTs || t > ateTs) return false;
      if (regiao && a.regiao !== regiao) return false;
      if (categoria && a.categoria !== categoria) return false;
      return true;
    });
  }, [ativos, de, ate, regiao, categoria]);

  const kpi = useMemo(() => {
    const total = filtrados.length;
    const pabx = filtrados.filter((a) => a.categoria === "PABX").length;
    const movel = filtrados.filter((a) => a.categoria === "MOVEL").length;
    const ativosSt = filtrados.filter((a) => a.status === "ATIVO").length;
    const disponiveis = filtrados.filter((a) => a.status === "DISPONIVEL").length;
    const manut = filtrados.filter((a) => a.status === "MANUTENCAO").length;
    const bloqueados = filtrados.filter((a) => a.status === "BLOQUEADO").length;
    const inativos = filtrados.filter((a) => a.status === "INATIVO").length;
    const semUsuario = filtrados.filter((a) => !a.usuarioLogin).length;
    const violacoes = filtrados.filter((a) => a.statusMDM === "VIOLACAO").length;
    const naoSinc = filtrados.filter((a) => a.statusMDM === "NAO_SINCRONIZADO").length;
    return { total, pabx, movel, ativosSt, disponiveis, manut, bloqueados, inativos, semUsuario, violacoes, naoSinc };
  }, [filtrados]);

  const porRegiao = useMemo(() => {
    return (REGIOES as readonly string[]).map((r) => ({
      r,
      total: filtrados.filter((a) => a.regiao === r).length,
    }));
  }, [filtrados]);

  const porTipo = useMemo(() => {
    return TIPOS_ATIVO.map((t) => ({
      value: t.value,
      label: t.label,
      total: filtrados.filter((a) => a.tipo === t.value).length,
    })).filter((x) => x.total > 0).sort((a, b) => b.total - a.total);
  }, [filtrados]);

  const porUnidade = useMemo(() => {
    const map = new Map<string, number>();
    filtrados.forEach((a) => map.set(a.unidade, (map.get(a.unidade) ?? 0) + 1));
    return Array.from(map.entries())
      .map(([unidade, total]) => ({ unidade, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [filtrados]);

  const maxRegiao = Math.max(1, ...porRegiao.map((x) => x.total));
  const maxTipo = Math.max(1, ...porTipo.map((x) => x.total));
  const maxUnid = Math.max(1, ...porUnidade.map((x) => x.total));

  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel", to: "/" }, { label: "Painel de Inventário" }]} />
      <section className="gov-container pb-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl">Painel de Inventário</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Consolidação de ramais PABX e linhas móveis no período - filtros por data, região e categoria.
            </p>
          </div>
          <Link to="/inventario" className="gov-btn-secondary">Abrir Inventário</Link>
        </div>

        {/* Filtros */}
        <div className="gov-card mb-6">
          <div className="grid gap-3 md:grid-cols-5">
            <div>
              <label className="gov-label">De (cadastro)</label>
              <input type="date" className="gov-input" value={de} onChange={(e) => setDe(e.target.value)} />
            </div>
            <div>
              <label className="gov-label">Até (cadastro)</label>
              <input type="date" className="gov-input" value={ate} onChange={(e) => setAte(e.target.value)} />
            </div>
            <div>
              <label className="gov-label">Região / SAD</label>
              <select className="gov-input" value={regiao} onChange={(e) => setRegiao(e.target.value)}>
                <option value="">Todas</option>
                {REGIOES.map((r) => <option key={r} value={r}>Região {r.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="gov-label">Categoria</label>
              <select className="gov-input" value={categoria} onChange={(e) => setCategoria(e.target.value as "" | "PABX" | "MOVEL")}>
                <option value="">Todas</option>
                <option value="PABX">Ramais PABX</option>
                <option value="MOVEL">Linhas móveis</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                className="gov-btn-secondary w-full"
                onClick={() => { setDe(toISODate(defDe)); setAte(toISODate(hoje)); setRegiao(""); setCategoria(""); }}
              >
                <Filter className="h-4 w-4" /> Limpar
              </button>
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            {kpi.total} ativos no período selecionado.
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Kpi label="Total no período" value={kpi.total} icon={Package} tone="info" />
          <Kpi label="Ramais PABX" value={kpi.pabx} icon={PhoneCall} tone="info" />
          <Kpi label="Linhas móveis" value={kpi.movel} icon={Smartphone} tone="success" />
          <Kpi label="Sem atribuição" value={kpi.semUsuario} icon={AlertTriangle} tone={kpi.semUsuario > 0 ? "warning" : "success"} />
        </div>

        {/* Status operacional */}
        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          <div className="gov-card lg:col-span-2">
            <h2 className="text-lg mb-4">Distribuição por status operacional</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatusCard label="Ativos" v={kpi.ativosSt} status="ATIVO" />
              <StatusCard label="Disponíveis" v={kpi.disponiveis} status="DISPONIVEL" />
              <StatusCard label="Manutenção" v={kpi.manut} status="MANUTENCAO" />
              <StatusCard label="Bloqueados" v={kpi.bloqueados} status="BLOQUEADO" />
              <StatusCard label="Inativos" v={kpi.inativos} status="INATIVO" />
            </div>
          </div>
          <div className="gov-card">
            <div className="flex items-center gap-2 mb-3"><ShieldCheck className="h-5 w-5 text-gov-success" /><h2 className="text-lg">Conformidade MDM (móveis)</h2></div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Não sincronizados</span><GovTag tone="warning">{kpi.naoSinc}</GovTag></div>
              <div className="flex justify-between"><span>Violações</span><GovTag tone="danger">{kpi.violacoes}</GovTag></div>
              <div className="flex justify-between"><span>Total móveis</span><GovTag tone="info">{kpi.movel}</GovTag></div>
            </div>
          </div>
        </div>

        {/* Distribuições */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          <div className="gov-card">
            <h2 className="text-lg mb-3">Ativos por região</h2>
            <ul className="space-y-2">
              {porRegiao.map((x) => (
                <li key={x.r}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gov-blue-dark">Região {x.r.slice(1)}</span>
                    <span className="text-muted-foreground">{x.total}</span>
                  </div>
                  <Bar pct={(x.total / maxRegiao) * 100} />
                </li>
              ))}
            </ul>
          </div>
          <div className="gov-card">
            <h2 className="text-lg mb-3">Ativos por tipo</h2>
            {porTipo.length === 0 && <p className="text-sm text-muted-foreground italic">Sem dados.</p>}
            <ul className="space-y-2">
              {porTipo.map((x) => (
                <li key={x.value}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gov-blue-dark">{x.label}</span>
                    <span className="text-muted-foreground">{x.total}</span>
                  </div>
                  <Bar pct={(x.total / maxTipo) * 100} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Top unidades */}
        <div className="gov-card">
          <h2 className="text-lg mb-3">Top 10 unidades por volume</h2>
          {porUnidade.length === 0 && <p className="text-sm text-muted-foreground italic">Nenhuma unidade no período.</p>}
          <ul className="space-y-2">
            {porUnidade.map((x) => (
              <li key={x.unidade}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-gov-blue-dark truncate pr-2">{x.unidade}</span>
                  <span className="text-muted-foreground">{x.total}</span>
                </div>
                <Bar pct={(x.total / maxUnid) * 100} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

function Kpi({ label, value, icon: Icon, tone }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; tone: "success" | "warning" | "danger" | "info" }) {
  const color = tone === "danger" ? "text-gov-danger" : tone === "warning" ? "text-gov-yellow" : tone === "success" ? "text-gov-success" : "text-gov-blue";
  return (
    <div className="gov-card">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div className="mt-2 text-3xl font-bold text-gov-blue-dark">{value.toLocaleString("pt-BR")}</div>
    </div>
  );
}

function StatusCard({ label, v, status }: { label: string; v: number; status: "ATIVO" | "DISPONIVEL" | "MANUTENCAO" | "BLOQUEADO" | "INATIVO" }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-xs uppercase font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold text-gov-blue-dark">{v}</div>
      <div className="mt-2"><StatusBadge status={status} /></div>
    </div>
  );
}

function Bar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="h-2 rounded-full bg-muted overflow-hidden">
      <div className="h-full bg-gov-blue" style={{ width: `${clamped}%` }} />
    </div>
  );
}
