# Guia do Usuário

## Primeiro acesso

1. Acesse a URL do SGT.
2. Faça login com seu e-mail institucional.
3. Se solicitado, configure o **MFA** escaneando o QR/URL no seu app autenticador.
4. Você será direcionado ao **Painel**.

## Como cadastrar um ativo

1. Menu **Inventário → Cadastrar Ativo** (ou botão `+ Cadastrar` no painel).
2. Escolha a **categoria** (PABX ou Móvel) e o **tipo**.
3. Preencha identificador (ramal ou MSISDN).
4. Selecione a **região** e a **unidade** — o combo já filtra por seu escopo.
5. Informe o **responsável** (nome, login, setor).
6. Preencha status operacional, MDM e termo de responsabilidade.
7. Se o cadastro está associado a um chamado, informe o **Protocolo AGU Serviços (ITSM)**.
8. Salve.

## Como importar uma planilha

1. Menu **Inventário → Carga em Lote**.
2. Selecione o arquivo `.xlsx`.
3. Confira a pré-visualização (aba a aba, contadores por tipo).
4. Confirme.

Ver [`importacao-planilhas.md`](importacao-planilhas.md).

## Como gerir números WhatsApp

1. Menu **WhatsApp**.
2. Use os KPIs para identificar violações (Business App).
3. Filtre por região/categoria.
4. Clique em **Novo número** ou no ícone de editar para ajustar dados.

## Como cadastrar unidades da estrutura

1. Menu **Estrutura**.
2. Selecione **Região → Estado → Cidade → Unidade** no formulário em cascata.
3. Para carga em massa, cole linhas no formato:

   ```
   SAD 4ª Região->Santa Catarina->Florianópolis->PU - Procuradoria da União
   ```

4. Confirme a importação.

## Como conceder acesso a um novo servidor

1. Menu **Usuários → Novo usuário**.
2. Preencha nome, e-mail e escolha o **perfil**.
3. Marque as **regiões** de escopo.
4. (Opcional) Restrinja a **unidades** específicas.
5. Salve. O convite será enviado (em produção) ou o usuário poderá logar com AD/M365 conforme política.

## Como consultar auditoria

1. Menu **Auditoria**.
2. Filtre por módulo, ator ou ID do registro.
3. Clique num evento para ver **Antes → Depois** dos campos modificados.
