import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { History, Search, ArrowRight } from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { GovTag } from "@/components/StatusTag";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/auditoria")({
  head: () => ({ meta: [{ title: "Auditoria do Sistema — SGT AGU" }] }),
  component: Auditoria,
});

function Auditoria() {
  const logs = useStore((s) => s.logs);
  const [q, setQ] = useState("");
  const filtrados = logs.filter((l) =>
    !q ||
    l.modulo.toLowerCase().includes(q.toLowerCase()) ||
    l.ator.toLowerCase().includes(q.toLowerCase()) ||
    (l.registroId ?? "").includes(q)
  );

  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel", to: "/" }, { label: "Auditoria" }]} />
      <section className="gov-container pb-10">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl flex items-center gap-2"><History className="h-7 w-7 text-gov-blue" /> Trilha de Auditoria</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registro automático e imutável de quem alterou o quê, quando e como. Rastreabilidade Antes → Depois por campo.
          </p>
        </div>

        <div className="gov-card mb-6">
          <label className="gov-label">Filtrar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input className="gov-input pl-9" placeholder="Módulo, ator ou ID do registro..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        <div className="space-y-3">
          {filtrados.map((l) => (
            <div key={l.id} className="gov-card">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <GovTag tone={l.acao === "EXCLUIR" ? "danger" : l.acao === "EDITAR" ? "warning" : "info"}>{l.acao}</GovTag>
                    <span className="font-bold text-gov-blue-dark">{l.modulo}</span>
                    {l.registroId && <span className="text-xs text-muted-foreground font-mono">#{l.registroId}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Por <strong>{l.ator}</strong> em {new Date(l.ts).toLocaleString("pt-BR")}
                  </div>
                </div>
              </div>

              {(l.antes || l.depois) && (
                <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] items-center text-xs">
                  <div className="rounded-md border border-border bg-muted/30 p-3">
                    <div className="font-semibold text-muted-foreground mb-2">ANTES</div>
                    <pre className="whitespace-pre-wrap text-foreground/80 font-mono text-[11px]">
                      {l.antes ? JSON.stringify(l.antes, null, 2) : "—"}
                    </pre>
                  </div>
                  <ArrowRight className="hidden md:block h-5 w-5 text-gov-blue" />
                  <div className="rounded-md border border-gov-blue/30 bg-gov-blue-light p-3">
                    <div className="font-semibold text-gov-blue-dark mb-2">DEPOIS</div>
                    <pre className="whitespace-pre-wrap text-gov-blue-dark font-mono text-[11px]">
                      {l.depois ? JSON.stringify(l.depois, null, 2) : "—"}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtrados.length === 0 && (
            <div className="gov-card text-center text-muted-foreground">Nenhum evento encontrado.</div>
          )}
        </div>
      </section>
    </>
  );
}
