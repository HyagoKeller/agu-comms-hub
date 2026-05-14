import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Building2 } from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { GovTag } from "@/components/StatusTag";
import { store, useStore, uid } from "@/lib/store";
import { REGIOES, type Regiao } from "@/lib/types";

export const Route = createFileRoute("/estrutura")({
  head: () => ({ meta: [{ title: "Estrutura Organizacional — SGT AGU" }] }),
  component: Estrutura,
});

function Estrutura() {
  const unidades = useStore((s) => s.unidades);
  const ativos = useStore((s) => s.ativos);
  const [nome, setNome] = useState("");
  const [regiao, setRegiao] = useState<Regiao>("R1");

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    store.addUnidade({ id: uid("u"), nome: nome.trim(), regiao });
    setNome("");
  }

  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel", to: "/" }, { label: "Estrutura" }]} />
      <section className="gov-container pb-10">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl">Estrutura Organizacional</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Regiões 1 a 6 e Unidades vinculadas (ex.: SEDE 3, PRU 5).
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="gov-card lg:col-span-1">
            <h2 className="text-lg mb-4">Nova Unidade</h2>
            <form onSubmit={add} className="space-y-3">
              <div>
                <label className="gov-label">Região</label>
                <select className="gov-input" value={regiao} onChange={(e) => setRegiao(e.target.value as Regiao)}>
                  {REGIOES.map((r) => <option key={r} value={r}>Região {r.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="gov-label">Nome da Unidade</label>
                <input className="gov-input" placeholder="Ex.: SEDE 3" value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <button className="gov-btn-primary w-full justify-center"><Plus className="h-4 w-4" /> Adicionar</button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {REGIOES.map((r) => {
              const lista = unidades.filter((u) => u.regiao === r);
              const ativosCount = ativos.filter((a) => a.regiao === r).length;
              return (
                <div key={r} className="gov-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-gov-blue-dark">Região {r.slice(1)}</h3>
                    <GovTag tone="info">{ativosCount} ativos</GovTag>
                  </div>
                  {lista.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">Sem unidades cadastradas.</p>
                  ) : (
                    <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                      {lista.map((u) => (
                        <li key={u.id} className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
                          <Building2 className="h-4 w-4 text-gov-blue" />
                          <span className="font-medium">{u.nome}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {ativos.filter((a) => a.unidade === u.nome).length} ativos
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
