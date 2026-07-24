# Contribuindo com o SGT AGU

Obrigado por contribuir. Este documento resume as convenções do projeto.

## Ambiente

- **Bun** 1.x
- Node não é necessário (Bun cobre install/run).

```bash
bun install
bun run dev      # http://localhost:8080
bun run build
```

## Convenções de código

- **TypeScript estrito** em todo o `src/`.
- **Tailwind v4** com tokens semânticos (`bg-gov-blue`, `text-gov-blue-dark`) - nunca cores literais.
- **Componentes shadcn** vivem em `src/components/ui/`.
- **Rotas** file-based em `src/routes/` - nunca editar `src/routeTree.gen.ts` manualmente.
- **Store**: toda mutação passa por `src/lib/store.ts` (para preservar a trilha de auditoria).

## Fluxo de trabalho

1. Crie uma branch a partir de `main`.
2. Faça commits pequenos e descritivos (`feat:`, `fix:`, `docs:`, `refactor:`).
3. Abra Pull Request com descrição do que muda e prints, quando aplicável.
4. Aguarde revisão de outro engenheiro antes de merge.

## Testes manuais mínimos

Antes de abrir PR, valide:

- Login em cada um dos 3 perfis de demonstração.
- Cadastro, edição e exclusão de um ativo - conferindo o registro em `/auditoria`.
- Importação de uma planilha `.xlsx` de exemplo.
- Cadastro de uma unidade nova no fluxo em cascata.

## Reportando bugs

Abra uma issue com:

- Passos para reproduzir.
- Comportamento esperado vs. observado.
- Perfil logado e rota.
- Prints/console quando houver erro.
