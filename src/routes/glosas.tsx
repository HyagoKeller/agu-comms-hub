import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { GovTag } from "@/components/StatusTag";
import { store, useStore } from "@/lib/store";
import { brl } from "@/lib/imr";
import type { RelatorioIAR } from "@/lib/types";

export const Route = createFileRoute("/glosas")({
  head: () => ({ meta: [{ title: "Painel de Glosas (IMR) - SGT AGU" }] }),
  component: GlosasPage,
});

function toISODate(d: Date) { return d.toISOString().slice(0, 10); }

function GlosasPage() {
  const contratos = useStore((s) => s.contratos);
  const ordens = useStore((s) => s.ordensServico);
  const chamados = useStore((s) => s.chamados);
  const iars = useStore((s) => s.relatoriosIAR);
  const [contratoId, setContratoId] = useState(contratos[0]?.id ?? "");

  const hoje = new Date();
  const defDe = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);
  const [de, setDe] = useState(toISODate(defDe));
  const [ate, setAte] = useState(toISODate(hoje));

  const inRange = (iso?: string) => {
    if (!iso) return false;
    const t = new Date(iso).getTime();
    return t >= new Date(de + "T00:00:00").getTime() && t <= new Date(ate + "T23:59:59").getTime();
  };

  const dados = useMemo(() => {
    const os = ordens.filter((o) => o.contratoId === contratoId && inRange(o.dataEmissao));
    const ch = chamados.filter((c) => c.contratoId === contratoId && inRange(c.abertoEm));
    const ir = iars.filter((i) => i.contratoId === contratoId && (inRange(i.dataUpload) || inRange(i.criadoEm)));
    const glosaIAE = os.reduce((a, o) => a + (o.glosaFinal ?? 0), 0);
    const glosaIST = ch.reduce((a, c) => a + (c.glosaIST ?? 0), 0);
    const glosaIAR = ir.reduce((a, r) => a + (r.glosaIAR ?? 0), 0);
    return { os, ch, ir, glosaIAE, glosaIST, glosaIAR, total: glosaIAE + glosaIST + glosaIAR };
  }, [ordens, chamados, iars, contratoId, de, ate]);

  const contrato = contratos.find((c) => c.id === contratoId);
  const valorMensal = contrato?.valorMensalTotal ?? 0;
  const valorLiquido = Math.max(0, valorMensal - dados.total);

  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel", to: "/" }, { label: "Painel de Glosas" }]} />
      <section className="gov-container pb-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl">Painel de Glosas (IMR)</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Consolidação de IAE (ordens de serviço) + IST (chamados técnicos) + IAR (relatório semestral) por contrato.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="gov-label">De</label>
              <input type="date" className="gov-input" value={de} onChange={(e) => setDe(e.target.value)} />
            </div>
            <div>
              <label className="gov-label">Até</label>
              <input type="date" className="gov-input" value={ate} onChange={(e) => setAte(e.target.value)} />
            </div>
            <div>
              <label className="gov-label">Contrato</label>
              <select className="gov-input" value={contratoId} onChange={(e) => setContratoId(e.target.value)}>
                {contratos.map((c) => <option key={c.id} value={c.id}>Nº {c.numero}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="gov-card"><div className="text-sm text-muted-foreground">Glosa IAE (OS)</div><div className="text-2xl font-bold text-gov-danger mt-1">{brl(dados.glosaIAE)}</div><div className="text-xs text-muted-foreground mt-1">{dados.os.length} OS</div></div>
          <div className="gov-card"><div className="text-sm text-muted-foreground">Glosa IST (chamados)</div><div className="text-2xl font-bold text-gov-danger mt-1">{brl(dados.glosaIST)}</div><div className="text-xs text-muted-foreground mt-1">{dados.ch.length} chamados</div></div>
          <div className="gov-card"><div className="text-sm text-muted-foreground">Glosa IAR (semestral)</div><div className="text-2xl font-bold text-gov-danger mt-1">{brl(dados.glosaIAR)}</div><div className="text-xs text-muted-foreground mt-1">{dados.ir.length} relatórios</div></div>
          <div className="gov-card border-gov-blue/40"><div className="text-sm text-muted-foreground">Glosa total do período</div><div className="text-3xl font-bold text-gov-blue-dark mt-1">{brl(dados.total)}</div></div>
        </div>

        <div className="gov-card mb-6">
          <h2 className="text-lg mb-3">Valor contratado × valor líquido</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <Metric label="Valor mensal contratado" value={brl(valorMensal)} />
            <Metric label="Glosas apuradas" value={brl(dados.total)} tone="danger" />
            <Metric label="Valor líquido a pagar" value={brl(valorLiquido)} tone="success" />
          </div>
        </div>

        <div className="gov-card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg">Relatório Semestral (IAR)</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-gov-blue-dark text-left">
              <tr>
                <th className="px-4 py-2 font-semibold">Período</th>
                <th className="px-4 py-2 font-semibold">Prazo</th>
                <th className="px-4 py-2 font-semibold">Enviado em</th>
                <th className="px-4 py-2 font-semibold">Atraso (dias úteis)</th>
                <th className="px-4 py-2 font-semibold text-right">% Glosa</th>
                <th className="px-4 py-2 font-semibold text-right">Glosa</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {dados.ir.length === 0 && <tr><td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">Nenhum relatório cadastrado.</td></tr>}
              {dados.ir.map((r) => <LinhaIAR key={r.id} r={r} />)}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function LinhaIAR({ r }: { r: RelatorioIAR }) {
  const [uploading, setUploading] = useState(false);
  const [arquivo, setArquivo] = useState("");
  const [totalChamadas, setTotalChamadas] = useState("");

  function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!arquivo.trim()) return;
    store.uploadRelatorioIAR(r.id, {
      arquivoNome: arquivo.trim(),
      totalChamadas: Number(totalChamadas) || undefined,
    });
    setUploading(false); setArquivo(""); setTotalChamadas("");
  }

  const tone = r.status === "ENTREGUE" ? "success" : r.status === "ATRASADO" ? "warning" : r.status === "INEXECUCAO" ? "danger" : "info";

  return (
    <>
      <tr>
        <td className="px-4 py-2 font-semibold">{r.periodo}</td>
        <td className="px-4 py-2 text-xs">{r.prazoEntrega}</td>
        <td className="px-4 py-2 text-xs">{r.dataUpload ? new Date(r.dataUpload).toLocaleString("pt-BR") : "-"}</td>
        <td className="px-4 py-2 text-right font-mono">{r.diasUteisAtraso ?? 0}</td>
        <td className="px-4 py-2 text-right">{(r.percentualGlosa ?? 0).toFixed(1)}%</td>
        <td className="px-4 py-2 text-right font-semibold text-gov-danger">{r.glosaIAR ? brl(r.glosaIAR) : "-"}</td>
        <td className="px-4 py-2"><GovTag tone={tone}>{r.status}</GovTag></td>
        <td className="px-4 py-2 text-right">
          {r.status === "PENDENTE" && (
            <button className="gov-btn-secondary text-xs py-1 h-8" onClick={() => setUploading(true)}>
              <Upload className="h-3.5 w-3.5" /> Enviar
            </button>
          )}
          {r.arquivoNome && <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><FileSpreadsheet className="h-3.5 w-3.5" /> {r.arquivoNome}</span>}
        </td>
      </tr>
      {uploading && (
        <tr className="bg-muted/30">
          <td colSpan={8} className="px-4 py-3">
            <form onSubmit={upload} className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[200px]">
                <label className="gov-label">Nome do arquivo (upload)</label>
                <input className="gov-input" placeholder="relatorio_semestral_2026S1.xlsx" value={arquivo} onChange={(e) => setArquivo(e.target.value)} />
              </div>
              <div>
                <label className="gov-label">Total de chamadas</label>
                <input className="gov-input" placeholder="12345" value={totalChamadas} onChange={(e) => setTotalChamadas(e.target.value)} />
              </div>
              <button type="submit" className="gov-btn-primary"><Upload className="h-4 w-4" /> Registrar entrega</button>
              <button type="button" className="gov-btn-secondary" onClick={() => setUploading(false)}>Cancelar</button>
              <p className="w-full text-xs text-muted-foreground">A data de entrega é capturada no clique. O atraso é comparado ao prazo contratual - sem digitação manual de data.</p>
            </form>
          </td>
        </tr>
      )}
    </>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "danger" | "success" }) {
  const color = tone === "danger" ? "text-gov-danger" : tone === "success" ? "text-gov-success" : "text-gov-blue-dark";
  return (
    <div className="rounded-md border border-border p-4">
      <div className="text-xs uppercase font-semibold text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
