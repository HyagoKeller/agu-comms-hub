# Importação de Planilhas (Carga em Lote)

Fluxo dedicado para migrar o controle legado em Excel para o SGT sem retrabalho.

## Como usar

1. Vá em **Inventário → Carga em Lote** (`/inventario/importar`).
2. Selecione o arquivo `.xlsx` (a planilha oficial de controle da AGU).
3. O sistema lê **todas as abas** do arquivo.
4. É exibida uma **pré-visualização** com contadores por aba e por tipo detectado (PABX, Móvel, WhatsApp).
5. Confirme a importação - os registros entram no inventário e um evento é gravado em auditoria (`acao: IMPORTAR`).

## O que o parser reconhece

O parser (`src/lib/import-xlsx.ts`) inspeciona os cabeçalhos de cada aba e faz o mapeamento automático dos campos mais comuns:

| Cabeçalho da planilha | Campo interno |
|---|---|
| Ramal, Número, MSISDN, Linha | `identificador` |
| Tipo, Modelo, Categoria | `tipo`, `categoria` |
| Usuário, Responsável, Servidor | `usuarioNome` |
| Login, Matrícula | `usuarioLogin` |
| Setor, Área, Departamento | `setor` |
| Região, SAD | `regiao` |
| Unidade, Órgão, Lotação | `unidade` |
| Sala | `sala` |
| MAC | `enderecoMac` (validado) |
| IMEI | `imei` |
| Operadora, Plano | `operadora`, `plano` |
| Status | `status` |
| MDM | `statusMDM` |
| Termo | `statusTermo` |
| Protocolo AGU Serviços, Chamado ITSM | `protocoloAGUServicos` |
| Observações, Obs | `observacoes` |

Colunas não reconhecidas são preservadas em `origemImport` para posterior curadoria.

## Classificação automática
- Se a aba tiver **MSISDN** ou colunas típicas de móvel (IMEI, Operadora), os registros vão para **MOVEL** e, se houver marca de WhatsApp, também para o módulo **WhatsApp**.
- Caso contrário, vão para **PABX** (subtipos definidos por `Tipo`: aparelho físico ou softphone).

## Boas práticas
- Antes de importar, tenha uma cópia da planilha original - a auditoria registra a carga, mas rollback manual é trabalhoso.
- Padronize colunas de região para `R1..R6` ou `SAD 1ª Região..SAD 6ª Região`.
- Certifique-se de que MSISDNs estejam em formato E.164 (`+5561...`) - o parser tenta normalizar, mas dados fora do padrão viram alerta.
