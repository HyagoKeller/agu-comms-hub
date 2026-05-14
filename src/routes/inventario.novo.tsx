import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Save, ArrowLeft, AlertTriangle } from "lucide-react";
import { GovBreadcrumb } from "@/components/GovHeader";
import { store, useStore, uid } from "@/lib/store";
import { REGIOES, TIPOS_ATIVO, type Ativo, type AtivoTipo, type CategoriaWhats, type Regiao, type StatusMDM, type StatusOperacional, type StatusTermo } from "@/lib/types";

export const Route = createFileRoute("/inventario/novo")({
  head: () => ({ meta: [{ title: "Cadastro de Ativo — SGT AGU" }] }),
  component: NovoAtivo,
});

function NovoAtivo() {
  const navigate = useNavigate();
  const unidades = useStore((s) => s.unidades);
  const ativos = useStore((s) => s.ativos);

  const [tipo, setTipo] = useState<AtivoTipo>("RAMAL_FISICO");
  const tipoMeta = TIPOS_ATIVO.find((t) => t.value === tipo)!;
  const categoria = tipoMeta.categoria;

  const [identificador, setIdentificador] = useState("");
  const [regiao, setRegiao] = useState<Regiao>("R1");
  const [unidade, setUnidade] = useState(unidades[0]?.nome ?? "");
  const [sala, setSala] = useState("");
  const [usuarioNome, setUsuarioNome] = useState("");
  const [usuarioLogin, setUsuarioLogin] = useState("");
  const [setor, setSetor] = useState("");
  const [dataAtribuicao, setDataAtribuicao] = useState("");
  const [enderecoMac, setEnderecoMac] = useState("");
  const [status, setStatus] = useState<StatusOperacional>("DISPONIVEL");
  const [statusMDM, setStatusMDM] = useState<StatusMDM>(categoria === "MOVEL" ? "NAO_SINCRONIZADO" : "NA");
  const [statusTermo, setStatusTermo] = useState<StatusTermo>("PENDENTE");
  const [catWhats, setCatWhats] = useState<CategoriaWhats>(categoria === "MOVEL" ? "MESSENGER_PESSOAL" : null);
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState("");

  function onChangeTipo(t: AtivoTipo) {
    setTipo(t);
    const cat = TIPOS_ATIVO.find((x) => x.value === t)!.categoria;
    setStatusMDM(cat === "MOVEL" ? "NAO_SINCRONIZADO" : "NA");
    setCatWhats(cat === "MOVEL" ? "MESSENGER_PESSOAL" : null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!identificador.trim()) return setErro("Informe o identificador.");
    if (ativos.some((a) => a.identificador === identificador.trim()))
      return setErro("Já existe um ativo com este identificador (numeração deve ser única).");
    if (tipo === "RAMAL_FISICO" && !/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/i.test(enderecoMac))
      return setErro("Endereço MAC inválido para aparelho IP físico (formato AA:BB:CC:DD:EE:FF).");

    const novo: Ativo = {
      id: uid("a"),
      categoria,
      identificador: identificador.trim(),
      tipo,
      catWhats,
      regiao,
      unidade,
      sala: sala || undefined,
      usuarioNome: usuarioNome || undefined,
      usuarioLogin: usuarioLogin || undefined,
      setor: setor || undefined,
      dataAtribuicao: dataAtribuicao || undefined,
      enderecoMac: enderecoMac || undefined,
      status,
      statusMDM,
      statusTermo,
      observacoes: observacoes || undefined,
      anexos: [],
      criadoEm: new Date().toISOString(),
    };
    store.addAtivo(novo);
    navigate({ to: "/inventario" });
  }

  return (
    <>
      <GovBreadcrumb items={[{ label: "Painel", to: "/" }, { label: "Inventário", to: "/inventario" }, { label: "Novo Ativo" }]} />
      <section className="gov-container pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl">Cadastro de Ativo</h1>
            <p className="text-sm text-muted-foreground mt-1">Preencha os dados mínimos do inventário institucional.</p>
          </div>
          <button onClick={() => navigate({ to: "/inventario" })} className="gov-btn-secondary">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
        </div>

        {erro && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-gov-danger/40 bg-[oklch(0.97_0.04_27)] p-3 text-sm text-gov-danger">
            <AlertTriangle className="h-4 w-4 mt-0.5" /> {erro}
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">
          <div className="gov-card">
            <h2 className="text-lg mb-4">Classificação</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="gov-label">Tipo do Ativo</label>
                <select className="gov-input" value={tipo} onChange={(e) => onChangeTipo(e.target.value as AtivoTipo)}>
                  {TIPOS_ATIVO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="gov-label">Categoria</label>
                <input className="gov-input bg-muted" disabled value={categoria === "PABX" ? "Telefonia Fixa (PABX)" : "Telefonia Móvel (WhatsApp)"} />
              </div>
              {categoria === "MOVEL" && (
                <div>
                  <label className="gov-label">Categoria da conta WhatsApp</label>
                  <select className="gov-input" value={catWhats ?? ""} onChange={(e) => setCatWhats(e.target.value as CategoriaWhats)}>
                    <option value="MESSENGER_PESSOAL">WhatsApp Messenger (pessoal corporativo)</option>
                    <option value="WABA_INSTITUCIONAL">WABA / Meta API (institucional)</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="gov-card">
            <h2 className="text-lg mb-4">Identificação e Localização</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="gov-label">{categoria === "PABX" ? "Número do Ramal" : "MSISDN (Número da Linha)"} *</label>
                <input className="gov-input font-mono" placeholder={categoria === "PABX" ? "Ex.: 2101" : "+5561999110011"} value={identificador} onChange={(e) => setIdentificador(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Numeração estritamente única em toda a base.</p>
              </div>
              <div>
                <label className="gov-label">Região *</label>
                <select className="gov-input" value={regiao} onChange={(e) => setRegiao(e.target.value as Regiao)}>
                  {REGIOES.map((r) => <option key={r} value={r}>Região {r.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="gov-label">Unidade *</label>
                <select className="gov-input" value={unidade} onChange={(e) => setUnidade(e.target.value)}>
                  {unidades.filter((u) => u.regiao === regiao).map((u) => <option key={u.id} value={u.nome}>{u.nome}</option>)}
                </select>
              </div>
              {categoria === "PABX" && (
                <div>
                  <label className="gov-label">Sala</label>
                  <input className="gov-input" value={sala} onChange={(e) => setSala(e.target.value)} placeholder="Ex.: 302" />
                </div>
              )}
            </div>
          </div>

          <div className="gov-card">
            <h2 className="text-lg mb-4">Atribuição</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="gov-label">Nome do Usuário</label>
                <input className="gov-input" value={usuarioNome} onChange={(e) => setUsuarioNome(e.target.value)} />
              </div>
              <div>
                <label className="gov-label">Login (e-mail institucional)</label>
                <input className="gov-input" type="email" placeholder="nome.sobrenome@agu.gov.br" value={usuarioLogin} onChange={(e) => setUsuarioLogin(e.target.value)} />
              </div>
              <div>
                <label className="gov-label">Setor</label>
                <input className="gov-input" value={setor} onChange={(e) => setSetor(e.target.value)} />
              </div>
              <div>
                <label className="gov-label">Data de Atribuição</label>
                <input className="gov-input" type="date" value={dataAtribuicao} onChange={(e) => setDataAtribuicao(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="gov-card">
            <h2 className="text-lg mb-4">Controles Técnicos</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {tipo === "RAMAL_FISICO" && (
                <div>
                  <label className="gov-label">Endereço MAC *</label>
                  <input className="gov-input font-mono" placeholder="AA:BB:CC:DD:EE:FF" value={enderecoMac} onChange={(e) => setEnderecoMac(e.target.value)} />
                </div>
              )}
              <div>
                <label className="gov-label">Status Operacional</label>
                <select className="gov-input" value={status} onChange={(e) => setStatus(e.target.value as StatusOperacional)}>
                  <option value="ATIVO">Ativo</option>
                  <option value="DISPONIVEL">Disponível</option>
                  <option value="MANUTENCAO">Manutenção</option>
                  <option value="BLOQUEADO">Bloqueado</option>
                  <option value="INATIVO">Inativo</option>
                </select>
              </div>
              {categoria === "MOVEL" && (
                <div>
                  <label className="gov-label">Status MDM (trava de conformidade)</label>
                  <select className="gov-input" value={statusMDM} onChange={(e) => setStatusMDM(e.target.value as StatusMDM)}>
                    <option value="CONFORME">Conforme — só Messenger</option>
                    <option value="NAO_SINCRONIZADO">Não sincronizado</option>
                    <option value="VIOLACAO">Violação (WhatsApp Business detectado)</option>
                  </select>
                </div>
              )}
              <div>
                <label className="gov-label">Termo de Responsabilidade</label>
                <select className="gov-input" value={statusTermo} onChange={(e) => setStatusTermo(e.target.value as StatusTermo)}>
                  <option value="ASSINADO">Assinado</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="NA">Não aplicável</option>
                </select>
              </div>
            </div>
          </div>

          <div className="gov-card">
            <h2 className="text-lg mb-4">Documentação</h2>
            <div>
              <label className="gov-label">Observações gerais</label>
              <textarea className="gov-input min-h-24" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
            </div>
            <div className="mt-4">
              <label className="gov-label">Anexos (Termo, OS, etc.)</label>
              <input type="file" multiple className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-gov-blue file:px-4 file:py-2 file:text-white file:font-semibold hover:file:bg-gov-blue-dark" />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => navigate({ to: "/inventario" })} className="gov-btn-secondary">Cancelar</button>
            <button type="submit" className="gov-btn-primary"><Save className="h-4 w-4" /> Salvar Ativo</button>
          </div>
        </form>
      </section>
    </>
  );
}
