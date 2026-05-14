import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, FileText, Download } from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios e Exportações — Telefonia & WhatsApp AGU" }] }),
  component: Relatorios,
});

const RELATORIOS = [
  { titulo: "Inventário Consolidado", desc: "Lista completa de ramais PABX e linhas móveis com filtros aplicáveis." },
  { titulo: "Bilhetagem por Período", desc: "Resumo mensal por Região, Unidade e Tipo de Ativo." },
  { titulo: "Conformidade WhatsApp (MDM)", desc: "Linhas móveis com status de conformidade Messenger × Business." },
  { titulo: "Termos de Responsabilidade", desc: "Status de assinatura por usuário e unidade." },
  { titulo: "Auditoria do Sistema", desc: "Eventos registrados com Antes/Depois por campo." },
];

function Relatorios() {
  const ativos = useStore((s) => s.ativos);

  function exportarCSV() {
    const headers = ["identificador", "categoria", "tipo", "regiao", "unidade", "status", "statusMDM", "usuarioLogin"];
    const rows = ativos.map((a) => headers.map((h) => `"${(a as any)[h] ?? ""}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "inventario.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel", to: "/" }, { label: "Relatórios" }]} />
      <section className="gov-container pb-10">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl">Relatórios e Exportações</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Geração de relatórios institucionais em Excel/CSV e PDF.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {RELATORIOS.map((r) => (
            <div key={r.titulo} className="gov-card">
              <div className="flex items-start justify-between mb-3">
                <FileText className="h-6 w-6 text-gov-blue" />
              </div>
              <h3 className="text-base font-bold text-gov-blue-dark mb-1">{r.titulo}</h3>
              <p className="text-sm text-muted-foreground mb-4">{r.desc}</p>
              <div className="flex gap-2">
                <button onClick={exportarCSV} className="gov-btn-secondary flex-1 justify-center">
                  <FileSpreadsheet className="h-4 w-4" /> Excel
                </button>
                <button className="gov-btn-secondary flex-1 justify-center">
                  <Download className="h-4 w-4" /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
