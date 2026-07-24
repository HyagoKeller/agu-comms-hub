# Auditoria

## Princípios

- **Imutável** — logs nunca são editados nem removidos pela UI.
- **Automática** — toda mutação passa pela store (`src/lib/store.ts`), que grava o evento; não há caminho paralelo de escrita.
- **Rastreável** — cada evento identifica ator, timestamp, módulo, ação, registro afetado e o par `antes` / `depois` dos campos modificados.

## Estrutura de um evento

```json
{
  "id": "log_...",
  "ts": "2026-01-14T18:35:22.401Z",
  "ator": "Admin AGU",
  "modulo": "Inventário",
  "acao": "EDITAR",
  "registroId": "at_123",
  "antes": { "statusMDM": "NAO_SINCRONIZADO" },
  "depois": { "statusMDM": "CONFORME" }
}
```

Ações possíveis: `CRIAR`, `EDITAR`, `EXCLUIR`, `IMPORTAR`, `EXPORTAR`.

## Onde consultar

Página **Auditoria** (`/auditoria`), disponível para todos os perfis com permissão de leitura:

- Filtro por módulo, ator ou ID do registro.
- Visualização lado a lado **ANTES → DEPOIS**.
- Tags coloridas indicando a natureza da ação (edição, exclusão, criação, importação).

## Módulos rastreados

- Inventário (cadastros, edições, exclusões, importações)
- WhatsApp
- Estrutura Organizacional
- Custos
- Usuários
- Autenticação (login/logout, alteração de MFA, alterações em AD/M365)
- Templates de perfil

## Retenção

No protótipo, os logs vivem no `localStorage` — em produção devem ser persistidos em base transacional com política de retenção definida pela AGU (recomendação: mínimo 5 anos para atender exigências de auditoria pública).
