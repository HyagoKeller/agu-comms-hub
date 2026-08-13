import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Upload, FileSpreadsheet, Plus, CheckCircle2, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { GovBreadcrumb } from "@/components/GovHeader";
import { GovTag } from "@/components/StatusTag";
import { store, useStore } from "@/lib/store";
import { brl } from "@/lib/imr";
import { auth } from "@/lib/auth";
import { ORIGENS_GLOSA, type GlosaManual, type OrigemGlosa, type RelatorioIAR } from "@/lib/types";

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
  const manuais = useStore((s) => s.glosasManuais);
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
    const mn = manuais.filter((g) => g.contratoId === contratoId && g.status !== "CANCELADA" && inRange(g.registradoEm));
    const glosaManual = mn.reduce((a, g) => a + g.valor, 0);
    return { os, ch, ir, mn, glosaIAE, glosaIST, glosaIAR, glosaManual, total: glosaIAE + glosaIST + glosaIAR + glosaManual };
  }, [ordens, chamados, iars, manuais, contratoId, de, ate]);

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
          <div className="gov-card"><div className="text-sm text-muted-foreground">Glosas lançadas manualmente</div><div className="text-2xl font-bold text-gov-danger mt-1">{brl(dados.glosaManual)}</div><div className="text-xs text-muted-foreground mt-1">{dados.mn.length} lançamentos</div></div>
          <div className="gov-card border-gov-blue/40"><div className="text-sm text-muted-foreground">Glosa total do período</div><div className="text-3xl font-bold text-gov-blue-dark mt-1">{brl(dados.total)}</div></div>
        </div>

        <GlosasManuaisCard contratoId={contratoId} lista={dados.mn} />

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

function GlosasManuaisCard({ contratoId, lista }: { contratoId: string; lista: GlosaManual[] }) {
  const [aberto, setAberto] = useState(false);
  const hoje = new Date();
  const [origem, setOrigem] = useState<OrigemGlosa>("OUTRA");
  const [competencia, setCompetencia] = useState(`${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`);
  const [referencia, setReferencia] = useState("");
  const [descricao, setDescricao] = useState("");
  const [baseCalculo, setBaseCalculo] = useState("");
  const [valor, setValor] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = parseFloat(valor.replace(/\./g, "").replace(",", "."));
    if (!contratoId || !descricao.trim() || isNaN(v) || v <= 0) return;
    store.addGlosaManual({
      contratoId,
      origem,
      competencia,
      referencia: referencia.trim() || undefined,
      descricao: descricao.trim(),
      baseCalculo: baseCalculo.trim() || undefined,
      valor: v,
      registradoPor: auth.current?.email ?? "sistema@agu.gov.br",
    });
    setReferencia(""); setDescricao(""); setBaseCalculo(""); setValor("");
    setAberto(false);
  }

  return (
    <div className="gov-card mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-lg">Cadastro de glosas</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-3xl">
            As glosas de IAE, IST e IAR são apuradas automaticamente nos módulos{" "}
            <Link to="/ordens-servico" className="text-gov-blue underline">Ordens de Serviço</Link>,{" "}
            <Link to="/chamados" className="text-gov-blue underline">Chamados Técnicos</Link> e no quadro do IAR abaixo.
            Use este cadastro para lançar glosas apuradas pela fiscalização fora desses fluxos (ex.: IDT, descontos de faturamento).
          </p>
        </div>
        <button className="gov-btn-primary" onClick={() => setAberto((v) => !v)} disabled={!contratoId}>
          <Plus className="h-4 w-4" /> Cadastrar glosa
        </button>
      </div>

      {aberto && (
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-3 border border-border rounded-md p-4 bg-muted/30 mb-4">
          <div>
            <label className="gov-label">Origem / indicador</label>
            <select className="gov-input" value={origem} onChange={(e) => setOrigem(e.target.value as OrigemGlosa)}>
              {ORIGENS_GLOSA.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="gov-label">Competência</label>
            <input type="month" className="gov-input" value={competencia} onChange={(e) => setCompetencia(e.target.value)} />
          </div>
          <div>
            <label className="gov-label">Referência (OS, chamado, unidade)</label>
            <input className="gov-input" value={referencia} onChange={(e) => setReferencia(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="gov-label">Descrição da ocorrência</label>
            <input className="gov-input" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
          </div>
          <div>
            <label className="gov-label">Valor da glosa (R$)</label>
            <input className="gov-input" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} required />
          </div>
          <div className="md:col-span-3">
            <label className="gov-label">Memória de cálculo / fundamento</label>
            <input className="gov-input" placeholder="Ex.: 0,5% x R$ 30.972,28 x 3 dias - item 7.2 do TR" value={baseCalculo} onChange={(e) => setBaseCalculo(e.target.value)} />
          </div>
          <div className="md:col-span-3 flex justify-end gap-2">
            <button type="button" className="gov-btn-secondary" onClick={() => setAberto(false)}>Cancelar</button>
            <button type="submit" className="gov-btn-primary"><Plus className="h-4 w-4" /> Lançar glosa</button>
          </div>
          <p className="md:col-span-3 text-xs text-muted-foreground">
            A data e o autor do lançamento são capturados automaticamente e registrados na auditoria.
          </p>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-gov-blue-dark text-left">
            <tr>
              <th className="px-3 py-2 font-semibold">Nº</th>
              <th className="px-3 py-2 font-semibold">Origem</th>
              <th className="px-3 py-2 font-semibold">Competência</th>
              <th className="px-3 py-2 font-semibold">Descrição</th>
              <th className="px-3 py-2 font-semibold text-right">Valor</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lista.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">Nenhuma glosa lançada manualmente no período.</td></tr>
            )}
            {lista.map((g) => (
              <tr key={g.id}>
                <td className="px-3 py-2 font-semibold">{g.numero}</td>
                <td className="px-3 py-2"><GovTag tone="neutral">{g.origem}</GovTag></td>
                <td className="px-3 py-2 text-xs">{g.competencia}</td>
                <td className="px-3 py-2">
                  {g.descricao}
                  {g.referencia && <span className="text-xs text-muted-foreground"> · ref. {g.referencia}</span>}
                  {g.baseCalculo && <div className="text-xs text-muted-foreground">{g.baseCalculo}</div>}
                  <div className="text-xs text-muted-foreground">por {g.registradoPor} em {new Date(g.registradoEm).toLocaleString("pt-BR")}</div>
                </td>
                <td className="px-3 py-2 text-right font-semibold text-gov-danger">{brl(g.valor)}</td>
                <td className="px-3 py-2"><GovTag tone={g.status === "HOMOLOGADA" ? "success" : g.status === "CANCELADA" ? "danger" : "warning"}>{g.status}</GovTag></td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  {g.status === "LANCADA" && (
                    <button className="gov-btn-secondary text-xs py-1 h-8 mr-2" onClick={() => store.homologarGlosaManual(g.id, auth.current?.email ?? "sistema@agu.gov.br")}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Homologar
                    </button>
                  )}
                  <button className="gov-btn-secondary text-xs py-1 h-8" onClick={() => store.removeGlosaManual(g.id)} aria-label="Excluir glosa">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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
