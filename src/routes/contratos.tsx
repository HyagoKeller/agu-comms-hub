import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, ShieldAlert, CalendarClock, TrendingUp, Paperclip, Building2, Users } from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { GovTag } from "@/components/StatusTag";
import { store, useStore, uid } from "@/lib/store";
import { alertasContrato, brl } from "@/lib/imr";
import type { Contrato } from "@/lib/types";

export const Route = createFileRoute("/contratos")({
  head: () => ({ meta: [{ title: "Contratos — SGT AGU" }] }),
  component: Contratos,
});

function Contratos() {
  const contratos = useStore((s) => s.contratos);
  const [selecionadoId, setSelecionadoId] = useState<string | null>(contratos[0]?.id ?? null);
  const selecionado = contratos.find((c) => c.id === selecionadoId) ?? contratos[0];

  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel", to: "/" }, { label: "Contratos" }]} />
      <section className="gov-container pb-10">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl">Gestão de Contratos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Contratos administrativos vigentes, garantia, reajuste e fiscalização (Lei 14.133/2021).
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="gov-card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/40 text-xs font-semibold text-gov-blue-dark uppercase tracking-wide">
              Contratos ({contratos.length})
            </div>
            <ul className="divide-y divide-border">
              {contratos.map((c) => {
                const alertas = alertasContrato(c);
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setSelecionadoId(c.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-accent ${selecionado?.id === c.id ? "bg-accent" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-gov-blue-dark">Nº {c.numero}</span>
                        <GovTag tone={c.status === "ATIVO" ? "success" : c.status === "SUSPENSO" ? "warning" : "neutral"}>
                          {c.status}
                        </GovTag>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.fornecedorRazaoSocial}</div>
                      {alertas.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-gov-warning">
                          <ShieldAlert className="h-3 w-3" /> {alertas.length} alerta(s)
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
              {contratos.length === 0 && (
                <li className="px-4 py-6 text-sm text-muted-foreground">Nenhum contrato cadastrado.</li>
              )}
            </ul>
          </aside>

          {selecionado ? <ContratoFicha contrato={selecionado} /> : (
            <div className="gov-card text-sm text-muted-foreground">Selecione um contrato para visualizar.</div>
          )}
        </div>
      </section>
    </>
  );
}

type Aba = "geral" | "itens" | "garantia" | "reajuste" | "fiscalizacao" | "anexos";

function ContratoFicha({ contrato }: { contrato: Contrato }) {
  const [aba, setAba] = useState<Aba>("geral");
  const alertas = alertasContrato(contrato);
  const usuarios = useStore((s) => s.usuarios);

  const abas: { id: Aba; label: string; Icon: typeof FileText }[] = [
    { id: "geral", label: "Dados Gerais", Icon: FileText },
    { id: "itens", label: "Itens / Preços", Icon: TrendingUp },
    { id: "garantia", label: "Garantia", Icon: ShieldAlert },
    { id: "reajuste", label: "Reajuste", Icon: CalendarClock },
    { id: "fiscalizacao", label: "Fiscalização", Icon: Users },
    { id: "anexos", label: "Anexos", Icon: Paperclip },
  ];

  return (
    <div className="space-y-4">
      <div className="gov-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contrato</div>
            <h2 className="text-xl mt-0.5">Nº {contrato.numero} · {contrato.fornecedorRazaoSocial}</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-3xl">{contrato.objeto}</p>
          </div>
          <div className="text-right space-y-1">
            <div className="text-xs text-muted-foreground">Valor total do período</div>
            <div className="text-2xl font-bold text-gov-blue-dark">{brl(contrato.valorTotalPeriodo)}</div>
            <div className="text-xs text-muted-foreground">{brl(contrato.valorMensalTotal)}/mês · {contrato.prazoMeses} meses</div>
          </div>
        </div>

        {alertas.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {alertas.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <GovTag tone={a.severidade === "danger" ? "danger" : a.severidade === "warning" ? "warning" : "info"}>
                  {a.tipo}
                </GovTag>
                <span>{a.texto}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="gov-card p-0">
        <div className="border-b border-border overflow-x-auto">
          <div className="flex">
            {abas.map((a) => (
              <button
                key={a.id}
                onClick={() => setAba(a.id)}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-semibold border-b-[3px] transition-colors ${
                  aba === a.id
                    ? "text-gov-blue border-gov-blue"
                    : "text-foreground/70 hover:text-gov-blue border-transparent"
                }`}
              >
                <a.Icon className="h-4 w-4" /> {a.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {aba === "geral" && <AbaGeral contrato={contrato} />}
          {aba === "itens" && <AbaItens contrato={contrato} />}
          {aba === "garantia" && <AbaGarantia contrato={contrato} />}
          {aba === "reajuste" && <AbaReajuste contrato={contrato} />}
          {aba === "fiscalizacao" && <AbaFiscalizacao contrato={contrato} usuarios={usuarios} />}
          {aba === "anexos" && <AbaAnexos contrato={contrato} />}
        </div>
      </div>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm mt-1 text-foreground">{children ?? "—"}</div>
    </div>
  );
}

function AbaGeral({ contrato }: { contrato: Contrato }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Campo label="Número">{contrato.numero}</Campo>
      <Campo label="Processo Administrativo">{contrato.processoAdministrativo}</Campo>
      <Campo label="UASG">{contrato.uasg}</Campo>
      <Campo label="Modalidade">{contrato.modalidade}</Campo>
      <Campo label="Órgão Contratante">{contrato.orgaoContratante}</Campo>
      <Campo label="Fornecedor">{contrato.fornecedorRazaoSocial}</Campo>
      <Campo label="CNPJ">{contrato.fornecedorCnpj}</Campo>
      <Campo label="Assinatura">{contrato.vigenciaAssinatura}</Campo>
      <Campo label="Vigência">{contrato.vigenciaInicio} → {contrato.vigenciaFim}</Campo>
      <Campo label="Prazo">{contrato.prazoMeses} meses (prorrogável até {contrato.prorrogavelAteAnos} anos)</Campo>
      <Campo label="Valor mensal">{brl(contrato.valorMensalTotal)}</Campo>
      <Campo label="Valor anual">{brl(contrato.valorAnualTotal)}</Campo>
      <div className="md:col-span-3">
        <Campo label="Dotação orçamentária">
          {contrato.dotacao ? (
            <div className="grid md:grid-cols-3 gap-2 text-sm mt-1">
              <div><span className="text-muted-foreground">Gestão/Unidade:</span> {contrato.dotacao.gestaoUnidade ?? "—"}</div>
              <div><span className="text-muted-foreground">Fonte:</span> {contrato.dotacao.fonte ?? "—"}</div>
              <div><span className="text-muted-foreground">P.T.:</span> {contrato.dotacao.programaTrabalho ?? "—"}</div>
              <div><span className="text-muted-foreground">Elemento:</span> {contrato.dotacao.elementoDespesa ?? "—"}</div>
              <div><span className="text-muted-foreground">P.I.:</span> {contrato.dotacao.planoInterno ?? "—"}</div>
              <div><span className="text-muted-foreground">Nota Empenho:</span> {contrato.dotacao.notaEmpenho ?? "—"}</div>
            </div>
          ) : "—"}
        </Campo>
      </div>
    </div>
  );
}

function AbaItens({ contrato }: { contrato: Contrato }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-gov-blue-dark text-left">
          <tr>
            <th className="px-3 py-2 font-semibold">Item</th>
            <th className="px-3 py-2 font-semibold">Descrição</th>
            <th className="px-3 py-2 font-semibold">CATSER</th>
            <th className="px-3 py-2 font-semibold">Unidade</th>
            <th className="px-3 py-2 font-semibold text-right">Qtd.</th>
            <th className="px-3 py-2 font-semibold text-right">Vlr. Unit.</th>
            <th className="px-3 py-2 font-semibold text-right">Vlr. Mensal</th>
            <th className="px-3 py-2 font-semibold text-right">Vlr. Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {contrato.itens.map((i) => (
            <tr key={i.id} className="hover:bg-muted/30">
              <td className="px-3 py-2">{i.item}</td>
              <td className="px-3 py-2">{i.descricao}</td>
              <td className="px-3 py-2 text-muted-foreground">{i.catser ?? "—"}</td>
              <td className="px-3 py-2">{i.unidadeMedida}</td>
              <td className="px-3 py-2 text-right">{i.quantidade.toLocaleString("pt-BR")}</td>
              <td className="px-3 py-2 text-right">{brl(i.valorUnitario)}</td>
              <td className="px-3 py-2 text-right">{brl(i.valorMensal)}</td>
              <td className="px-3 py-2 text-right font-semibold text-gov-blue-dark">{brl(i.valorTotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-muted/40 font-semibold">
          <tr>
            <td colSpan={6} className="px-3 py-2 text-right">Totais</td>
            <td className="px-3 py-2 text-right">{brl(contrato.valorMensalTotal)}</td>
            <td className="px-3 py-2 text-right text-gov-blue-dark">{brl(contrato.valorTotalPeriodo)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function AbaGarantia({ contrato }: { contrato: Contrato }) {
  const g = contrato.garantia;
  if (!g) return <p className="text-sm text-muted-foreground">Nenhuma garantia registrada.</p>;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Campo label="Modalidade">{g.modalidade.replaceAll("_", " ")}</Campo>
      <Campo label="Percentual">{g.percentual}%</Campo>
      <Campo label="Valor">{brl(g.valor)}</Campo>
      <Campo label="Vigência">{g.vigenciaInicio} → {g.vigenciaFim}</Campo>
      <div className="md:col-span-2"><Campo label="Observação">{g.observacao}</Campo></div>
    </div>
  );
}

function AbaReajuste({ contrato }: { contrato: Contrato }) {
  const r = contrato.reajuste;
  if (!r) return <p className="text-sm text-muted-foreground">Nenhuma regra de reajuste cadastrada.</p>;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Campo label="Data-base do orçamento">{r.dataBaseOrcamento}</Campo>
        <Campo label="Índice">{r.indice}</Campo>
        <Campo label="Interregno mínimo">{r.interregnoMeses} meses</Campo>
        <Campo label="Próximo elegível em">{r.proximoElegivelEm ?? "—"}</Campo>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Histórico</div>
        {r.historico.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum reajuste aplicado até o momento.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {r.historico.map((h, i) => (
              <li key={i}>{h.data} · {h.percentual}% {h.observacao ? `— ${h.observacao}` : ""}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function AbaFiscalizacao({ contrato, usuarios }: { contrato: Contrato; usuarios: ReturnType<typeof useStore<Awaited<ReturnType<typeof store.get>>["usuarios"]>> }) {
  const f = contrato.fiscalizacao;
  const nome = (id?: string) => usuarios.find((u) => u.id === id)?.nome ?? "Não designado";
  function atribuir(campo: keyof typeof f) {
    const id = prompt(
      `ID do usuário para "${campo}":\n\n` + usuarios.map((u) => `${u.id} — ${u.nome} (${u.email})`).join("\n"),
      f[campo] ?? ""
    );
    if (id === null) return;
    store.updateContrato(contrato.id, { fiscalizacao: { ...f, [campo]: id || undefined } });
  }
  const linhas: [string, keyof typeof f][] = [
    ["Gestor do Contrato", "gestorContratoId"],
    ["Fiscal Técnico", "fiscalTecnicoId"],
    ["Fiscal Administrativo", "fiscalAdministrativoId"],
    ["Fiscal Setorial", "fiscalSetorialId"],
  ];
  return (
    <div className="space-y-2">
      {linhas.map(([label, campo]) => (
        <div key={campo} className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-3 last:border-0">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="text-sm mt-1 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              {nome(f[campo])}
            </div>
          </div>
          <button onClick={() => atribuir(campo)} className="gov-btn-secondary text-xs">Atribuir</button>
        </div>
      ))}
    </div>
  );
}

function AbaAnexos({ contrato }: { contrato: Contrato }) {
  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    store.addContratoAnexo(contrato.id, {
      id: uid("anx"),
      nome: file.name,
      tipo: file.name.toLowerCase().includes("tr") ? "TR" : "CONTRATO",
      tamanhoBytes: file.size,
      uploadedAt: new Date().toISOString(),
    });
    e.target.value = "";
  }
  return (
    <div className="space-y-4">
      <label className="gov-btn-primary cursor-pointer inline-flex w-max">
        <Paperclip className="h-4 w-4" /> Anexar documento
        <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleUpload} />
      </label>
      {contrato.anexos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum anexo registrado.</p>
      ) : (
        <ul className="divide-y divide-border">
          {contrato.anexos.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2 text-sm">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{a.nome}</span>
                <GovTag tone="info">{a.tipo}</GovTag>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(a.uploadedAt).toLocaleString("pt-BR")}
                {a.tamanhoBytes ? ` · ${(a.tamanhoBytes / 1024).toFixed(1)} KB` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">
        Nesta fase de protótipo os arquivos são registrados apenas como metadados (a persistência real virá com a migração para o Lovable Cloud).
      </p>
    </div>
  );
}
