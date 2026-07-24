# Evolução SGT AGU — Alinhamento ao Contrato STFC nº 12/2026

Implementação em fases independentes, cada uma entregando valor sozinha. Todas seguem os padrões do projeto: mutações via `src/lib/store.ts` (gera auditoria automática), tokens semânticos de cor, RBAC por região/unidade estendido (não substituído), tipos em `src/lib/types.ts`.

## Princípio-base de UX (aplicado em todas as fases)

- **Timestamps de ações internas AGU** (abrir OS, marcar respondido, concluir) são capturados no clique — nunca campo editável. Edição posterior exige justificativa e gera evento de auditoria explícito.
- **Evidências da Contratada** (relatórios, apólices, comprovantes) entram por upload/anexo; o cálculo de atraso é feito comparando a data do upload com o prazo contratual — nada de digitar linha a linha.
- Cada Fiscal abre o sistema numa **Central de Pendências pessoais** (não no dashboard executivo): chamados sem resposta, OS vencendo, relatório semestral a vencer. O dado correto vira subproduto do uso diário.

---

## FASE 1 — Módulo Contratos (fundação)

**Novos tipos** em `src/lib/types.ts`: `Contrato`, `ContratoItem`, `Garantia`, `Reajuste`, `Fiscalizacao`.

**Store**: `addContrato`, `updateContrato`, `addContratoAnexo`, com auditoria antes/depois.

**Rota `/contratos`**:
- Lista (ativos / vencidos / em prorrogação) com badges de alerta (garantia a vencer, aniversário, reajuste elegível).
- Ficha do contrato em abas: Dados Gerais · Itens/Preços (tabela item 1.1 do TR) · Garantia · Reajuste · Fiscalização · Anexos (upload PDF do TR e contrato).
- Alertas automáticos calculados na abertura da tela: 30/60/90 dias para garantia; 60 dias para aniversário; elegibilidade de reajuste.

**Custos**: passa a ser view derivada dos itens do contrato ativo; histórico preservado por vigência (mesma lógica atual, agora amarrada ao `contratoId`).

**Seed**: pré-carregar o Contrato nº 12/2026 com os itens do item 1.1 do TR.

---

## FASE 2 — Motor de SLA e Glosa (IMR)

### 2.1 Ordens de Serviço
Tipo `OrdemServico` (contratoId, tipo, unidades, TCE prazo, TEC data conclusão, valor, status kanban Aberta→Em Execução→Recebimento Provisório→Definitivo→Faturada).

Rota `/ordens-servico` — kanban + timeline por OS. Abertura seguindo o modelo Apêndice D.

### 2.2 IAE (automático ao concluir OS)
`IAE = TEC − TCE`. Faixas: ≤5 sem glosa · 5<IAE≤15 → 0,25%/dia · >15 → 1%/dia sobre valor da OS. Override do fiscal exige justificativa (auditoria).

### 2.3 Chamados Técnicos e IST
Tipo `ChamadoTecnico` com severidade S1–S5 pré-carregada com os tempos exatos do TR (tabela do prompt). Botões "Marcar respondido" / "Marcar solucionado" gravam timestamp automático. Cálculo: conforme/não-conforme + penalidade horária sobre valor mensal da OS.

Rota `/chamados` com dashboard mensal IST (conformes/total × 100, meta 100%).

### 2.4 IAR — Relatório Semestral
Estende o módulo de Bilhetagem: upload do arquivo semestral da Contratada, campos por chamada exigidos pelo TR (tronco, ramal, chamado, data/hora, duração, modalidade). Prazo semestral com cálculo automático: 2%/dia útil de atraso, teto 10% (>5 dias sinaliza inexecução parcial). Alerta 15/30 dias antes.

### 2.5 Painel de Glosas
Card no painel + seção detalhada: total glosado no período (IAE+IAR+IST) por OS/contrato · Valor contratado × valor efetivamente pago.

---

## FASE 3 — Apêndice B (dados reais) + Portabilidade + Capacidade

