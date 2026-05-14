import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Search, Trash2, Pencil, Download, Filter } from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { GovTag, StatusBadge } from "@/components/StatusTag";
import { useStore, store } from "@/lib/store";
import { REGIOES, TIPOS_ATIVO } from "@/lib/types";

export const Route = createFileRoute("/inventario/")({
  head: () => ({ meta: [{ title: "Inventário Unificado — Telefonia & WhatsApp AGU" }] }),
  component: Inventario,
});

function Inventario() {
  const ativos = useStore((s) => s.ativos);
  const [aba, setAba] = useState<"TODOS" | "PABX" | "MOVEL">("TODOS");
  const [q, setQ] = useState("");
  const [regiao, setRegiao] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const filtrados = useMemo(() => {
    return ativos.filter((a) => {
      if (aba !== "TODOS" && a.categoria !== aba) return false;
      if (regiao && a.regiao !== regiao) return false;
      if (status && a.status !== status) return false;
      if (q) {
        const s = q.toLowerCase();
        if (
          !a.identificador.toLowerCase().includes(s) &&
          !(a.usuarioNome ?? "").toLowerCase().includes(s) &&
          !(a.usuarioLogin ?? "").toLowerCase().includes(s) &&
          !a.unidade.toLowerCase().includes(s)
        ) return false;
      }
      return true;
    });
  }, [ativos, aba, q, regiao, status]);

  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel", to: "/" }, { label: "Inventário" }]} />
      <section className="gov-container pb-10">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl">Inventário Unificado</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ramais PABX e linhas móveis WhatsApp em uma única base com numeração única.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="gov-btn-secondary"><Download className="h-4 w-4" /> Exportar</button>
            <Link to="/inventario/novo" className="gov-btn-primary"><Plus className="h-4 w-4" /> Novo Ativo</Link>
          </div>
        </div>

        <div className="gov-card mb-6">
          <div className="flex flex-wrap gap-2 mb-4 border-b border-border -mx-6 px-6 -mt-2 pt-2">
            {(["TODOS", "PABX", "MOVEL"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setAba(t)}
                className={`px-4 py-2 text-sm font-semibold border-b-[3px] -mb-[1px] ${
                  aba === t ? "text-gov-blue border-gov-blue" : "text-muted-foreground border-transparent hover:text-gov-blue"
                }`}
              >
                {t === "TODOS" ? "Todos" : t === "PABX" ? "Ramais PABX" : "Linhas Móveis (WhatsApp)"}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="gov-label">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  className="gov-input pl-9"
                  placeholder="Ramal, MSISDN, usuário, unidade..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="gov-label">Região</label>
              <select className="gov-input" value={regiao} onChange={(e) => setRegiao(e.target.value)}>
                <option value="">Todas</option>
                {REGIOES.map((r) => <option key={r} value={r}>Região {r.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="gov-label">Status</label>
              <select className="gov-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Todos</option>
                <option value="ATIVO">Ativo</option>
                <option value="DISPONIVEL">Disponível</option>
                <option value="MANUTENCAO">Manutenção</option>
                <option value="BLOQUEADO">Bloqueado</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
            <Filter className="h-3 w-3" /> {filtrados.length} resultado(s)
          </div>
        </div>

        <div className="gov-card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-gov-blue-dark">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Identificador</th>
                <th className="px-4 py-3 font-semibold">Categoria</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Região / Unidade</th>
                <th className="px-4 py-3 font-semibold">Atribuído a</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">MDM</th>
                <th className="px-4 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtrados.map((a) => {
                const tipo = TIPOS_ATIVO.find((t) => t.value === a.tipo);
                return (
                  <tr key={a.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-semibold text-gov-blue-dark">{a.identificador}</td>
                    <td className="px-4 py-3">
                      <GovTag tone={a.categoria === "PABX" ? "info" : "success"}>
                        {a.categoria === "PABX" ? "PABX" : "Móvel"}
                      </GovTag>
                    </td>
                    <td className="px-4 py-3">{tipo?.label}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{a.unidade}</div>
                      <div className="text-xs text-muted-foreground">Região {a.regiao.slice(1)}{a.sala ? ` · Sala ${a.sala}` : ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      {a.usuarioNome ? (
                        <>
                          <div className="font-medium">{a.usuarioNome}</div>
                          <div className="text-xs text-muted-foreground">{a.usuarioLogin}</div>
                        </>
                      ) : <span className="text-muted-foreground italic">— sem atribuição —</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={a.statusMDM} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent text-gov-blue" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { if (confirm(`Excluir ${a.identificador}?`)) store.removeAtivo(a.id); }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent text-gov-danger"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtrados.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">Nenhum ativo encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
