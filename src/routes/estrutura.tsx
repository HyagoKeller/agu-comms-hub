import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Building2, MapPin, Trash2, ListTree, Upload } from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { GovTag } from "@/components/StatusTag";
import { store, useStore, uid } from "@/lib/store";
import { REGIOES, REGIAO_LABELS, type Regiao, type Unidade } from "@/lib/types";

export const Route = createFileRoute("/estrutura")({
  head: () => ({ meta: [{ title: "Estrutura Organizacional — SGT AGU" }] }),
  component: Estrutura,
});

function parseRegiaoFromLabel(label: string): Regiao | null {
  const m = label.match(/(\d)\s*ª/);
  if (!m) return null;
  const n = Number(m[1]);
  if (n >= 1 && n <= 6) return (`R${n}` as Regiao);
  return null;
}

function parseLinha(linha: string): Omit<Unidade, "id"> | null {
  const partes = linha.split(/->|→/).map((p) => p.trim()).filter(Boolean);
  if (partes.length < 4) return null;
  const [regiaoLabel, estado, cidade, ...resto] = partes;
  const nome = resto.join(" - ");
  const regiao = parseRegiaoFromLabel(regiaoLabel);
  if (!regiao) return null;
  return { regiao, regiaoLabel, estado, cidade, nome };
}

