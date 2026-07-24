# WhatsApp Institucional

## Política de uso

Nas linhas móveis institucionais é permitido **exclusivamente o WhatsApp Messenger**. O uso de **WhatsApp Business** em dispositivos corporativos é **vedado** e caracteriza violação de conformidade.

O uso de **WABA (WhatsApp Business API)** é permitido apenas em contas **institucionais** aprovadas - nunca em dispositivos pessoais dos servidores.

## Categorias no SGT

| Categoria | Uso | Aparece no painel como |
|---|---|---|
| `MESSENGER_PESSOAL` | App Messenger em chip institucional atribuído a um servidor | Verde / Conforme |
| `WABA_INSTITUCIONAL` | Números conectados à API oficial em canais institucionais | Azul / Institucional |
| `BUSINESS_APP` | Aplicativo WhatsApp Business detectado - violação | Vermelho / Violação |

## Módulo WhatsApp (`/whatsapp`)

- **KPIs:** Messenger, WABA, Business App, MDM em conformidade.
- **Filtros:** busca (MSISDN, responsável, login), região, categoria, status MDM.
- **Tabela:** MSISDN, categoria, responsável, região/unidade, IMEI, MDM, termo, status.
- **Cadastro/edição por modal:** operadora, plano, IMEI, categoria, responsável, região/unidade, termo de responsabilidade, data de ativação, observações.

## Trava de conformidade

O painel principal exibe a "Trava de Conformidade" com contadores em tempo real de:

- **Conformes** - número correto de linhas Messenger auditadas pelo MDM.
- **Não sincronizados** - dispositivos sem retorno recente do MDM.
- **Violações** - presença de WhatsApp Business ou app não autorizado.

Cada violação gera evento em auditoria e deve ser tratada pela equipe da SAD responsável.
