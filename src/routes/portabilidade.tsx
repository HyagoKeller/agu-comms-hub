import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, GaugeCircle } from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { GovTag } from "@/components/StatusTag";
import { store, useStore, uid } from "@/lib/store";
import { ETAPAS_PORT, type EtapaPortabilidade } from "@/lib/types";

export const Route = createFileRoute("/portabilidade")({
  head: () => ({ meta: [{ title: "Portabilidade & Capacidade - SGT AGU" }] }),
  component: PortabilidadePage,
});

const LIMITE_RAMAIS = 9000;
const LIMITE_CANAIS = 2000;

const ETAPA_TONE: Record<EtapaPortabilidade, "neutral" | "warning" | "info" | "success"> = {
  NAO_INICIADA: "neutral",
  E1: "warning",
  E2: "info",
  E3: "info",
  CONCLUIDA: "success",
};

function PortabilidadePage() {
  const unidades = useStore((s) => s.unidades);
  const faixas = useStore((s) => s.faixasDDR);

  const totalRamaisAlocados = useMemo(
    () => faixas.reduce((acc, f) => acc + f.totalRamais, 0),
    [faixas],
  );
  const pctRamais = Math.min(100, (totalRamaisAlocados / LIMITE_RAMAIS) * 100);
  const canaisEstimados = Math.ceil(totalRamaisAlocados / 4.5); // proporção referencial
  const pctCanais = Math.min(100, (canaisEstimados / LIMITE_CANAIS) * 100);

  const progresso = useMemo(() => {
    const total = unidades.length || 1;
    const contagem: Record<EtapaPortabilidade, number> = { NAO_INICIADA: 0, E1: 0, E2: 0, E3: 0, CONCLUIDA: 0 };
    unidades.forEach((u) => { contagem[u.portabilidade ?? "NAO_INICIADA"]++; });
    return { total, contagem };
  }, [unidades]);

  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel", to: "/" }, { label: "Portabilidade" }]} />
      <section className="gov-container pb-10">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl">Portabilidade & Capacidade DDR</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Progresso por etapa (E1→E3) do cronograma A do Apêndice A e monitor de capacidade - 9.000 ramais DDR / 2.000 canais.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <CapacityCard label="Ramais DDR alocados" value={totalRamaisAlocados} limite={LIMITE_RAMAIS} pct={pctRamais} />
          <CapacityCard label="Canais simultâneos estimados" value={canaisEstimados} limite={LIMITE_CANAIS} pct={pctCanais} />
        </div>

        <div className="gov-card mb-6">
          <h2 className="text-lg mb-3">Progresso por etapa</h2>
          <div className="grid gap-3 md:grid-cols-5">
            {ETAPAS_PORT.map((e) => {
              const n = progresso.contagem[e.value];
              const pct = (n / progresso.total) * 100;
              return (
                <div key={e.value} className="rounded-md border border-border p-3">
                  <div className="text-xs uppercase font-semibold text-muted-foreground">{e.label}</div>
                  <div className="mt-1 text-2xl font-bold text-gov-blue-dark">{n}</div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gov-blue" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{pct.toFixed(0)}% das unidades</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="gov-card p-0 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg">Status por unidade</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-gov-blue-dark text-left">
              <tr>
                <th className="px-4 py-2 font-semibold">Unidade</th>
                <th className="px-4 py-2 font-semibold">Região</th>
                <th className="px-4 py-2 font-semibold">DDD / Tronco</th>
                <th className="px-4 py-2 font-semibold text-right">Ramais planej.</th>
                <th className="px-4 py-2 font-semibold">Etapa</th>
                <th className="px-4 py-2 font-semibold">Avançar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {unidades.map((u) => {
                const etapa = u.portabilidade ?? "NAO_INICIADA";
                return (
                  <tr key={u.id}>
                    <td className="px-4 py-2 font-semibold text-gov-blue-dark">{u.nome}</td>
                    <td className="px-4 py-2 text-muted-foreground">{u.regiaoLabel ?? u.regiao}</td>
                    <td className="px-4 py-2 font-mono text-xs">({u.ddd ?? "-"}) {u.troncoPrincipal ?? "-"}</td>
                    <td className="px-4 py-2 text-right font-mono">{u.totalRamaisPlanejados ?? 0}</td>
                    <td className="px-4 py-2"><GovTag tone={ETAPA_TONE[etapa]}>{ETAPAS_PORT.find((e) => e.value === etapa)?.label}</GovTag></td>
                    <td className="px-4 py-2">
                      <select
                        className="gov-input py-1 h-8 text-xs"
                        value={etapa}
                        onChange={(e) => store.atualizarPortabilidade(u.id, e.target.value as EtapaPortabilidade)}
                      >
                        {ETAPAS_PORT.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <FaixasDDR />
      </section>
    </>
  );
}

function CapacityCard({ label, value, limite, pct }: { label: string; value: number; limite: number; pct: number }) {
  const tone = pct >= 95 ? "text-gov-danger bg-gov-danger" : pct >= 80 ? "text-gov-yellow bg-gov-yellow" : "text-gov-success bg-gov-success";
  return (
    <div className="gov-card">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <GaugeCircle className={`h-5 w-5 ${tone.split(" ")[0]}`} />
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div className="text-3xl font-bold text-gov-blue-dark">{value.toLocaleString("pt-BR")}</div>
        <div className="text-sm text-muted-foreground">/ {limite.toLocaleString("pt-BR")}</div>
      </div>
      <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${tone.split(" ")[1]}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-muted-foreground mt-1">{pct.toFixed(1)}% da capacidade contratada</div>
    </div>
  );
}

function FaixasDDR() {
  const unidades = useStore((s) => s.unidades);
  const faixas = useStore((s) => s.faixasDDR);
  const [unidadeId, setUnidadeId] = useState(unidades[0]?.id ?? "");
  const [prefixo, setPrefixo] = useState("");
  const [ini, setIni] = useState("");
  const [fim, setFim] = useState("");
  const [total, setTotal] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!unidadeId || !prefixo || !ini || !fim) return;
    store.addFaixaDDR({
      id: uid("ddr"),
      unidadeId,
      prefixo: prefixo.trim(),
      faixaInicio: ini.trim(),
      faixaFim: fim.trim(),
      totalRamais: Number(total) || 0,
    });
    setPrefixo(""); setIni(""); setFim(""); setTotal("");
  }

  return (
    <div className="gov-card p-0 overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg">Faixas DDR autorizadas</h2>
        <p className="text-xs text-muted-foreground">Alimenta a validação de identificadores no cadastro de ramais.</p>
      </div>
      <form onSubmit={submit} className="grid gap-2 md:grid-cols-6 p-4 border-b border-border">
        <select className="gov-input md:col-span-2" value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)}>
          {unidades.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
        </select>
        <input className="gov-input" placeholder="Prefixo (ex.: 2026)" value={prefixo} onChange={(e) => setPrefixo(e.target.value)} />
        <input className="gov-input" placeholder="Início" value={ini} onChange={(e) => setIni(e.target.value)} />
        <input className="gov-input" placeholder="Fim" value={fim} onChange={(e) => setFim(e.target.value)} />
        <div className="flex gap-2">
          <input className="gov-input" placeholder="Total" value={total} onChange={(e) => setTotal(e.target.value)} />
          <button className="gov-btn-primary"><Plus className="h-4 w-4" /></button>
        </div>
      </form>
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-gov-blue-dark text-left">
          <tr>
            <th className="px-4 py-2 font-semibold">Unidade</th>
            <th className="px-4 py-2 font-semibold">Prefixo</th>
            <th className="px-4 py-2 font-semibold">Faixa</th>
            <th className="px-4 py-2 font-semibold text-right">Ramais</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {faixas.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Nenhuma faixa cadastrada.</td></tr>}
          {faixas.map((f) => {
            const u = unidades.find((x) => x.id === f.unidadeId);
            return (
              <tr key={f.id}>
                <td className="px-4 py-2">{u?.nome ?? "-"}</td>
                <td className="px-4 py-2 font-mono">{f.prefixo}</td>
                <td className="px-4 py-2 font-mono">{f.faixaInicio} - {f.faixaFim}</td>
                <td className="px-4 py-2 text-right font-mono">{f.totalRamais}</td>
                <td className="px-4 py-2 text-right">
                  <button className="text-gov-danger hover:underline text-xs" onClick={() => store.removeFaixaDDR(f.id)}><Trash2 className="h-3.5 w-3.5 inline" /></button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
