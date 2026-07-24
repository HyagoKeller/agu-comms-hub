import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Play, CheckCircle2, FileCheck2, Ban, Wallet, X } from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { GovTag } from "@/components/StatusTag";
import { store, useStore } from "@/lib/store";
import { brl, faixaIAE } from "@/lib/imr";
import { auth } from "@/lib/auth";
import {
  STATUS_OS_LABELS, TIPOS_OS, type OrdemServico, type StatusOS, type TipoOS,
} from "@/lib/types";

export const Route = createFileRoute("/ordens-servico")({
  head: () => ({ meta: [{ title: "Ordens de Serviço — SGT AGU" }] }),
  component: OrdensServico,
});

const COLUNAS: StatusOS[] = [
  "ABERTA",
  "EM_EXECUCAO",
  "RECEBIMENTO_PROVISORIO",
  "RECEBIMENTO_DEFINITIVO",
  "FATURADA",
];

function OrdensServico() {
  const ordens = useStore((s) => s.ordensServico);
  const contratos = useStore((s) => s.contratos);
  const [novaAberta, setNovaAberta] = useState(false);
  const [detalheId, setDetalheId] = useState<string | null>(null);

  const totalGlosa = useMemo(
    () => ordens.reduce((acc, o) => acc + (o.glosaFinal ?? 0), 0),
    [ordens]
  );

  const porStatus = useMemo(() => {
    const acc: Record<StatusOS, OrdemServico[]> = {
      ABERTA: [], EM_EXECUCAO: [], RECEBIMENTO_PROVISORIO: [],
      RECEBIMENTO_DEFINITIVO: [], FATURADA: [], CANCELADA: [],
    };
    ordens.forEach((o) => acc[o.status].push(o));
    return acc;
  }, [ordens]);

  const detalhe = ordens.find((o) => o.id === detalheId);

  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel", to: "/" }, { label: "Ordens de Serviço" }]} />
      <section className="gov-container pb-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl">Ordens de Serviço</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Fluxo de OS conforme cláusulas de execução do contrato. O IAE e a glosa são calculados automaticamente ao concluir.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Glosa acumulada (IAE)</div>
              <div className="text-xl font-bold text-gov-danger">{brl(totalGlosa)}</div>
            </div>
            <button className="gov-btn-primary" onClick={() => setNovaAberta(true)} disabled={contratos.length === 0}>
              <Plus className="h-4 w-4" /> Nova OS
            </button>
          </div>
        </div>

        {contratos.length === 0 && (
          <div className="gov-card mb-4 text-sm">
            <GovTag tone="warning">Atenção</GovTag>
            <span className="ml-2">Cadastre um contrato em /contratos antes de emitir Ordens de Serviço.</span>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {COLUNAS.map((s) => (
            <div key={s} className="gov-card p-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gov-blue-dark">
                  {STATUS_OS_LABELS[s]}
                </span>
                <GovTag tone="neutral">{porStatus[s].length}</GovTag>
              </div>
              <ul className="space-y-2">
                {porStatus[s].map((o) => (
                  <li key={o.id}>
                    <button
                      onClick={() => setDetalheId(o.id)}
                      className="block w-full text-left rounded-md border border-border bg-card px-3 py-2 hover:border-gov-blue transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gov-blue-dark text-sm">{o.numero}</span>
                        {o.iaeDias != null && o.iaeDias > 5 && (
                          <GovTag tone={faixaIAE(o.iaeDias) === "GRAVE" ? "danger" : "warning"}>
                            +{o.iaeDias}d
                          </GovTag>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {TIPOS_OS.find((t) => t.value === o.tipo)?.label} · {o.descricao}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Limite: {o.dataLimite} · {brl(o.valorOS)}
                      </div>
                      {(o.glosaFinal ?? 0) > 0 && (
                        <div className="text-xs font-semibold text-gov-danger mt-1">
                          Glosa: {brl(o.glosaFinal!)}
                        </div>
                      )}
                    </button>
                  </li>
                ))}
                {porStatus[s].length === 0 && (
                  <li className="text-xs text-muted-foreground italic px-1">Vazio</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {novaAberta && <NovaOSModal onClose={() => setNovaAberta(false)} />}
      {detalhe && <DetalheOSModal os={detalhe} onClose={() => setDetalheId(null)} />}
    </>
  );
}

function NovaOSModal({ onClose }: { onClose: () => void }) {
  const contratos = useStore((s) => s.contratos);
  const [contratoId, setContratoId] = useState(contratos[0]?.id ?? "");
  const [tipo, setTipo] = useState<TipoOS>("INSTALACAO");
  const tipoDef = TIPOS_OS.find((t) => t.value === tipo)!;
  const [descricao, setDescricao] = useState("");
  const [unidades, setUnidades] = useState("");
  const [prazoDias, setPrazoDias] = useState(tipoDef.tcePadraoDias);
  const [valorOS, setValorOS] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!contratoId || !descricao.trim() || !valorOS) return;
    store.addOS({
      contratoId,
      tipo,
      descricao: descricao.trim(),
      unidadesAlvo: unidades.split(",").map((u) => u.trim()).filter(Boolean),
      prazoDias: Number(prazoDias) || tipoDef.tcePadraoDias,
      valorOS: parseFloat(valorOS.replace(",", ".")) || 0,
    });
    onClose();
  }

  return (
    <Modal onClose={onClose} titulo="Nova Ordem de Serviço">
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="gov-label">Contrato</label>
          <select className="gov-input" value={contratoId} onChange={(e) => setContratoId(e.target.value)}>
            {contratos.map((c) => <option key={c.id} value={c.id}>Nº {c.numero} — {c.fornecedorRazaoSocial}</option>)}
          </select>
        </div>
        <div>
          <label className="gov-label">Tipo de OS</label>
          <select
            className="gov-input"
            value={tipo}
            onChange={(e) => {
              const t = e.target.value as TipoOS;
              setTipo(t);
              setPrazoDias(TIPOS_OS.find((x) => x.value === t)!.tcePadraoDias);
            }}
          >
            {TIPOS_OS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="gov-label">Prazo contratual (TCE) — dias</label>
          <input className="gov-input" type="number" min={1} value={prazoDias} onChange={(e) => setPrazoDias(Number(e.target.value))} />
        </div>
        <div className="md:col-span-2">
          <label className="gov-label">Descrição / Justificativa</label>
          <textarea className="gov-input" rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
        </div>
        <div className="md:col-span-2">
          <label className="gov-label">Unidades alvo (separadas por vírgula)</label>
          <input className="gov-input" value={unidades} onChange={(e) => setUnidades(e.target.value)} />
        </div>
        <div>
          <label className="gov-label">Valor da OS (R$) — base da glosa</label>
          <input className="gov-input" placeholder="0,00" value={valorOS} onChange={(e) => setValorOS(e.target.value)} required />
        </div>
        <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t border-border mt-2">
          <button type="button" className="gov-btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="gov-btn-primary" type="submit"><Plus className="h-4 w-4" /> Emitir OS</button>
        </div>
        <p className="md:col-span-2 text-xs text-muted-foreground">
          A data de emissão e o prazo-limite serão registrados automaticamente no momento do envio (Categoria A — evento interno da AGU).
        </p>
      </form>
    </Modal>
  );
}

function DetalheOSModal({ os, onClose }: { os: OrdemServico; onClose: () => void }) {
  const contrato = useStore((s) => s.contratos.find((c) => c.id === os.contratoId));
  const [override, setOverride] = useState("");
  const [justificativa, setJustificativa] = useState("");

  function marcarInicio() { store.moverOS(os.id, "EM_EXECUCAO"); }
  function concluir() { store.concluirOS(os.id); }
  function recebimentoDefinitivo() { store.moverOS(os.id, "RECEBIMENTO_DEFINITIVO"); }
  function faturar() { store.moverOS(os.id, "FATURADA"); }

  function aplicarOverride() {
    const v = parseFloat(override.replace(",", "."));
    if (isNaN(v) || !justificativa.trim()) return;
    const user = auth.current();
    store.overrideGlosaOS(os.id, {
      valorOriginal: os.glosaCalculada ?? 0,
      valorAjustado: v,
      justificativa: justificativa.trim(),
      ator: user?.email ?? "sistema@agu.gov.br",
      ts: new Date().toISOString(),
    });
    setOverride(""); setJustificativa("");
  }

  return (
    <Modal onClose={onClose} titulo={`Ordem de Serviço ${os.numero}`}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2 flex flex-wrap items-center gap-2">
          <GovTag tone="info">{STATUS_OS_LABELS[os.status]}</GovTag>
          <GovTag tone="neutral">{TIPOS_OS.find((t) => t.value === os.tipo)?.label}</GovTag>
          {contrato && <span className="text-xs text-muted-foreground">Contrato Nº {contrato.numero}</span>}
        </div>
        <div className="md:col-span-2">
          <div className="text-xs font-semibold uppercase text-muted-foreground">Descrição</div>
          <div className="text-sm mt-1">{os.descricao}</div>
        </div>
        <Info label="Emissão">{new Date(os.dataEmissao).toLocaleString("pt-BR")}</Info>
        <Info label="Prazo (TCE)">{os.prazoDias} dias · limite {os.dataLimite}</Info>
        <Info label="Início da execução">{os.dataInicioExecucao ? new Date(os.dataInicioExecucao).toLocaleString("pt-BR") : "—"}</Info>
        <Info label="Conclusão (TEC)">{os.dataConclusao ? new Date(os.dataConclusao).toLocaleString("pt-BR") : "—"}</Info>
        <Info label="Unidades alvo">{os.unidadesAlvo.join(", ") || "—"}</Info>
        <Info label="Valor da OS">{brl(os.valorOS)}</Info>
        {os.iaeDias != null && (
          <>
            <Info label="IAE (dias)">
              <GovTag tone={faixaIAE(os.iaeDias) === "OK" ? "success" : faixaIAE(os.iaeDias) === "MODERADA" ? "warning" : "danger"}>
                {os.iaeDias >= 0 ? `+${os.iaeDias}` : os.iaeDias} dia(s)
              </GovTag>
            </Info>
            <Info label="Glosa calculada">
              <span className="text-gov-danger font-semibold">{brl(os.glosaCalculada ?? 0)}</span>
              {os.override && (
                <div className="text-xs text-muted-foreground mt-1">
                  Ajustada para <strong>{brl(os.glosaFinal ?? 0)}</strong> por {os.override.ator} — {os.override.justificativa}
                </div>
              )}
            </Info>
          </>
        )}

        <div className="md:col-span-2 flex flex-wrap gap-2 pt-3 border-t border-border">
          {os.status === "ABERTA" && (
            <button className="gov-btn-primary" onClick={marcarInicio}><Play className="h-4 w-4" /> Iniciar execução</button>
          )}
          {(os.status === "ABERTA" || os.status === "EM_EXECUCAO") && (
            <button className="gov-btn-primary" onClick={concluir}><CheckCircle2 className="h-4 w-4" /> Marcar como concluída</button>
          )}
          {os.status === "RECEBIMENTO_PROVISORIO" && (
            <button className="gov-btn-primary" onClick={recebimentoDefinitivo}><FileCheck2 className="h-4 w-4" /> Recebimento definitivo</button>
          )}
          {os.status === "RECEBIMENTO_DEFINITIVO" && (
            <button className="gov-btn-primary" onClick={faturar}><Wallet className="h-4 w-4" /> Liberar faturamento</button>
          )}
          {os.status !== "CANCELADA" && os.status !== "FATURADA" && (
            <button className="gov-btn-secondary" onClick={() => store.moverOS(os.id, "CANCELADA")}>
              <Ban className="h-4 w-4" /> Cancelar
            </button>
          )}
        </div>

        {os.glosaCalculada != null && os.glosaCalculada > 0 && (
          <div className="md:col-span-2 border-t border-border pt-4">
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              Ajuste de glosa (requer justificativa — registra auditoria)
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              <input className="gov-input" placeholder="Novo valor R$" value={override} onChange={(e) => setOverride(e.target.value)} />
              <input className="gov-input md:col-span-2" placeholder="Justificativa" value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
            </div>
            <button className="gov-btn-secondary mt-2" onClick={aplicarOverride}>Aplicar ajuste</button>
          </div>
        )}
      </div>
    </Modal>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase text-muted-foreground">{label}</div>
      <div className="text-sm mt-1">{children ?? "—"}</div>
    </div>
  );
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
