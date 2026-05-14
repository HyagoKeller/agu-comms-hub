import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Calculator } from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { useStore } from "@/lib/store";
import { REGIOES, TIPOS_ATIVO, type AtivoTipo } from "@/lib/types";

export const Route = createFileRoute("/bilhetagem")({
  head: () => ({ meta: [{ title: "Bilhetagem Simplificada — SGT AGU" }] }),
  component: Bilhetagem,
});

function brl(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

function Bilhetagem() {
  const ativos = useStore((s) => s.ativos);
  const custos = useStore((s) => s.custos);
  const hoje = new Date();
  const [periodo, setPeriodo] = useState(`${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`);

  function valorVigente(tipo: AtivoTipo, p: string): number {
    const vig = custos.find((c) => c.tipo === tipo && c.vigenciaInicio <= p && (!c.vigenciaFim || c.vigenciaFim >= p));
    return vig?.valorMensal ?? 0;
  }

  const ativosAtivos = ativos.filter((a) => a.status === "ATIVO");

  const porRegiao = useMemo(() => {
    return REGIOES.map((r) => {
      const subset = ativosAtivos.filter((a) => a.regiao === r);
      const total = subset.reduce((sum, a) => sum + valorVigente(a.tipo, periodo), 0);
      return { regiao: r, qtd: subset.length, total };
    });
  }, [ativosAtivos, custos, periodo]);

  const porTipo = useMemo(() => {
    return TIPOS_ATIVO.map((t) => {
      const qtd = ativosAtivos.filter((a) => a.tipo === t.value).length;
      const valor = valorVigente(t.value, periodo);
      return { ...t, qtd, valor, total: qtd * valor };
    });
  }, [ativosAtivos, custos, periodo]);

  const totalGeral = porRegiao.reduce((s, x) => s + x.total, 0);

  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel", to: "/" }, { label: "Bilhetagem" }]} />
      <section className="gov-container pb-10">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl">Bilhetagem Simplificada</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Cálculo automatizado: <strong>Quantidade de Ativos Ativos × Valor Unitário Vigente</strong>. Sem processamento de chamadas individuais (CDR).
            </p>
          </div>
          <div className="flex items-end gap-2">
            <div>
              <label className="gov-label">Período de referência</label>
              <input className="gov-input" type="month" value={periodo} onChange={(e) => setPeriodo(e.target.value)} />
            </div>
            <button className="gov-btn-secondary"><Download className="h-4 w-4" /> Exportar</button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <div className="gov-card">
            <div className="text-sm text-muted-foreground">Ativos cobrados</div>
            <div className="text-3xl font-bold text-gov-blue-dark mt-1">{ativosAtivos.length}</div>
          </div>
          <div className="gov-card">
            <div className="text-sm text-muted-foreground">Período (AAAAMM)</div>
            <div className="text-3xl font-bold text-gov-blue-dark mt-1 font-mono">{periodo.replace("-", "")}</div>
          </div>
          <div className="gov-card border-gov-blue/40">
            <div className="text-sm text-muted-foreground flex items-center gap-1"><Calculator className="h-4 w-4" /> Custo total do período</div>
            <div className="text-3xl font-bold text-gov-blue mt-1">{brl(totalGeral)}</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="gov-card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg">Por Tipo de Ativo</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-gov-blue-dark text-left">
                <tr>
                  <th className="px-4 py-2 font-semibold">Tipo</th>
                  <th className="px-4 py-2 font-semibold text-right">Qtd</th>
                  <th className="px-4 py-2 font-semibold text-right">Valor unit.</th>
                  <th className="px-4 py-2 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {porTipo.map((t) => (
                  <tr key={t.value}>
                    <td className="px-4 py-2">{t.label}</td>
                    <td className="px-4 py-2 text-right font-mono">{t.qtd}</td>
                    <td className="px-4 py-2 text-right">{brl(t.valor)}</td>
                    <td className="px-4 py-2 text-right font-semibold">{brl(t.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="gov-card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg">Por Região / Unidade</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-gov-blue-dark text-left">
                <tr>
                  <th className="px-4 py-2 font-semibold">Região</th>
                  <th className="px-4 py-2 font-semibold text-right">Ativos</th>
                  <th className="px-4 py-2 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {porRegiao.map((r) => (
                  <tr key={r.regiao}>
                    <td className="px-4 py-2">Região {r.regiao.slice(1)}</td>
                    <td className="px-4 py-2 text-right font-mono">{r.qtd}</td>
                    <td className="px-4 py-2 text-right font-semibold">{brl(r.total)}</td>
                  </tr>
                ))}
                <tr className="bg-gov-blue-light">
                  <td className="px-4 py-3 font-bold text-gov-blue-dark">Total Geral</td>
                  <td className="px-4 py-3 text-right font-bold font-mono text-gov-blue-dark">{ativosAtivos.length}</td>
                  <td className="px-4 py-3 text-right font-bold text-gov-blue-dark">{brl(totalGeral)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
