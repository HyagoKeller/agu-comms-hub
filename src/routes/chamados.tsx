import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, X, MessageCircleReply, CheckCircle2, Ban } from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { GovTag } from "@/components/StatusTag";
import { store, useStore } from "@/lib/store";
import { brl, calcISTMensal, diffHoras, severidadeDef } from "@/lib/imr";
import { SEVERIDADES, type SeveridadeChamado, type StatusChamado } from "@/lib/types";

export const Route = createFileRoute("/chamados")({
  head: () => ({ meta: [{ title: "Chamados Técnicos (IST) - SGT AGU" }] }),
  component: ChamadosPage,
});

const STATUS_LABEL: Record<StatusChamado, string> = {
  ABERTO: "Aberto",
  RESPONDIDO: "Respondido",
  SOLUCIONADO: "Solucionado",
  CANCELADO: "Cancelado",
};

function ChamadosPage() {
  const chamados = useStore((s) => s.chamados);
  const contratos = useStore((s) => s.contratos);
  const [novoAberto, setNovoAberto] = useState(false);
  const [detalheId, setDetalheId] = useState<string | null>(null);

  const ist = useMemo(() => calcISTMensal(chamados), [chamados]);
  const totalGlosaIST = useMemo(
    () => chamados.reduce((acc, c) => acc + (c.glosaIST ?? 0), 0),
    [chamados],
  );

  const detalhe = chamados.find((c) => c.id === detalheId);

  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel", to: "/" }, { label: "Chamados Técnicos" }]} />
      <section className="gov-container pb-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl">Chamados Técnicos (IST)</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Prazos por severidade (S1-S5) do TR 7.1.3. Timestamps de resposta e solução são automáticos ao clicar.
            </p>
          </div>
          <button className="gov-btn-primary" onClick={() => setNovoAberto(true)} disabled={contratos.length === 0}>
            <Plus className="h-4 w-4" /> Novo chamado
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <div className="gov-card"><div className="text-sm text-muted-foreground">Chamados no período</div><div className="text-3xl font-bold text-gov-blue-dark mt-1">{chamados.length}</div></div>
          <div className="gov-card"><div className="text-sm text-muted-foreground">Solucionados</div><div className="text-3xl font-bold text-gov-blue-dark mt-1">{ist.total}</div></div>
          <div className="gov-card border-gov-success/40"><div className="text-sm text-muted-foreground">IST (conformidade)</div><div className={`text-3xl font-bold mt-1 ${ist.pct >= 95 ? "text-gov-success" : ist.pct >= 80 ? "text-gov-yellow" : "text-gov-danger"}`}>{ist.pct}%</div><div className="text-xs text-muted-foreground mt-1">meta 100%</div></div>
          <div className="gov-card border-gov-danger/40"><div className="text-sm text-muted-foreground">Glosa IST</div><div className="text-3xl font-bold text-gov-danger mt-1">{brl(totalGlosaIST)}</div></div>
        </div>

        <div className="gov-card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-gov-blue-dark text-left">
              <tr>
                <th className="px-4 py-2 font-semibold">Nº</th>
                <th className="px-4 py-2 font-semibold">Severidade</th>
                <th className="px-4 py-2 font-semibold">Título</th>
                <th className="px-4 py-2 font-semibold">Unidade</th>
                <th className="px-4 py-2 font-semibold">Abertura</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold text-right">Glosa</th>
                <th className="px-4 py-2 font-semibold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {chamados.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Nenhum chamado registrado.</td></tr>
              )}
              {chamados.map((c) => {
                const def = severidadeDef(c.severidade);
                const horas = c.solucionadoEm ? diffHoras(c.abertoEm, c.solucionadoEm) : diffHoras(c.abertoEm, new Date().toISOString());
                const excedido = horas > def.prazoSolucaoH;
                return (
                  <tr key={c.id} className="hover:bg-accent/40">
                    <td className="px-4 py-2 font-semibold text-gov-blue-dark">{c.numero}</td>
                    <td className="px-4 py-2"><GovTag tone={c.severidade === "S1" || c.severidade === "S2" ? "danger" : c.severidade === "S3" ? "warning" : "info"}>{c.severidade}</GovTag></td>
                    <td className="px-4 py-2">{c.titulo}</td>
                    <td className="px-4 py-2 text-muted-foreground">{c.unidade}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{new Date(c.abertoEm).toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-2">
                      <GovTag tone={c.status === "SOLUCIONADO" ? (c.conforme ? "success" : "danger") : c.status === "RESPONDIDO" ? "warning" : c.status === "CANCELADO" ? "neutral" : (excedido ? "danger" : "info")}>
                        {STATUS_LABEL[c.status]}
                      </GovTag>
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-gov-danger">{c.glosaIST ? brl(c.glosaIST) : "-"}</td>
                    <td className="px-4 py-2 text-right">
                      <button className="text-sm text-gov-blue font-semibold hover:underline" onClick={() => setDetalheId(c.id)}>Abrir</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {novoAberto && <NovoChamadoModal onClose={() => setNovoAberto(false)} />}
      {detalhe && <DetalheChamadoModal id={detalhe.id} onClose={() => setDetalheId(null)} />}
    </>
  );
}

function NovoChamadoModal({ onClose }: { onClose: () => void }) {
  const contratos = useStore((s) => s.contratos);
  const unidades = useStore((s) => s.unidades);
  const [contratoId, setContratoId] = useState(contratos[0]?.id ?? "");
  const [severidade, setSeveridade] = useState<SeveridadeChamado>("S3");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [unidade, setUnidade] = useState(unidades[0]?.nome ?? "");
  const [valorMensalOS, setValorMensalOS] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !contratoId) return;
    store.addChamado({
      contratoId, severidade,
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      unidade,
      valorMensalOS: parseFloat(valorMensalOS.replace(",", ".")) || 0,
    });
    onClose();
  }

  const def = severidadeDef(severidade);

  return (
    <Modal titulo="Novo chamado técnico" onClose={onClose}>
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="gov-label">Contrato</label>
          <select className="gov-input" value={contratoId} onChange={(e) => setContratoId(e.target.value)}>
            {contratos.map((c) => <option key={c.id} value={c.id}>Nº {c.numero} - {c.fornecedorRazaoSocial}</option>)}
          </select>
        </div>
        <div>
          <label className="gov-label">Severidade</label>
          <select className="gov-input" value={severidade} onChange={(e) => setSeveridade(e.target.value as SeveridadeChamado)}>
            {SEVERIDADES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <p className="text-xs text-muted-foreground mt-1">Resposta ≤ {def.prazoRespostaH}h · Solução ≤ {def.prazoSolucaoH}h · Penalidade {def.penalidadeHoraPct}%/h</p>
        </div>
        <div>
          <label className="gov-label">Unidade</label>
          <select className="gov-input" value={unidade} onChange={(e) => setUnidade(e.target.value)}>
            {unidades.map((u) => <option key={u.id} value={u.nome}>{u.nome}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="gov-label">Título</label>
          <input className="gov-input" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
        </div>
        <div className="md:col-span-2">
          <label className="gov-label">Descrição</label>
          <textarea className="gov-input" rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </div>
        <div>
          <label className="gov-label">Valor mensal da OS (R$) - base IST</label>
          <input className="gov-input" placeholder="0,00" value={valorMensalOS} onChange={(e) => setValorMensalOS(e.target.value)} required />
        </div>
        <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t border-border mt-2">
          <button type="button" className="gov-btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="gov-btn-primary"><Plus className="h-4 w-4" /> Abrir chamado</button>
        </div>
      </form>
    </Modal>
  );
}

function DetalheChamadoModal({ id, onClose }: { id: string; onClose: () => void }) {
  const c = useStore((s) => s.chamados.find((x) => x.id === id));
  if (!c) return null;
  const def = severidadeDef(c.severidade);
  const horas = c.solucionadoEm ? diffHoras(c.abertoEm, c.solucionadoEm) : diffHoras(c.abertoEm, new Date().toISOString());

  return (
    <Modal titulo={`Chamado ${c.numero}`} onClose={onClose}>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2 flex flex-wrap items-center gap-2">
          <GovTag tone={c.severidade === "S1" || c.severidade === "S2" ? "danger" : c.severidade === "S3" ? "warning" : "info"}>{def.label}</GovTag>
          <GovTag tone={c.status === "SOLUCIONADO" ? (c.conforme ? "success" : "danger") : "info"}>{STATUS_LABEL[c.status]}</GovTag>
        </div>
        <Info label="Título">{c.titulo}</Info>
        <Info label="Unidade">{c.unidade}</Info>
        <Info label="Aberto em">{new Date(c.abertoEm).toLocaleString("pt-BR")}</Info>
        <Info label="Respondido em">{c.respondidoEm ? new Date(c.respondidoEm).toLocaleString("pt-BR") : "-"}</Info>
        <Info label="Solucionado em">{c.solucionadoEm ? new Date(c.solucionadoEm).toLocaleString("pt-BR") : "-"}</Info>
        <Info label="Horas decorridas">{horas.toFixed(1)}h / limite {def.prazoSolucaoH}h</Info>
        <Info label="Valor mensal OS (base)">{brl(c.valorMensalOS)}</Info>
        <Info label="Glosa IST">{c.glosaIST ? <span className="text-gov-danger font-semibold">{brl(c.glosaIST)}</span> : "-"}</Info>
        {c.descricao && <div className="md:col-span-2"><div className="text-xs font-semibold uppercase text-muted-foreground">Descrição</div><div className="text-sm mt-1">{c.descricao}</div></div>}

        <div className="md:col-span-2 flex flex-wrap gap-2 pt-3 border-t border-border">
          {c.status === "ABERTO" && (
            <button className="gov-btn-primary" onClick={() => store.moverChamado(c.id, "RESPONDIDO")}><MessageCircleReply className="h-4 w-4" /> Marcar respondido</button>
          )}
          {(c.status === "ABERTO" || c.status === "RESPONDIDO") && (
            <button className="gov-btn-primary" onClick={() => store.moverChamado(c.id, "SOLUCIONADO")}><CheckCircle2 className="h-4 w-4" /> Marcar solucionado</button>
          )}
          {c.status !== "SOLUCIONADO" && c.status !== "CANCELADO" && (
            <button className="gov-btn-secondary" onClick={() => store.moverChamado(c.id, "CANCELADO")}><Ban className="h-4 w-4" /> Cancelar</button>
          )}
        </div>
      </div>
    </Modal>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div><div className="text-xs font-semibold uppercase text-muted-foreground">{label}</div><div className="text-sm mt-1">{children ?? "-"}</div></div>);
}

function Modal({ titulo, onClose, children }: { titulo: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start md:items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-xl border border-border w-full max-w-3xl shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-lg text-gov-blue-dark">{titulo}</h3>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-md" aria-label="Fechar"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