**Importador Apêndice B** — reaproveita parser de `src/lib/import-xlsx.ts`. Campos: UF, cidade, unidade, telefone, DDD, prefixo tronco, faixa DDR, total ramais, endereço, CEP, etapa portabilidade (1/2/3). Alimenta Estrutura Organizacional e cria vínculo Unidade↔FaixaDDR.

**Validação de faixa DDR** ao cadastrar Ativo do tipo ramal — alerta se identificador fora da faixa autorizada da unidade.

**Rota `/portabilidade`**:
- Progresso por Etapa (1/2/3) conforme cronograma E1–E7 do Apêndice A.
- Status por unidade (Não iniciada / Em andamento / Concluída).
- Visão de risco por proximidade de prazo.

**Monitor de Capacidade** (card no Painel): ramais DDR / 9.000 · canais estimados / 2.000. Semáforo 80% amarelo, 95% vermelho.

---

## FASE 4 — Fiscalização, Recebimento e Faturamento

**RBAC estendido** (adiciona, não remove): `GESTOR_CONTRATO`, `FISCAL_TECNICO`, `FISCAL_ADMINISTRATIVO`. Vincula aos contratos (campo já previsto na Fase 1).

**Workflow de Recebimento** sobre cada OS concluída:
1. Recebimento Provisório — prazo 10 dias corridos a partir da cobrança (Fiscal Técnico + Administrativo).
2. Recebimento Definitivo — prazo 15 dias após provisório; documento comprobatório com IMR apurado.
3. Liberação para faturamento — Gestor comunica valor líquido de glosas.
4. Liquidação — 10 dias úteis.

Cada etapa gera evento de auditoria; prazos vencidos entram como pendências no Painel/Central de Pendências.

**Entidade `Sancao`** (advertência, multa moratória/compensatória, impedimento, inidoneidade) — vinculada a infração (alíneas a–h do item 8.1 TR), processo administrativo, valor, status (em defesa/aplicada/recorrida).

---

## FASE 5 — Painel Executivo Atualizado

Reformula `/` para gestor de contrato:
- **KPIs IMR do mês** (IAE médio, IAR, IST) com semáforo pelos limites do TR.
- **Valor glosado no período × valor contratado**.
- **Ocupação de capacidade** (ramais/canais).
- **Progresso da portabilidade**.
- **Próximos vencimentos**: garantia, relatório semestral, reajuste, aniversário.
- **Chamados abertos por severidade** (destaque S1/S2 em atraso).
- KPIs MDM/WhatsApp existentes permanecem, em segundo plano visual.

Central de Pendências pessoais por Fiscal já entregue no wrapper do `__root.tsx` (badge no header + drawer com itens acionáveis).

---

## Detalhes Técnicos

- **Persistência**: mantém localStorage do protótipo, mas todas as relações são explícitas por id (`contratoId`, `osId`, `chamadoId`, `unidadeId`, `faixaDdrId`) para facilitar migração futura a Postgres.
- **Auditoria**: novos módulos ("Contratos", "OS", "Chamados", "Sanções", "Portabilidade", "Recebimento") passam pela mesma função `log` de `store.ts`.
- **Cálculos IMR** ficam em `src/lib/imr.ts` (funções puras testáveis).
- **Sem quebra**: Inventário, WhatsApp, Estrutura, Usuários, Auditoria, Admin permanecem; extensões são aditivas (Ativo ganha `unidadeId` e `faixaDdrValidada` opcionais).
- **Ordem sugerida de execução**: Fase 1 → 2 → 3 → 4 → 5. Podemos parar/revisar entre fases.

## Escopo desta rodada de implementação

Se aprovado, executo agora **Fase 1 completa + Fase 2.1 (Ordens de Serviço) + 2.2 (cálculo IAE)** — é a menor unidade que já entrega valor autônomo (contrato cadastrado + primeira OS gerando glosa calculada). As demais fases entram em rodadas seguintes para manter cada entrega testável.
