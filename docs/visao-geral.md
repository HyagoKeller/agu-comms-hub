# Visão Geral

## Problema

A AGU mantém milhares de ativos de telecomunicações - ramais PABX, softphones, chips móveis e números de WhatsApp institucionais - espalhados por todas as unidades da federação. O controle é feito hoje em **planilhas descentralizadas**, o que gera:

- Divergência entre inventário físico e contratual.
- Dificuldade de rastrear alterações (quem mudou o quê, quando).
- Riscos de segurança pelo uso indevido de WhatsApp em dispositivos institucionais.
- Ausência de visão consolidada de custos por unidade, região e tipo de ativo.
- Retrabalho a cada auditoria ou renovação contratual.

## Solução

O **Sistema de Gestão de Telecomunicações (SGT AGU)** é um portal web único que:

1. Consolida em um mesmo repositório todo o ciclo de vida dos ativos.
2. Aplica **trava de conformidade** - WhatsApp Messenger obrigatório; Business vedado.
3. Registra automaticamente toda alteração numa **trilha de auditoria imutável** com valor "antes" e "depois".
4. Permite **carga em lote** das planilhas legadas para migração imediata.
5. Oferece **controle granular de acesso** por região *e* unidade.
6. Integra com o ITSM **AGU Serviços** através do campo de protocolo em cada ativo.

## Objetivos

- Reduzir divergências entre o inventário registrado e o contratado.
- Assegurar rastreabilidade completa das alterações.
- Ampliar a segurança e a governança do uso de WhatsApp institucional.
- Oferecer visão gerencial consolidada de custos e distribuição regional.
- Eliminar controles paralelos em planilhas.

## Escopo

**Está incluso:**

- Inventário de ramais PABX (fixos e softphones), chips móveis e números WhatsApp.
- Estrutura organizacional hierárquica Região → Estado → Cidade → Unidade.
- Custos, bilhetagem, auditoria, RBAC, MFA e integração de autenticação AD/M365.

**Não está incluso (v1):**

- Integração automática com PABX/URA em tempo real (planejado para roadmap).
- Provisionamento automático de linhas móveis nas operadoras.
- Portal de autoatendimento para o usuário final da linha.

## Benefícios esperados

- Governança única e auditável.
- Redução de riscos de segurança e vazamento no uso de WhatsApp institucional.
- Visão integrada de custos por unidade, região e tipo de ativo.
- Eliminação de planilhas descentralizadas.
- Capacidade de importação e carga rápida de dados novos.
- Base para dashboards de indicadores estratégicos.
