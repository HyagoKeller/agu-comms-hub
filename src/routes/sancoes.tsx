import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { GovTag } from "@/components/StatusTag";
import { store, useStore } from "@/lib/store";
import { brl } from "@/lib/imr";
import { TIPOS_SANCAO, type StatusSancao, type TipoSancao } from "@/lib/types";

export const Route = createFileRoute("/sancoes")({
  head: () => ({ meta: [{ title: "Sanções — SGT AGU" }] }),
  component: SancoesPage,
});

const STATUS_TONE: Record<StatusSancao, "info" | "danger" | "warning" | "neutral" | "success"> = {
  EM_DEFESA: "warning", APLICADA: "danger", RECORRIDA: "info", CANCELADA: "neutral",
};
const STATUS_LABEL: Record<StatusSancao, string> = {
  EM_DEFESA: "Em defesa", APLICADA: "Aplicada", RECORRIDA: "Recorrida", CANCELADA: "Cancelada",
};

const ALINEAS = [
  { value: "a", label: "a) Dar causa à inexecução parcial" },
  { value: "b", label: "b) Dar causa à inexecução total" },
  { value: "c", label: "c) Deixar de entregar documentação" },
  { value: "d", label: "d) Não manter proposta" },
  { value: "e", label: "e) Não celebrar contrato" },
  { value: "f", label: "f) Ensejar retardamento" },
  { value: "g", label: "g) Apresentar declaração falsa" },
  { value: "h", label: "h) Fraudar o processo" },
];

function SancoesPage() {
  const sancoes = useStore((s) => s.sancoes);
  const contratos = useStore((s) => s.contratos);
  const [abrir, setAbrir] = useState(false);

  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel", to: "/" }, { label: "Sanções" }]} />
      <section className="gov-container pb-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl">Sanções Administrativas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Advertência, multa, impedimento e inidoneidade — infrações do item 8.1 do TR (alíneas a–h) e Lei 14.133/2021.
            </p>
          </div>
          <button className="gov-btn-primary" onClick={() => setAbrir(true)} disabled={contratos.length === 0}>
            <Plus className="h-4 w-4" /> Abrir processo
          </button>
        </div>

        <div className="gov-card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-gov-blue-dark text-left">
              <tr>
                <th className="px-4 py-2 font-semibold">Nº</th>
                <th className="px-4 py-2 font-semibold">Contrato</th>
                <th className="px-4 py-2 font-semibold">Tipo</th>
                <th className="px-4 py-2 font-semibold">Infração</th>
                <th className="px-4 py-2 font-semibold">Aberta em</th>
                <th className="px-4 py-2 font-semibold text-right">Valor</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sancoes.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Nenhuma sanção registrada.</td></tr>}
              {sancoes.map((s) => {
                const c = contratos.find((x) => x.id === s.contratoId);
                return (
                  <tr key={s.id}>
                    <td className="px-4 py-2 font-semibold text-gov-blue-dark">{s.numero}</td>
                    <td className="px-4 py-2 text-xs">Nº {c?.numero ?? "—"}</td>
                    <td className="px-4 py-2">{TIPOS_SANCAO.find((t) => t.value === s.tipo)?.label}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">Alínea {s.infracaoAlinea} — {s.descricao}</td>
                    <td className="px-4 py-2 text-xs">{new Date(s.dataAbertura).toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-2 text-right font-semibold">{s.valor ? brl(s.valor) : "—"}</td>
                    <td className="px-4 py-2"><GovTag tone={STATUS_TONE[s.status]}>{STATUS_LABEL[s.status]}</GovTag></td>
                    <td className="px-4 py-2 text-right">
                      <select className="gov-input py-1 h-8 text-xs" value={s.status} onChange={(e) => store.updateSancao(s.id, { status: e.target.value as StatusSancao, dataAplicacao: e.target.value === "APLICADA" ? new Date().toISOString() : s.dataAplicacao })}>
                        {(["EM_DEFESA","APLICADA","RECORRIDA","CANCELADA"] as StatusSancao[]).map((v) => <option key={v} value={v}>{STATUS_LABEL[v]}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {abrir && <NovaSancaoModal onClose={() => setAbrir(false)} />}
    </>
  );
}

function NovaSancaoModal({ onClose }: { onClose: () => void }) {
  const contratos = useStore((s) => s.contratos);
  const [contratoId, setContratoId] = useState(contratos[0]?.id ?? "");
  const [tipo, setTipo] = useState<TipoSancao>("ADVERTENCIA");
  const [alinea, setAlinea] = useState("a");
  const [descricao, setDescricao] = useState("");
  const [processo, setProcesso] = useState("");
  const [valor, setValor] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!contratoId || !descricao.trim()) return;
    store.addSancao({
      contratoId, tipo, infracaoAlinea: alinea, descricao: descricao.trim(),
      processoAdministrativo: processo.trim() || undefined,
      valor: valor ? parseFloat(valor.replace(",", ".")) : undefined,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start md:items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-xl border border-border w-full max-w-2xl shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-lg text-gov-blue-dark">Novo processo administrativo</h3>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-md"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={submit} className="p-5 grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="gov-label">Contrato</label>
            <select className="gov-input" value={contratoId} onChange={(e) => setContratoId(e.target.value)}>
              {contratos.map((c) => <option key={c.id} value={c.id}>Nº {c.numero} — {c.fornecedorRazaoSocial}</option>)}
            </select>
          </div>
          <div>
            <label className="gov-label">Tipo</label>
            <select className="gov-input" value={tipo} onChange={(e) => setTipo(e.target.value as TipoSancao)}>
              {TIPOS_SANCAO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="gov-label">Infração (item 8.1 TR)</label>
            <select className="gov-input" value={alinea} onChange={(e) => setAlinea(e.target.value)}>
              {ALINEAS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="gov-label">Descrição da conduta</label>
            <textarea className="gov-input" rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
          </div>
          <div>
            <label className="gov-label">Processo administrativo</label>
            <input className="gov-input" value={processo} onChange={(e) => setProcesso(e.target.value)} placeholder="00400.XXXXXX/AAAA-NN" />
          </div>
          <div>
            <label className="gov-label">Valor (R$)</label>
            <input className="gov-input" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t border-border mt-2">
            <button type="button" className="gov-btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="gov-btn-primary"><Plus className="h-4 w-4" /> Registrar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
