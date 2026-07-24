# Autenticação e MFA

## Tela de login (`/login`)

Layout centralizado em card único, com:

1. Seleção do método (Local / AD / Microsoft 365) conforme política definida em Admin.
2. Campos e-mail + senha.
3. Fluxo TOTP quando o usuário tem MFA ativo ou a política obriga.
4. Botões de acesso rápido aos 3 perfis de demonstração.

Após login bem-sucedido, a sessão é armazenada em `localStorage` (`agu-auth-v1`) e o gate em `src/routes/__root.tsx` libera as rotas internas.

## Métodos suportados

### Local
Usuários criados em `/usuarios`. Senha validada localmente (protótipo - qualquer senha é aceita para os perfis de demo).

### Active Directory (LDAP)
Configurável em **Admin → Autenticação → Active Directory**:

- Domínio (ex.: `AGU.GOV.BR`)
- Servidor LDAP (ex.: `ldap://dc.agu.gov.br`)
- Base DN (ex.: `OU=Usuarios,DC=agu,DC=gov,DC=br`)
- Grupo Admin (ex.: `CN=SGT-Admins`)
- Usuário de serviço

### Microsoft 365 / Entra ID
Configurável em **Admin → Autenticação → Microsoft 365**:

- Tenant ID
- Client ID
- Client Secret (marcado como configurado, valor real via secret manager)
- Redirect URI
- Escopos (padrão `openid profile email`)

## MFA (TOTP)

### Políticas globais
- **Obrigatório para admins**: qualquer perfil `ADMIN_GERAL` precisa configurar MFA.
- **Obrigatório para todos**: força MFA em toda a base.

### Ativação individual
Usuário acessa **Admin → MFA** (ou o próprio perfil):

1. Sistema gera um segredo `otpauth://totp/AGU:usuario?secret=...&issuer=SGT-AGU`.
2. Usuário escaneia o QR/URL num app compatível (Google Authenticator, Microsoft Authenticator, Authy).
3. Digita o código de 6 dígitos gerado para confirmar.
4. `mfaEnabled` é marcado como `true` e o segredo persistido.

### Login com MFA
Após validar credencial primária, o usuário é redirecionado para o passo TOTP. O código é validado; a sessão só é criada quando aprovado.

## Boas práticas
- Em produção, mover segredos MFA e credenciais AD/M365 para um vault (Cloudflare secrets, Azure Key Vault etc.).
- Habilitar MFA obrigatório ao menos para administradores.
- Registrar todas as tentativas de login (sucesso/falha) na trilha de auditoria.
