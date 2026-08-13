# Manual do Administrador - SGT

Sistema de Gestão de Telecomunicações (SGT) - Advocacia-Geral da União.

Este manual é o roteiro operacional do perfil **Administrador Geral**. A versão resumida está disponível dentro do sistema em **Administração > Manual do Administrador**.

---

## 1. Primeiro acesso e segurança

1. Acesse a tela de login centralizada e entre com o e-mail institucional.
2. Ative o **MFA (TOTP)** em `Administração > Autenticação MFA`. A política padrão exige MFA para administradores.
3. Configure a autenticação corporativa:
   - **Active Directory (LDAP):** domínio, servidor, Base DN, grupo de administradores e usuário de serviço.
   - **Microsoft 365 / Entra ID:** tenant, client ID, redirect URI e escopos.
4. Defina o **método primário** de autenticação (Local, AD ou M365).

## 2. Perfis, permissões e escopo

1. Em `Administração > Perfis & Permissões`, ajuste os modelos: Administrador Geral, Gestor Regional, Operador, Auditor, Gestor do Contrato, Fiscal Técnico e Fiscal Administrativo.
2. Em `Usuários`, cadastre o servidor, escolha o perfil e marque as **regiões (SAD)** de escopo.
3. Opcionalmente, restrinja o acesso a **unidades específicas** dentro das regiões autorizadas (granularidade fina).

Detalhes em [`rbac.md`](rbac.md) e [`autenticacao.md`](autenticacao.md).

## 3. Estrutura organizacional e inventário

1. Em `Estrutura`, cadastre a hierarquia **Região (SAD) > Estado > Cidade > Unidade**. Para carga em massa, cole linhas no formato:

   ```
   SAD 4ª Região->Santa Catarina->Florianópolis->PU - Procuradoria da União
   ```

2. Em `Inventário`, cadastre ativos individualmente ou use `Carga em Lote` para planilhas `.xlsx` multi-aba.
3. Informe o **Protocolo AGU Serviços (ITSM)** quando o cadastro decorrer de um chamado.
4. Monitore conformidade MDM e a política institucional no módulo `WhatsApp` (Messenger permitido, Business App vedado).

## 4. Contrato, ordens de serviço e chamados

1. Em `Contratos`, mantenha itens, garantia, reajuste, dotação e fiscalização atualizados. O sistema alerta sobre vencimento de garantia e elegibilidade de reajuste.
2. Emita **Ordens de Serviço** com o tipo correto; o prazo contratual (TCE) é preenchido pelo padrão do tipo.
3. Ao concluir a OS, o **IAE** (TEC - TCE) e a **glosa** são calculados automaticamente. Datas são capturadas pelo sistema, sem digitação manual.
4. Em `Chamados`, registre incidentes com severidade **S1-S5**; a **glosa IST** é apurada ao marcar como solucionado.

## 5. Glosas - onde e como cadastrar

O SGT trabalha com dois caminhos:

**a) Glosas automáticas (apuradas pelos módulos):**

| Indicador | Onde é gerada | Evento que dispara o cálculo |
| --------- | ------------- | ---------------------------- |
| IAE | `Ordens de Serviço` | Conclusão da OS (compara TEC x TCE) |
| IST | `Chamados` | Marcar chamado como solucionado |
| IAR | `Painel de Glosas` (quadro do relatório semestral) | Registro da entrega do relatório |

**b) Glosas lançadas manualmente:**

1. Abra `Painel de Glosas` e selecione o **contrato** e o **período (De/Até)**.
2. No bloco **Cadastro de glosas**, clique em **Cadastrar glosa**.
3. Informe: origem/indicador (IAE, IST, IAR, IDT ou Outra), competência (AAAA-MM), referência (nº da OS, chamado ou unidade), descrição da ocorrência, valor e a memória de cálculo/fundamento contratual.
4. Salve. A data e o autor do lançamento são capturados automaticamente e registrados na auditoria.
5. Após análise da fiscalização, clique em **Homologar**. O valor líquido a pagar do mês é recalculado.

Ajustes de glosa em OS exigem justificativa e ficam registrados com valor original, valor ajustado, ator e data.

## 6. Sanções, portabilidade e auditoria

1. Em `Sanções`, registre infrações conforme o item 8.1 do TR e a Lei 14.133/2021, acompanhando defesa prévia, aplicação e recurso.
2. Em `Portabilidade`, acompanhe as etapas E1-E3 por unidade e as faixas DDR (9.000 ramais / 2.000 canais).
3. Em `Auditoria`, consulte a trilha imutável **Antes > Depois**, filtrando por módulo, ator ou identificador do registro.

## 7. Rotina recomendada

- **Diária:** pendências do Painel Executivo, chamados abertos e OS próximas do prazo.
- **Mensal:** fechamento do Painel de Glosas, homologação dos lançamentos e conferência do valor líquido a pagar.
- **Semestral:** cobrança e registro do relatório IAR.
- **Anual:** garantia contratual, reajuste e revisão de perfis de acesso.
