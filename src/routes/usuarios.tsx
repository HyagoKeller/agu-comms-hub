import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, X, Shield, MapPin, Building2, Pencil, Save, Globe2 } from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { GovTag } from "@/components/StatusTag";
import { store, useStore } from "@/lib/store";
import { PERM_LABELS, PERFIL_LABELS, REGIAO_LABELS, type PerfilUsuario, type Regiao } from "@/lib/types";

export const Route = createFileRoute("/usuarios")({
  head: () => ({ meta: [{ title: "Usuários e Permissões — SGT AGU" }] }),
  component: Usuarios,
});

function Usuarios() {
  const usuarios = useStore((s) => s.usuarios);
  const unidades = useStore((s) => s.unidades);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel", to: "/" }, { label: "Usuários" }]} />
      <section className="gov-container pb-10">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl">Usuários, Perfis e Escopo de Acesso</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Controle de acesso (RBAC) com escopo por <strong>região</strong> e, opcionalmente, por <strong>unidade específica</strong>. Quando nenhuma unidade é marcada, o usuário enxerga todas as unidades das suas regiões.
          </p>
        </div>

        <div className="space-y-4">
          {usuarios.map((u) => (
            <CartaoUsuario
              key={u.id}
              usuario={u}
              unidades={unidades}
              editando={editandoId === u.id}
              onEditar={() => setEditandoId(u.id)}
              onFechar={() => setEditandoId(null)}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function CartaoUsuario({
  usuario, unidades, editando, onEditar, onFechar,
}: {
  usuario: PerfilUsuario;
  unidades: { id: string; nome: string; regiao: Regiao }[];
  editando: boolean;
  onEditar: () => void;
  onFechar: () => void;
}) {
  const [regioes, setRegioes] = useState<Regiao[]>(usuario.regioes);
  const [unidadesSel, setUnidadesSel] = useState<string[]>(usuario.unidades ?? []);

  const unidadesPorRegiao = useMemo(() => {
    return regioes.map((r) => ({
      regiao: r,
      lista: unidades.filter((u) => u.regiao === r),
    }));
  }, [regioes, unidades]);

  function toggleRegiao(r: Regiao) {
    setRegioes((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);
    // remover unidades da região removida
    setUnidadesSel((prev) => {
      if (regioes.includes(r)) {
        const nomesRegiao = new Set(unidades.filter((u) => u.regiao === r).map((u) => u.nome));
        return prev.filter((n) => !nomesRegiao.has(n));
      }
      return prev;
    });
  }
  function toggleUnidade(nome: string) {
    setUnidadesSel((prev) => prev.includes(nome) ? prev.filter((x) => x !== nome) : [...prev, nome]);
  }
  function salvar() {
    store.updateUsuario(usuario.id, { regioes, unidades: unidadesSel.length ? unidadesSel : undefined });
    onFechar();
  }

  const escopoResumo = usuario.unidades?.length
    ? `${usuario.unidades.length} unidade(s) específica(s)`
    : "Todas as unidades das regiões";

  return (
    <div className="gov-card">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gov-blue" />
            <h3 className="text-base font-bold text-gov-blue-dark">{usuario.nome}</h3>
            <GovTag tone="info">{PERFIL_LABELS[usuario.perfil]}</GovTag>
          </div>
          <div className="text-xs text-muted-foreground mt-1">{usuario.email}</div>
        </div>
        <div className="flex items-start gap-2">
          <div className="flex flex-wrap gap-1 justify-end max-w-md">
            {usuario.regioes.map((r) => <GovTag key={r} tone="neutral">R{r.slice(1)}</GovTag>)}
          </div>
          {!editando ? (
            <button onClick={onEditar} className="gov-btn-secondary">
              <Pencil className="h-4 w-4" /> Editar escopo
            </button>
          ) : (
            <button onClick={salvar} className="gov-btn-primary">
              <Save className="h-4 w-4" /> Salvar
            </button>
          )}
        </div>
      </div>

      {!editando ? (
        <>
          <div className="grid gap-3 md:grid-cols-2 mb-3">
            <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
              <div className="flex items-center gap-2 text-gov-blue-dark font-semibold mb-1">
                <Globe2 className="h-4 w-4" /> Escopo de acesso
              </div>
              <div className="text-xs text-muted-foreground">{escopoResumo}</div>
            </div>
            {usuario.unidades?.length ? (
              <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
                <div className="flex items-center gap-2 text-gov-blue-dark font-semibold mb-1 text-sm">
                  <Building2 className="h-4 w-4" /> Unidades autorizadas
                </div>
                <div className="flex flex-wrap gap-1">
                  {usuario.unidades.map((n) => (
                    <span key={n} className="text-[11px] rounded border border-border bg-card px-2 py-0.5">{n}</span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4 text-sm">
            {Object.entries(usuario.permissoes).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
                {v ? <Check className="h-4 w-4 text-gov-success" /> : <X className="h-4 w-4 text-gov-danger" />}
                <span className={v ? "text-foreground" : "text-muted-foreground line-through"}>
                  {(PERM_LABELS as Record<string, string>)[k]}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="text-sm font-semibold text-gov-blue-dark mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Regiões
            </div>
            <div className="flex flex-wrap gap-2">
              {(["R1","R2","R3","R4","R5","R6"] as Regiao[]).map((r) => {
                const on = regioes.includes(r);
                return (
                  <button key={r} type="button" onClick={() => toggleRegiao(r)}
                    className={`text-xs rounded-md border px-3 py-1.5 font-semibold transition-colors ${
                      on ? "border-gov-blue bg-gov-blue text-white" : "border-border bg-card text-gov-blue-dark hover:bg-accent"
                    }`}>
                    {REGIAO_LABELS[r]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-gov-blue-dark mb-2 flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Unidades específicas
              <span className="text-xs font-normal text-muted-foreground">
                (vazio = todas as unidades das regiões selecionadas)
              </span>
            </div>
            {unidadesPorRegiao.length === 0 && (
              <p className="text-xs text-muted-foreground italic">Selecione ao menos uma região.</p>
            )}
            <div className="space-y-3">
              {unidadesPorRegiao.map(({ regiao, lista }) => (
                <div key={regiao} className="rounded-md border border-border">
                  <div className="bg-muted/40 px-3 py-2 text-xs font-semibold text-gov-blue-dark flex items-center justify-between">
                    <span>{REGIAO_LABELS[regiao]}</span>
                    <div className="flex gap-2">
                      <button type="button"
                        onClick={() => setUnidadesSel((prev) => Array.from(new Set([...prev, ...lista.map((u) => u.nome)])))}
                        className="text-[11px] text-gov-blue hover:underline">Marcar todas</button>
                      <button type="button"
                        onClick={() => {
                          const nomes = new Set(lista.map((u) => u.nome));
                          setUnidadesSel((prev) => prev.filter((n) => !nomes.has(n)));
                        }}
                        className="text-[11px] text-muted-foreground hover:underline">Limpar</button>
                    </div>
                  </div>
                  <div className="p-2 grid gap-1.5 sm:grid-cols-2 md:grid-cols-3">
                    {lista.length === 0 && (
                      <p className="text-xs text-muted-foreground italic col-span-full px-2 py-1">
                        Nenhuma unidade cadastrada nesta região.
                      </p>
                    )}
                    {lista.map((u) => (
                      <label key={u.id} className="flex items-start gap-2 rounded-md border border-border bg-card px-2 py-1.5 text-xs cursor-pointer hover:bg-accent">
                        <input type="checkbox" className="mt-0.5"
                          checked={unidadesSel.includes(u.nome)}
                          onChange={() => toggleUnidade(u.nome)} />
                        <span className="truncate" title={u.nome}>{u.nome}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
