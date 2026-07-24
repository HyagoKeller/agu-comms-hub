# SGT AGU - Sistema de Gestão de Telecomunicações

Sistema web da Advocacia-Geral da União (AGU) para governança unificada dos ativos de telecomunicações institucionais: ramais PABX, softphones, chips de operadora e números de WhatsApp, distribuídos entre as 6 Superintendências de Administração (SAD) e suas unidades regionais.

Substitui o controle descentralizado em planilhas por um repositório único, auditável e com trilha completa de alterações (antes/depois).

---

## Sumário

- [Visão geral](#visão-geral)
- [Principais funcionalidades](#principais-funcionalidades)
- [Stack técnica](#stack-técnica)
- [Como executar localmente](#como-executar-localmente)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Módulos do sistema](#módulos-do-sistema)
- [Perfis de acesso (RBAC)](#perfis-de-acesso-rbac)
- [Autenticação e MFA](#autenticação-e-mfa)
- [Documentação complementar](#documentação-complementar)

---

## Visão geral

O SGT AGU centraliza:

- **Inventário unificado** de ramais PABX (fixos e softphones) e linhas móveis com WhatsApp institucional.
- **Estrutura organizacional hierárquica** - Região (SAD) → Estado → Cidade → Unidade.
- **Tabela de custos** por tipo de ativo, com vigência (preserva relatórios históricos em reajustes contratuais).
- **Bilhetagem** consolidada por período, região e tipo.
- **Trava de conformidade WhatsApp**: apenas Messenger é permitido; WhatsApp Business é vedado; WABA institucional é auditado à parte.
- **Auditoria imutável**: quem, quando, o quê, antes → depois.
- **Gestão de acesso granular** por região *e* por unidade.
- **Integração com AGU Serviços (ITSM)** via campo de protocolo em cada ativo.

## Principais funcionalidades

- Cadastro/edição de ativos com validação de MAC e regras de MDM.
- Carga em lote de planilhas `.xlsx` com múltiplas abas, reconhecendo automaticamente PABX, móvel e WhatsApp.
- Painel de resumo com KPIs (ramais, linhas móveis, conformidade MDM, violações).
- Área dedicada de gestão de números WhatsApp (Messenger pessoal, WABA institucional, Business App).
- Configuração de autenticação por AD (LDAP) e Microsoft 365 / Entra ID.
- Políticas de MFA (TOTP) - obrigatório para admins ou para todos.
- Templates de perfil customizáveis dentro do painel Admin.

## Stack técnica

- **Framework:** TanStack Start v1 (React 19 + Vite 7, SSR-ready)
- **Roteamento:** TanStack Router (file-based em `src/routes/`)
- **Estado:** store observável leve (`src/lib/store.ts`) + `useSyncExternalStore`
- **Estilo:** Tailwind CSS v4 (design tokens em `src/styles.css`)
- **UI base:** shadcn/ui + Lucide Icons
- **Persistência:** `localStorage` (protótipo institucional - sem backend obrigatório)
- **Import de planilhas:** `xlsx` (SheetJS)
- **Deploy:** Cloudflare Workers (via wrangler)

## Como executar localmente

Requisitos: [Bun](https://bun.sh) 1.x.

```bash
bun install
bun run dev        # dev server em http://localhost:8080
bun run build      # build de produção
```

### Login de demonstração

Na tela `/login`, escolha um dos 3 perfis pré-cadastrados:

| Perfil            | E-mail                    | Escopo                          |
| ----------------- | ------------------------- | ------------------------------- |
| Admin Geral       | `admin@agu.gov.br`        | Todas as regiões, tudo permitido |
| Gestora Regional  | `gestora.r3@agu.gov.br`   | Apenas R3 (SAD 3ª Região)       |
| Auditor           | `auditor@agu.gov.br`      | Todas as regiões, leitura       |

Qualquer senha é aceita (protótipo).

## Estrutura de pastas

```
src/
├── routes/                 # rotas file-based do TanStack Router
│   ├── __root.tsx         # layout raiz + gate de login
│   ├── index.tsx          # painel/dashboard
│   ├── inventario.*.tsx   # listagem, cadastro, importação
│   ├── whatsapp.tsx       # gestão de números WhatsApp
│   ├── custos.tsx         # tabela de custos com vigência
│   ├── bilhetagem.tsx     # painel de bilhetagem
│   ├── estrutura.tsx      # estrutura organizacional hierárquica
│   ├── usuarios.tsx       # gestão de usuários + escopo por unidade
│   ├── admin.tsx          # templates de perfil, MFA, AD, M365
│   ├── auditoria.tsx      # trilha antes/depois
│   └── login.tsx          # autenticação centralizada + MFA
├── components/            # GovHeader, StatusTag, AguLogo
├── lib/
│   ├── types.ts           # tipos de domínio (Ativo, Unidade, Regiao...)
│   ├── store.ts           # store observável + auditoria automática
│   ├── auth.ts            # sessão, MFA, políticas
│   └── import-xlsx.ts     # parser multi-aba de planilhas
└── styles.css             # design tokens Tailwind v4
```

## Módulos do sistema

Ver [`docs/modulos.md`](docs/modulos.md) para o detalhamento completo de cada módulo.

## Perfis de acesso (RBAC)

Ver [`docs/rbac.md`](docs/rbac.md).

## Autenticação e MFA

Ver [`docs/autenticacao.md`](docs/autenticacao.md).

## Documentação complementar

- [`docs/visao-geral.md`](docs/visao-geral.md) - objetivos, escopo e benefícios
- [`docs/arquitetura.md`](docs/arquitetura.md) - decisões técnicas
- [`docs/modulos.md`](docs/modulos.md) - funcionalidade a funcionalidade
- [`docs/modelo-de-dados.md`](docs/modelo-de-dados.md) - entidades e relacionamentos
- [`docs/rbac.md`](docs/rbac.md) - perfis, permissões e escopo por unidade
- [`docs/autenticacao.md`](docs/autenticacao.md) - login, MFA, AD e M365
- [`docs/importacao-planilhas.md`](docs/importacao-planilhas.md) - carga em lote
- [`docs/auditoria.md`](docs/auditoria.md) - trilha imutável
- [`docs/whatsapp.md`](docs/whatsapp.md) - política e categorias
- [`docs/guia-do-usuario.md`](docs/guia-do-usuario.md) - passo a passo por perfil
- [`docs/roadmap.md`](docs/roadmap.md) - próximos passos

---

© Advocacia-Geral da União - Uso institucional.
