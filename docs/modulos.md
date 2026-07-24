# Módulos do Sistema

## 1. Painel (`/`)

Visão executiva com KPIs:

- Total de ramais PABX
- Total de linhas móveis WhatsApp
- Ativos em conformidade MDM
- Violações MDM detectadas
- Distribuição por região (barras)
- Trava de Conformidade WhatsApp
- Últimos eventos auditados

## 2. Inventário (`/inventario`)

Listagem unificada de PABX + Móvel com:

- Busca global (identificador, usuário, login, MAC, protocolo AGU Serviços).
- Filtros por região, categoria, tipo, status operacional e status MDM.
- Colunas: identificador, tipo, categoria WhatsApp, região/unidade, responsável, status, protocolo ITSM.
- Ações: editar, excluir (com confirmação e registro em auditoria).

### Cadastro / Edição (`/inventario/novo`)

Formulário completo com seções:

- **Identificação** - categoria, tipo, identificador, MAC (validado).
- **Localização** - região, unidade, sala.
- **Responsável** - nome, login, setor, data de atribuição.
- **Documentação** - status termo, protocolo AGU Serviços (ITSM), observações, anexos.
- **Status operacional** - Ativo / Disponível / Manutenção / Bloqueado / Inativo.
- **MDM / Conformidade** - status MDM, categoria WhatsApp (para linhas móveis).

### Carga em Lote (`/inventario/importar`)

Upload de `.xlsx` da planilha legada:

1. Lê **todas as abas** do arquivo.
2. Identifica automaticamente colunas de PABX, móvel e WhatsApp.
3. Mostra pré-visualização com contadores por aba/tipo.
4. Confirma a carga com registro em auditoria.

Ver [`importacao-planilhas.md`](importacao-planilhas.md).

## 3. WhatsApp (`/whatsapp`)

Área dedicada aos números WhatsApp institucionais:

- **KPIs:** Messenger Pessoal, WABA Institucional, Business App (violação), MDM em conformidade.
- **Filtros:** busca, região, categoria, status MDM.
- **Tabela:** MSISDN, categoria, responsável, região/unidade, IMEI, status MDM, termo, status.
- **Cadastro/Edição** por modal, incluindo operadora, plano, IMEI, termo de responsabilidade e data de ativação.

Ver [`whatsapp.md`](whatsapp.md).

## 4. Estrutura Organizacional (`/estrutura`)

Hierarquia **Região (SAD) → Estado → Cidade → Unidade**.

- Formulário em cascata com autocomplete de estados e cidades já cadastrados.
- Importação em lote colando linhas no formato:

  ```
  SAD 4ª Região->Santa Catarina->Florianópolis->PU - Procuradoria da União
  SAD 5ª Região->Ceará->Fortaleza->PF - Procuradoria Federal
  ```

- Visualização em árvore navegável.

## 5. Custos (`/custos`)

Tabela de valores unitários por tipo de ativo com **vigência**:

- Valor mensal (R$).
- Data de início e (opcional) fim.
- Tag automática "Vigente" / "Histórico".
- Preserva relatórios passados ao registrar reajustes contratuais.

## 6. Bilhetagem (`/bilhetagem`)

Painel de resumo consolidado por período, região e tipo. Base para futuros relatórios detalhados de chamadas.

## 7. Relatórios (`/relatorios`)

Exportação de listagens filtradas em CSV/Excel para uso externo (auditoria, licitação, gestão contratual).

## 8. Usuários (`/usuarios`)

Cadastro e edição de perfis operacionais:

- Nome, e-mail, perfil (Admin, Gestor Regional, Operador, Auditor).
- Regiões atribuídas.
- **Escopo granular por unidade** (opcional) - quando marcado, o usuário vê apenas as unidades selecionadas dentro das regiões atribuídas.
- MFA ativo ou não.

## 9. Admin (`/admin`)

Painel do Administrador Geral:

- **Templates de perfil customizáveis** - cria/edita presets de permissões.
- **Política de MFA** - obrigatório para admins ou para todos.
- **Active Directory** - domínio, servidor LDAP, Base DN, grupo admin, usuário de serviço.
- **Microsoft 365 / Entra ID** - Tenant ID, Client ID, Redirect URI, escopos, flag de Client Secret.

## 10. Auditoria (`/auditoria`)

Trilha imutável de eventos:

- Ator, timestamp, módulo, ação, registro.
- Visualização lado a lado **Antes → Depois** de cada campo alterado.
- Filtro por módulo, ator ou ID.

Ver [`auditoria.md`](auditoria.md).
