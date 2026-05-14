import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Calendar } from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { GovTag } from "@/components/StatusTag";
import { store, useStore, uid } from "@/lib/store";
import { TIPOS_ATIVO, type AtivoTipo } from "@/lib/types";

export const Route = createFileRoute("/custos")({
  head: () => ({ meta: [{ title: "Tabela de Custos — Telefonia & WhatsApp AGU" }] }),
  component: Custos,
});

function brl(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

function Custos() {
  const custos = useStore((s) => s.custos);
  const [tipo, setTipo] = useState<AtivoTipo>("RAMAL_FISICO");
  const [valor, setValor] = useState("");
  const [vi, setVi] = useState("");
  const [vf, setVf] = useState("");

  function add(e: React.FormEvent) {
    e.preventDefault();
    const v = parseFloat(valor.replace(",", "."));
    if (!v || !vi) return;
    store.addCusto({ id: uid("c"), tipo, valorMensal: v, vigenciaInicio: vi, vigenciaFim: vf || undefined });
    setValor(""); setVi(""); setVf("");
  }

  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel", to: "/" }, { label: "Tabela de Custos" }]} />
      <section className="gov-container pb-10">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl">Tabela de Custos com Vigência</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Valores unitários por tipo de ativo. Vigências preservam relatórios passados ao registrar reajustes contratuais.
          </p>
        </div>

        <div className="gov-card mb-6">
          <h2 className="text-lg mb-4">Novo valor de tabela</h2>
          <form onSubmit={add} className="grid gap-3 md:grid-cols-5 items-end">
            <div className="md:col-span-2">
              <label className="gov-label">Tipo de Ativo</label>
              <select className="gov-input" value={tipo} onChange={(e) => setTipo(e.target.value as AtivoTipo)}>
                {TIPOS_ATIVO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="gov-label">Valor mensal (R$)</label>
              <input className="gov-input" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} />
            </div>
            <div>
              <label className="gov-label">Vigência início (AAAA-MM)</label>
              <input className="gov-input" type="month" value={vi} onChange={(e) => setVi(e.target.value)} />
            </div>
            <div>
              <label className="gov-label">Vigência fim (opcional)</label>
              <input className="gov-input" type="month" value={vf} onChange={(e) => setVf(e.target.value)} />
            </div>
            <div className="md:col-span-5 flex justify-end">
              <button className="gov-btn-primary"><Plus className="h-4 w-4" /> Adicionar</button>
            </div>
          </form>
        </div>

        <div className="gov-card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-gov-blue-dark text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Tipo de Ativo</th>
                <th className="px-4 py-3 font-semibold">Valor mensal</th>
                <th className="px-4 py-3 font-semibold">Vigência</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {custos.map((c) => {
                const hoje = new Date().toISOString().slice(0, 7);
                const vigente = c.vigenciaInicio <= hoje && (!c.vigenciaFim || c.vigenciaFim >= hoje);
                return (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">{TIPOS_ATIVO.find((t) => t.value === c.tipo)?.label}</td>
                    <td className="px-4 py-3 font-semibold text-gov-blue-dark">{brl(c.valorMensal)}</td>
                    <td className="px-4 py-3">
                      <Calendar className="inline h-3 w-3 mr-1 text-muted-foreground" />
                      {c.vigenciaInicio} → {c.vigenciaFim ?? "indeterminado"}
                    </td>
                    <td className="px-4 py-3">
                      <GovTag tone={vigente ? "success" : "neutral"}>{vigente ? "Vigente" : "Histórico"}</GovTag>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { if (confirm("Remover este valor?")) store.removeCusto(c.id); }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent text-gov-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
