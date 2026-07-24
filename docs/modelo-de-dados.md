# Modelo de Dados

Todos os tipos estão em `src/lib/types.ts`.

## Regiao (enum)

`R1 | R2 | R3 | R4 | R5 | R6` - correspondendo às 6 Superintendências de Administração (SAD) da AGU.

## Ativo

Representa um ramal PABX, softphone ou chip móvel com WhatsApp institucional.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | Identificador interno |
| `categoria` | `PABX \| MOVEL` | Grupo do ativo |
| `identificador` | string | Nº do ramal ou MSISDN |
| `tipo` | `RAMAL_FISICO \| SOFTPHONE \| CHIP_OPERADORA` | Subtipo |
| `catWhats` | `MESSENGER_PESSOAL \| WABA_INSTITUCIONAL \| null` | Categoria WhatsApp (apenas MOVEL) |
| `regiao` / `unidade` / `sala` | strings | Localização |
| `usuarioNome` / `usuarioLogin` / `setor` | strings | Responsável |
| `dataAtribuicao` | string (ISO) | Quando foi atribuído |
| `enderecoMac` | string | MAC (validado para RAMAL_FISICO/SOFTPHONE) |
| `status` | `ATIVO \| DISPONIVEL \| MANUTENCAO \| BLOQUEADO \| INATIVO` | Status operacional |
| `statusMDM` | `CONFORME \| NAO_SINCRONIZADO \| VIOLACAO \| NA` | Status MDM |
| `statusTermo` | `ASSINADO \| PENDENTE \| NA` | Termo de responsabilidade |
| `protocoloAGUServicos` | string | Nº do chamado ITSM AGU Serviços |
| `observacoes`, `anexos`, `dominio`, `ip`, `modeloAparelho`, `fabricante`, `permissaoChamada`, `hotdesking`, `origemImport` | strings | Campos adicionais herdados da planilha legada |
| `criadoEm` | string (ISO) | Timestamp |

## Unidade

Nó folha da estrutura organizacional.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | Identificador |
| `nome` | string | Ex.: "PU - Procuradoria da União" |
| `regiao` | Regiao | R1..R6 |
| `regiaoLabel` | string | "SAD 4ª Região" |
| `estado` | string | "Santa Catarina" |
| `cidade` | string | "Florianópolis" |

## WhatsappNumero

Registro dedicado para o módulo WhatsApp (independente do inventário genérico).

Campos-chave: `msisdn`, `operadora`, `plano`, `categoria` (`MESSENGER_PESSOAL | WABA_INSTITUCIONAL | BUSINESS_APP`), `responsavelNome`, `responsavelLogin`, `setor`, `regiao`, `unidade`, `imei`, `statusMDM`, `statusTermo`, `status`, `dataAtivacao`, `observacoes`.

## CustoItem

Preço unitário de um tipo de ativo em uma vigência.

| Campo | Tipo |
|---|---|
| `tipo` | `AtivoTipo` |
| `valorMensal` | number (BRL) |
| `vigenciaInicio` | string (`AAAA-MM`) |
| `vigenciaFim?` | string (`AAAA-MM`) |

## PerfilUsuario

| Campo | Descrição |
|---|---|
| `perfil` | `ADMIN_GERAL \| GESTOR_REGIONAL \| OPERADOR \| AUDITOR` |
| `regioes` | Regiões permitidas |
| `unidades?` | Escopo granular por unidade (opcional) |
| `permissoes` | Objeto `Permissoes` (ver abaixo) |
| `mfaEnabled` / `mfaSecret` | MFA por usuário |

## Permissoes

Flags booleanas: `verCadastro`, `editar`, `excluir`, `gerirCustos`, `importarBilhetagem`, `gerirUsuarios`, `gerirEstrutura`, `exportarRelatorios`.

## AuditoriaLog

| Campo | Descrição |
|---|---|
| `ts` | Timestamp ISO |
| `ator` | Nome do usuário logado |
| `modulo` | Módulo afetado |
| `acao` | `CRIAR \| EDITAR \| EXCLUIR \| IMPORTAR \| EXPORTAR` |
| `registroId?` | ID do registro |
| `antes?` / `depois?` | Snapshots dos campos alterados |

## AuthConfig

Configuração global de autenticação:

- `metodoPrimario`: `LOCAL | AD | M365`
- `mfaObrigatorioAdmin` / `mfaObrigatorioTodos`
- `ad`: `{ habilitado, dominio, servidor, baseDN, grupoAdmin, usuarioServico }`
- `m365`: `{ habilitado, tenantId, clientId, clientSecretConfigurado, redirectUri, escopos }`
