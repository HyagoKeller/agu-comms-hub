import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { GovTag } from "@/components/StatusTag";
import { parseWorkbook, type SheetReport } from "@/lib/import-xlsx";
import { store } from "@/lib/store";

export const Route = createFileRoute("/inventario/importar")({
  head: () => ({ meta: [{ title: "Carga em Lote — Inventário AGU" }] }),
  component: ImportarPage,
});

function ImportarPage() {
  const [reports, setReports] = useState<SheetReport[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ ativos: number; whats: number } | null>(null);
  const navigate = useNavigate();

  async function handleFile(file: File) {
    setError(null);
    setDone(null);
    try {
      const buf = await file.arrayBuffer();
      const r = parseWorkbook(buf);
      setReports(r);
      setFileName(file.name);
      const e: Record<string, boolean> = {};
      r.forEach((s) => { e[s.sheet] = s.detectedAs !== "DESCONHECIDO" && (s.ativos.length + s.whats.length) > 0; });
      setEnabled(e);
    } catch (err) {
      setError((err as Error).message ?? "Falha ao ler a planilha.");
    }
  }

  function confirmar() {
    if (!reports) return;
    let totalA = 0, totalW = 0;
    for (const r of reports) {
      if (!enabled[r.sheet]) continue;
      if (r.ativos.length) { store.bulkAddAtivos(r.ativos, `${fileName} :: ${r.sheet}`); totalA += r.ativos.length; }
      if (r.whats.length) { store.bulkAddWhats(r.whats, `${fileName} :: ${r.sheet}`); totalW += r.whats.length; }
    }
    setDone({ ativos: totalA, whats: totalW });
  }

  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel", to: "/" }, { label: "Inventário", to: "/inventario" }, { label: "Carga em Lote" }]} />
      <section className="gov-container pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl">Carga em Lote — Planilha (.xlsx)</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Importe a planilha de controle (todas as abas serão reconhecidas automaticamente).
            </p>
          </div>
          <Link to="/inventario" className="gov-btn-secondary"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
        </div>

        {!reports && (
          <label className="gov-card flex flex-col items-center justify-center text-center cursor-pointer border-2 border-dashed border-gov-blue/30 hover:bg-gov-blue-light/30 py-14">
            <Upload className="h-10 w-10 text-gov-blue mb-3" />
            <div className="font-semibold text-gov-blue-dark">Selecionar planilha .xlsx</div>
            <div className="text-xs text-muted-foreground mt-1">
              Suporta múltiplas abas (PABX, Estados, Aparelhos, Softphones, Ramais Disponíveis, etc.)
            </div>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </label>
        )}

        {error && (
          <div className="gov-card border-l-4 border-gov-danger flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-gov-danger" />
            <div>
              <div className="font-semibold text-gov-danger">Falha na leitura</div>
              <div className="text-sm text-muted-foreground">{error}</div>
            </div>
          </div>
        )}

        {reports && !done && (
          <>
            <div className="gov-card mb-4 flex items-center gap-3">
              <FileSpreadsheet className="h-6 w-6 text-gov-green" />
              <div className="flex-1">
                <div className="font-semibold text-gov-blue-dark">{fileName}</div>
                <div className="text-xs text-muted-foreground">{reports.length} aba(s) detectada(s)</div>
              </div>
              <button className="gov-btn-secondary" onClick={() => { setReports(null); setFileName(""); }}>
                Trocar arquivo
              </button>
              <button className="gov-btn-primary" onClick={confirmar}>
                <CheckCircle2 className="h-4 w-4" /> Confirmar Carga
              </button>
            </div>

            <div className="grid gap-3">
              {reports.map((r) => (
                <div key={r.sheet} className="gov-card">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gov-blue-dark">{r.sheet}</h3>
                        <GovTag tone={r.detectedAs === "DESCONHECIDO" ? "warning" : "info"}>
                          {detectedLabel(r.detectedAs)}
                        </GovTag>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {r.rowsTotal} linha(s) lida(s) ·{" "}
                        <strong className="text-gov-blue-dark">{r.ativos.length}</strong> ativos PABX ·{" "}
                        <strong className="text-gov-green">{r.whats.length}</strong> linhas WhatsApp
                      </div>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-gov-blue-dark">
                      <input
                        type="checkbox"
                        checked={!!enabled[r.sheet]}
                        onChange={(e) => setEnabled((prev) => ({ ...prev, [r.sheet]: e.target.checked }))}
                        className="h-4 w-4 accent-[var(--gov-blue)]"
                      />
                      Importar esta aba
                    </label>
                  </div>

                  {r.sample.length > 0 && (
                    <div className="overflow-x-auto rounded-md border border-border">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/60">
                          <tr>
                            {Object.keys(r.sample[0]).slice(0, 8).map((h) => (
                              <th key={h} className="px-2 py-1.5 text-left font-semibold text-gov-blue-dark whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {r.sample.map((row, i) => (
                            <tr key={i}>
                              {Object.keys(r.sample[0]).slice(0, 8).map((h) => (
                                <td key={h} className="px-2 py-1.5 whitespace-nowrap text-foreground/80">
                                  {String(row[h] ?? "").slice(0, 40)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {done && (
          <div className="gov-card border-l-4 border-gov-success">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="h-6 w-6 text-gov-success" />
              <div>
                <div className="font-bold text-gov-blue-dark">Carga concluída com sucesso</div>
                <div className="text-sm text-muted-foreground">
                  {done.ativos} ativo(s) PABX e {done.whats} número(s) WhatsApp importados.
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="gov-btn-secondary" onClick={() => { setReports(null); setDone(null); setFileName(""); }}>
                Importar outro arquivo
              </button>
              <button className="gov-btn-primary" onClick={() => navigate({ to: "/inventario" })}>
                Ver inventário
              </button>
              <button className="gov-btn-secondary" onClick={() => navigate({ to: "/whatsapp" })}>
                Ver WhatsApp
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function detectedLabel(d: SheetReport["detectedAs"]): string {
  switch (d) {
    case "PABX_BSB": return "Ramais PABX — Brasília";
    case "PABX_ESTADOS": return "Ramais PABX — Estados";
    case "APARELHOS_INVENTARIO": return "Inventário de Aparelhos";
    case "APARELHOS_DISPONIVEIS": return "Aparelhos Disponíveis";
    case "APARELHOS_ENVIADOS": return "Aparelhos Enviados";
    case "RAMAIS_DISPONIVEIS": return "Ramais Disponíveis";
    case "SOFTPHONES": return "Softphones";
    default: return "Não classificado";
  }
}
