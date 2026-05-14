import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, MessageCircle, Trash2, Pencil, ShieldCheck, ShieldAlert, Upload, X } from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { GovTag, StatusBadge } from "@/components/StatusTag";
import { store, useStore, uid } from "@/lib/store";
import { REGIOES, type Regiao, type WhatsappNumero, type WhatsCategoria } from "@/lib/types";

export const Route = createFileRoute("/whatsapp")({
  head: () => ({ meta: [{ title: "Controle de Números WhatsApp — AGU" }] }),
  component: WhatsappPage,
});

const CAT_LABEL: Record<WhatsCategoria, string> = {
  MESSENGER_PESSOAL: "Messenger Pessoal",
  WABA_INSTITUCIONAL: "WABA Institucional",
  BUSINESS_APP: "WhatsApp Business (App)",
};

function WhatsappPage() {
  const whats = useStore((s) => s.whats);
  const [q, setQ] = useState("");
  const [regiao, setRegiao] = useState("");
  const [cat, setCat] = useState("");
  const [mdm, setMdm] = useState("");
  const [editing, setEditing] = useState<WhatsappNumero | null>(null);
  const [creating, setCreating] = useState(false);

  const filtrados = useMemo(() => whats.filter((w) => {
    if (regiao && w.regiao !== regiao) return false;
    if (cat && w.categoria !== cat) return false;
    if (mdm && w.statusMDM !== mdm) return false;
    if (q) {
      const s = q.toLowerCase();
      if (
        !w.msisdn.toLowerCase().includes(s) &&
        !(w.responsavelNome ?? "").toLowerCase().includes(s) &&
        !(w.responsavelLogin ?? "").toLowerCase().includes(s) &&
        !w.unidade.toLowerCase().includes(s)
      ) return false;
    }
    return true;
  }), [whats, q, regiao, cat, mdm]);

  const totals = useMemo(() => ({
    total: whats.length,
    conformes: whats.filter((w) => w.statusMDM === "CONFORME").length,
    violacoes: whats.filter((w) => w.statusMDM === "VIOLACAO").length,
    waba: whats.filter((w) => w.categoria === "WABA_INSTITUCIONAL").length,
  }), [whats]);

  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel", to: "/" }, { label: "WhatsApp" }]} />
      <section className="gov-container pb-10">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl flex items-center gap-2">
              <MessageCircle className="h-7 w-7 text-gov-green" /> Controle de Números WhatsApp
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestão dos números institucionais com categoria de uso, conformidade MDM e termos de responsabilidade.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/inventario/importar" className="gov-btn-secondary"><Upload className="h-4 w-4" /> Carga em Lote</Link>
            <button className="gov-btn-primary" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> Novo Número
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <KpiCard label="Total de Linhas" value={totals.total} tone="info" />
          <KpiCard label="MDM Conforme" value={totals.conformes} tone="success" icon={<ShieldCheck className="h-5 w-5" />} />
          <KpiCard label="MDM em Violação" value={totals.violacoes} tone="danger" icon={<ShieldAlert className="h-5 w-5" />} />
          <KpiCard label="WABA Institucional" value={totals.waba} tone="info" />
        </div>

        <div className="gov-card mb-6 grid gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="gov-label">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input className="gov-input pl-9" placeholder="Número, responsável, unidade..." value={q} onChange={(e) => setQ(e.target.value)} />
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
            <label className="gov-label">Categoria</label>
            <select className="gov-input" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">Todas</option>
              {Object.entries(CAT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="gov-label">MDM</label>
            <select className="gov-input" value={mdm} onChange={(e) => setMdm(e.target.value)}>
              <option value="">Todos</option>
              <option value="CONFORME">Conforme</option>
              <option value="NAO_SINCRONIZADO">Não sincronizado</option>
              <option value="VIOLACAO">Violação</option>
            </select>
          </div>
        </div>

        <div className="gov-card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-gov-blue-dark">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Número</th>
                <th className="px-4 py-3 font-semibold">Categoria</th>
                <th className="px-4 py-3 font-semibold">Responsável</th>
                <th className="px-4 py-3 font-semibold">Região / Unidade</th>
                <th className="px-4 py-3 font-semibold">Operadora</th>
                <th className="px-4 py-3 font-semibold">MDM</th>
                <th className="px-4 py-3 font-semibold">Termo</th>
                <th className="px-4 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtrados.map((w) => (
                <tr key={w.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono font-semibold text-gov-blue-dark">{w.msisdn}</td>
                  <td className="px-4 py-3">
                    <GovTag tone={w.categoria === "WABA_INSTITUCIONAL" ? "success" : w.categoria === "BUSINESS_APP" ? "warning" : "info"}>
                      {CAT_LABEL[w.categoria]}
                    </GovTag>
                  </td>
                  <td className="px-4 py-3">
                    {w.responsavelNome ? (
                      <>
                        <div className="font-medium">{w.responsavelNome}</div>
                        <div className="text-xs text-muted-foreground">{w.responsavelLogin}</div>
                      </>
                    ) : <span className="italic text-muted-foreground">— sem responsável —</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{w.unidade}</div>
                    <div className="text-xs text-muted-foreground">Região {w.regiao.slice(1)}</div>
                  </td>
                  <td className="px-4 py-3">{w.operadora ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={w.statusMDM} /></td>
                  <td className="px-4 py-3"><StatusBadge status={w.statusTermo} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={() => setEditing(w)} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent text-gov-blue" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Excluir ${w.msisdn}?`)) store.removeWhats(w.id); }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent text-gov-danger"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">Nenhum número encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {(creating || editing) && (
        <WhatsModal
          initial={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
        />
      )}
    </>
  );
}

function KpiCard({ label, value, tone, icon }: { label: string; value: number; tone: "info" | "success" | "danger"; icon?: React.ReactNode }) {
  const color = tone === "success" ? "text-gov-green" : tone === "danger" ? "text-gov-danger" : "text-gov-blue";
  return (
    <div className="gov-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        {icon && <span className={color}>{icon}</span>}
      </div>
      <div className={`mt-2 text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function WhatsModal({ initial, onClose }: { initial: WhatsappNumero | null; onClose: () => void }) {
  const [form, setForm] = useState<WhatsappNumero>(
    initial ?? {
      id: uid("w_"),
      msisdn: "",
      categoria: "MESSENGER_PESSOAL",
      regiao: "R6",
      unidade: "SEDE 1",
      statusMDM: "NAO_SINCRONIZADO",
      statusTermo: "PENDENTE",
      status: "ATIVO",
      criadoEm: new Date().toISOString(),
    },
  );

  function set<K extends keyof WhatsappNumero>(k: K, v: WhatsappNumero[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function salvar() {
    if (!form.msisdn.trim()) { alert("Informe o número (MSISDN)."); return; }
    if (initial) store.updateWhats(initial.id, form);
    else store.addWhats(form);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-bold text-gov-blue-dark text-lg">
            {initial ? "Editar Número WhatsApp" : "Novo Número WhatsApp"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 grid gap-4 md:grid-cols-2">
          <Field label="Número (MSISDN) *">
            <input className="gov-input" placeholder="+5561999110011" value={form.msisdn} onChange={(e) => set("msisdn", e.target.value)} />
          </Field>
          <Field label="Categoria de Uso *">
            <select className="gov-input" value={form.categoria} onChange={(e) => set("categoria", e.target.value as WhatsCategoria)}>
              {Object.entries(CAT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="Operadora">
            <input className="gov-input" value={form.operadora ?? ""} onChange={(e) => set("operadora", e.target.value)} />
          </Field>
          <Field label="Plano">
            <input className="gov-input" value={form.plano ?? ""} onChange={(e) => set("plano", e.target.value)} />
          </Field>
          <Field label="Responsável (nome)">
            <input className="gov-input" value={form.responsavelNome ?? ""} onChange={(e) => set("responsavelNome", e.target.value)} />
          </Field>
          <Field label="Login institucional">
            <input className="gov-input" value={form.responsavelLogin ?? ""} onChange={(e) => set("responsavelLogin", e.target.value)} />
          </Field>
          <Field label="Setor">
            <input className="gov-input" value={form.setor ?? ""} onChange={(e) => set("setor", e.target.value)} />
          </Field>
          <Field label="Região">
            <select className="gov-input" value={form.regiao} onChange={(e) => set("regiao", e.target.value as Regiao)}>
              {REGIOES.map((r) => <option key={r} value={r}>Região {r.slice(1)}</option>)}
            </select>
          </Field>
          <Field label="Unidade">
            <input className="gov-input" value={form.unidade} onChange={(e) => set("unidade", e.target.value)} />
          </Field>
          <Field label="IMEI do aparelho">
            <input className="gov-input" value={form.imei ?? ""} onChange={(e) => set("imei", e.target.value)} />
          </Field>
          <Field label="Status MDM">
            <select className="gov-input" value={form.statusMDM} onChange={(e) => set("statusMDM", e.target.value as WhatsappNumero["statusMDM"])}>
              <option value="CONFORME">Conforme</option>
              <option value="NAO_SINCRONIZADO">Não sincronizado</option>
              <option value="VIOLACAO">Violação</option>
              <option value="NA">Não aplicável</option>
            </select>
          </Field>
          <Field label="Termo de Responsabilidade">
            <select className="gov-input" value={form.statusTermo} onChange={(e) => set("statusTermo", e.target.value as WhatsappNumero["statusTermo"])}>
              <option value="ASSINADO">Assinado</option>
              <option value="PENDENTE">Pendente</option>
              <option value="NA">Não aplicável</option>
            </select>
          </Field>
          <Field label="Data de ativação">
            <input type="date" className="gov-input" value={form.dataAtivacao ?? ""} onChange={(e) => set("dataAtivacao", e.target.value)} />
          </Field>
          <Field label="Status operacional">
            <select className="gov-input" value={form.status} onChange={(e) => set("status", e.target.value as WhatsappNumero["status"])}>
              <option value="ATIVO">Ativo</option>
              <option value="BLOQUEADO">Bloqueado</option>
              <option value="MANUTENCAO">Manutenção</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </Field>
          <div className="md:col-span-2">
            <label className="gov-label">Observações</label>
            <textarea rows={3} className="gov-input" value={form.observacoes ?? ""} onChange={(e) => set("observacoes", e.target.value)} />
          </div>
        </div>
        <div className="border-t border-border px-6 py-4 flex justify-end gap-2">
          <button onClick={onClose} className="gov-btn-secondary">Cancelar</button>
          <button onClick={salvar} className="gov-btn-primary">{initial ? "Salvar alterações" : "Cadastrar número"}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="gov-label">{label}</label>
      {children}
    </div>
  );
}
