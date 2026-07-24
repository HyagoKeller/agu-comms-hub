# Controle de Acesso (RBAC)

## Perfis padrão

| Perfil              | Descrição                                                                 |
| ------------------- | ------------------------------------------------------------------------- |
| **Admin Geral**     | Tudo permitido em todas as regiões. Único que gerencia usuários e admin.  |
| **Gestor Regional** | Gerencia inventário e ativos da(s) sua(s) região(ões). Não exclui, não gere custos, usuários ou estrutura. |
| **Operador**        | Cadastra e edita ativos no escopo autorizado.                             |
| **Auditor**         | Somente leitura em todas as regiões, sem editar/excluir.                  |

## Matriz de permissões

| Permissão              | Admin | Gestor Regional | Operador | Auditor |
| ---------------------- | :---: | :-------------: | :------: | :-----: |
| Ver cadastro           |  ✔    |       ✔         |    ✔     |    ✔    |
| Editar                 |  ✔    |       ✔         |    ✔     |    –    |
| Excluir                |  ✔    |       –         |    –     |    –    |
| Gerir custos           |  ✔    |       –         |    –     |    –    |
| Importar bilhetagem    |  ✔    |       ✔         |    ✔     |    –    |
| Gerir usuários         |  ✔    |       –         |    –     |    –    |
| Gerir estrutura        |  ✔    |       –         |    –     |    –    |
| Exportar relatórios    |  ✔    |       ✔         |    ✔     |    ✔    |

Templates podem ser customizados em **Admin → Templates de Perfil**.

## Escopo por região e unidade

O escopo do usuário combina duas listas:

- `regioes`: as SADs em que ele atua (R1..R6).
- `unidades` *(opcional)*: quando informada, restringe a visão às unidades específicas — mesmo dentro de uma região autorizada, ele só vê essas unidades.

Se `unidades` estiver vazio, o usuário enxerga **todas as unidades das regiões atribuídas**.

### Exemplos

- **Gestora R3**: `regioes: ["R3"]`, `unidades: undefined` → vê todas as unidades da SAD 3ª Região.
- **Coordenador de PU Florianópolis**: `regioes: ["R4"]`, `unidades: ["PU - Procuradoria da União (Florianópolis)"]` → só enxerga essa unidade, mesmo tendo R4 no escopo.
- **Admin**: `regioes: ["R1"..."R6"]`, `unidades: undefined` → visão total.

O escopo é editado em **Usuários → Editar escopo**.

## Aplicação
- No filtro padrão das listagens (Inventário, WhatsApp).
- Nos totais do Painel.
- Nas exportações — usuário nunca exporta dados fora do seu escopo.