function Estrutura() {
  const unidades = useStore((s) => s.unidades);
  const ativos = useStore((s) => s.ativos);

  const [regiao, setRegiao] = useState<Regiao>("R1");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [nome, setNome] = useState("");

  const [bulk, setBulk] = useState("");
  const [resultadoImport, setResultadoImport] = useState<string | null>(null);

  // sugestões por região
  const estadosPorRegiao = useMemo(() => {
    const map = new Map<Regiao, Set<string>>();
    REGIOES.forEach((r) => map.set(r, new Set()));
    unidades.forEach((u) => u.estado && map.get(u.regiao)?.add(u.estado));
    return map;
  }, [unidades]);
  const cidadesPorEstado = useMemo(() => {
    const map = new Map<string, Set<string>>();
    unidades.forEach((u) => {
      if (!u.estado || !u.cidade) return;
      const key = `${u.regiao}|${u.estado}`;
      if (!map.has(key)) map.set(key, new Set());
      map.get(key)!.add(u.cidade);
    });
    return map;
  }, [unidades]);

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !estado.trim() || !cidade.trim()) return;
    store.addUnidade({
      id: uid("u"),
      nome: nome.trim(),
      regiao,
      regiaoLabel: REGIAO_LABELS[regiao],
      estado: estado.trim(),
      cidade: cidade.trim(),
    });
    setNome("");
  }

  function importar() {
    const linhas = bulk.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const novos: Unidade[] = [];
    let invalidos = 0;
    for (const linha of linhas) {
      const parsed = parseLinha(linha);
      if (!parsed) { invalidos++; continue; }
      novos.push({ id: uid("u"), ...parsed });
    }
    if (novos.length) store.bulkAddUnidades(novos, "estrutura-paste");
    setResultadoImport(`${novos.length} unidade(s) importada(s)${invalidos ? `, ${invalidos} linha(s) inválida(s)` : ""}.`);
    if (novos.length) setBulk("");
  }

  // árvore agrupada Região → Estado → Cidade → Unidade
  const arvore = useMemo(() => {
    const tree: Record<Regiao, Record<string, Record<string, Unidade[]>>> = {
      R1: {}, R2: {}, R3: {}, R4: {}, R5: {}, R6: {},
    };
    unidades.forEach((u) => {
      const est = u.estado ?? "—";
      const cid = u.cidade ?? "—";
      tree[u.regiao] ??= {};
      tree[u.regiao][est] ??= {};
      tree[u.regiao][est][cid] ??= [];
      tree[u.regiao][est][cid].push(u);
    });
    return tree;
  }, [unidades]);

  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel", to: "/" }, { label: "Estrutura" }]} />
      <section className="gov-container pb-10">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl">Estrutura Organizacional</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hierarquia <strong>Região → Estado → Cidade → Unidade</strong> (ex.: SAD 4ª Região → Santa Catarina → Florianópolis → PU - Procuradoria da União).
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <div className="gov-card">
              <h2 className="text-lg mb-4 flex items-center gap-2"><Plus className="h-4 w-4" /> Nova Unidade</h2>
              <form onSubmit={add} className="space-y-3">
                <div>
                  <label className="gov-label">Região (SAD)</label>
                  <select className="gov-input" value={regiao} onChange={(e) => setRegiao(e.target.value as Regiao)}>
                    {REGIOES.map((r) => <option key={r} value={r}>{REGIAO_LABELS[r]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="gov-label">Estado</label>
                  <input className="gov-input" list={`estados-${regiao}`} placeholder="Ex.: Santa Catarina"
                    value={estado} onChange={(e) => setEstado(e.target.value)} />
                  <datalist id={`estados-${regiao}`}>
                    {[...(estadosPorRegiao.get(regiao) ?? [])].map((e) => <option key={e} value={e} />)}
                  </datalist>
                </div>
                <div>
                  <label className="gov-label">Cidade</label>
                  <input className="gov-input" list={`cidades-${regiao}-${estado}`} placeholder="Ex.: Florianópolis"
                    value={cidade} onChange={(e) => setCidade(e.target.value)} />
                  <datalist id={`cidades-${regiao}-${estado}`}>
                    {[...(cidadesPorEstado.get(`${regiao}|${estado}`) ?? [])].map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="gov-label">Unidade</label>
                  <input className="gov-input" placeholder="Ex.: PU - Procuradoria da União"
                    value={nome} onChange={(e) => setNome(e.target.value)} />
                </div>
                <button className="gov-btn-primary w-full justify-center"><Plus className="h-4 w-4" /> Adicionar</button>
              </form>
            </div>

            <div className="gov-card">
              <h2 className="text-lg mb-2 flex items-center gap-2"><Upload className="h-4 w-4" /> Importação em lote</h2>
              <p className="text-xs text-muted-foreground mb-3">
                Cole uma linha por unidade no formato:<br />
                <code className="text-[11px]">SAD 4ª Região-&gt;Santa Catarina-&gt;Florianópolis-&gt;PU - Procuradoria da União</code>
              </p>
              <textarea
                className="gov-input min-h-[140px] font-mono text-xs"
                value={bulk}
                onChange={(e) => setBulk(e.target.value)}
                placeholder="SAD 1ª Região->Brasília->Ed. Sede I - Setor de Autarquias Sul (SAS)&#10;SAD 5ª Região ->Ceará ->Fortaleza->PF - Procuradoria Federal"
              />
              <button type="button" onClick={importar} className="gov-btn-primary w-full justify-center mt-3">
                <ListTree className="h-4 w-4" /> Importar
              </button>
              {resultadoImport && (
                <div className="mt-3 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs">{resultadoImport}</div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {REGIOES.map((r) => {
              const estados = arvore[r];
              const totalUnidades = Object.values(estados).reduce(
                (acc, cidades) => acc + Object.values(cidades).reduce((a, l) => a + l.length, 0), 0,
              );
              const ativosCount = ativos.filter((a) => a.regiao === r).length;
              return (
                <div key={r} className="gov-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-gov-blue-dark">{REGIAO_LABELS[r]}</h3>
                    <div className="flex gap-2">
                      <GovTag tone="neutral">{totalUnidades} unidades</GovTag>
                      <GovTag tone="info">{ativosCount} ativos</GovTag>
                    </div>
                  </div>
                  {totalUnidades === 0 ? (
                    <p className="text-sm text-muted-foreground italic">Sem unidades cadastradas.</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(estados).sort(([a],[b]) => a.localeCompare(b)).map(([est, cidades]) => (
                        <div key={est} className="rounded-md border border-border">
                          <div className="flex items-center gap-2 bg-muted/40 px-3 py-2 text-sm font-semibold text-gov-blue-dark">
                            <MapPin className="h-4 w-4" /> {est}
                          </div>
                          <div className="px-3 py-2 space-y-2">
                            {Object.entries(cidades).sort(([a],[b]) => a.localeCompare(b)).map(([cid, lista]) => (
                              <div key={cid}>
                                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{cid}</div>
                                <ul className="grid gap-1.5 sm:grid-cols-2">
                                  {lista.map((u) => (
                                    <li key={u.id} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm">
                                      <Building2 className="h-4 w-4 text-gov-blue shrink-0" />
                                      <span className="truncate" title={u.nome}>{u.nome}</span>
                                      <span className="ml-auto text-xs text-muted-foreground">
                                        {ativos.filter((a) => a.unidade === u.nome).length}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => store.removeUnidade(u.id)}
                                        title="Remover"
                                        className="text-muted-foreground hover:text-gov-danger"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
