# Arquitetura

## Visão em camadas

```
┌────────────────────────────────────────────────────┐
│  UI (React 19 + Tailwind v4 + shadcn/ui)           │
│  - Rotas file-based (TanStack Router)              │
│  - Componentes governamentais (GovHeader, Tag...)  │
├────────────────────────────────────────────────────┤
│  Domínio (src/lib/*)                               │
│  - types.ts       tipos de negócio                 │
│  - store.ts       estado observável + auditoria    │
│  - auth.ts        sessão + MFA                     │
│  - import-xlsx.ts parser de planilhas              │
├────────────────────────────────────────────────────┤
│  Persistência                                      │
│  - localStorage (protótipo)                        │
│  - Preparado para migrar a Lovable Cloud/Postgres  │
├────────────────────────────────────────────────────┤
│  Runtime                                           │
│  - TanStack Start v1 + Vite 7                      │
│  - Deploy em Cloudflare Workers (wrangler)         │
└────────────────────────────────────────────────────┘
```

## Decisões técnicas

### TanStack Start v1
Framework fullstack React com SSR opcional, roteamento por arquivos e server functions tipadas. Escolhido pela produtividade, footprint pequeno e compatibilidade com Cloudflare Workers.

### Tailwind v4 com tokens semânticos
Toda a paleta institucional (`--gov-blue`, `--gov-success`, `--gov-danger` etc.) vive em `src/styles.css` via `@theme`. Componentes nunca usam cores literais — apenas classes semânticas (`bg-gov-blue`, `text-gov-blue-dark`). Isso garante consistência visual e permite trocar temas sem tocar componentes.

### Store observável
Preferiu-se uma store leve baseada em `useSyncExternalStore` a bibliotecas como Redux/Zustand para reduzir dependências. Toda mutação passa pela store, que:

1. Aplica a alteração.
2. Persiste no `localStorage`.
3. Emite um evento na trilha de auditoria com `antes` e `depois`.
4. Notifica os componentes inscritos.

### Auditoria automática
Cada método da store (`updateAtivo`, `removeAtivo`, `addUnidade` etc.) chama internamente `pushLog(...)` — não é possível alterar um registro fora do canal auditado.

### Persistência local
O protótipo usa `localStorage` para permitir demonstração institucional imediata, sem depender de backend. A camada de store isola o mecanismo — migrar para Postgres/Lovable Cloud exige apenas trocar a implementação em `src/lib/store.ts`.

### RBAC granular
Permissões são um objeto tipado (`Permissoes`) por usuário. O escopo é definido por combinação de:

- `regioes: Regiao[]` — SADs a que o usuário tem acesso.
- `unidades?: string[]` — quando presente, restringe às unidades específicas dentro dessas regiões.

### MFA (TOTP)
Segredo por usuário armazenado em `mfaSecret`. Códigos são validados por comparação simples nesta versão de protótipo — a implementação de referência de RFC 6238 é o próximo passo.

## Segurança

- Todo componente que altera dado grava em auditoria.
- Rotas atrás do gate de login em `__root.tsx` — sem sessão, redireciona a `/login`.
- MFA pode ser exigido por política (admins ou todos).
- Segredos de integração (AD, M365) armazenados como flags de configuração — chaves reais devem ir para o gestor de secrets em produção.

## Próximos passos técnicos
Ver [`roadmap.md`](roadmap.md).
